import { Request, Response } from 'express';
import { z } from 'zod';
import CommentModel from '../database/commentModel.ts';
import ThreadModel, { ThreadStatus } from '../database/threadModel.ts';
import { AuthRequest, UserRole } from '../types/index.ts';

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().optional()
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000)
});

export class CommentController {
  static async getThreadComments(req: AuthRequest, res: Response) {
    try {
      const { threadId } = req.params;

      const thread = await ThreadModel.findById(threadId);
      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }
      
      // Only show comments for approved threads (unless admin)
      const isAdmin = req.user?.role === UserRole.ADMIN;
      if (!isAdmin && thread.status !== ThreadStatus.APPROVED) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      const comments = await CommentModel.find({
        thread: threadId,
        isActive: true
      })
        .populate('author', 'username profilePictureUrl')
        .sort({ createdAt: 1 });

      const commentMap = new Map<string, any>();

      // Store comments in map
      comments.forEach((comment) => {
        commentMap.set(comment._id.toString(), {
          id: comment._id.toString(),
          content: comment.content,
          author: {
            id: (comment.author as any)._id.toString(),
            username: (comment.author as any).username,
            profilePictureUrl: (comment.author as any).profilePictureUrl
          },
          parentComment: comment.parentComment
            ? comment.parentComment.toString()
            : null,
          likes: comment.likes.length,
          userLiked: req.user
            ? comment.likes.some((likeId) => likeId.toString() === req.user!.userId)
            : false,
          replies: [],
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt
        });
      });

      // Connect replies to parents
      commentMap.forEach((comment) => {
        if (comment.parentComment) {
          const parent = commentMap.get(comment.parentComment);
          if (parent) {
            parent.replies.push(comment);
          }
        }
      });

      // Only return root comments
      const parentComments = Array.from(commentMap.values()).filter(
        (comment) => comment.parentComment === null
      );

      res.json({
        success: true,
        data: parentComments
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async createComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;
      const validatedData = createCommentSchema.parse(req.body);

      // Verify thread exists and is approved
      const thread = await ThreadModel.findById(threadId);
      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }
      
      // Only allow comments on approved threads
      if (thread.status !== ThreadStatus.APPROVED) {
        return res.status(403).json({
          success: false,
          message: 'Cannot comment on threads that are not approved'
        });
      }

      // If parent comment is provided, verify it exists
      if (validatedData.parentCommentId) {
        const parentComment = await CommentModel.findById(validatedData.parentCommentId);
        if (!parentComment || !parentComment.isActive) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      const comment = await CommentModel.create({
        content: validatedData.content,
        author: req.user.userId,
        thread: threadId,
        parentComment: validatedData.parentCommentId || null
      });

      const populatedComment = await CommentModel.findById(comment._id)
        .populate('author', 'username profilePictureUrl');

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: {
          id: populatedComment!._id.toString(),
          content: populatedComment!.content,
          author: {
            id: (populatedComment!.author as any)._id.toString(),
            username: (populatedComment!.author as any).username,
            profilePictureUrl: (populatedComment!.author as any).profilePictureUrl
          },
          thread: populatedComment!.thread.toString(),
          parentComment: populatedComment!.parentComment?.toString() || null,
          likes: populatedComment!.likes.length,
          userLiked: false,
          replies: [],
          createdAt: populatedComment!.createdAt,
          updatedAt: populatedComment!.updatedAt
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async updateComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { commentId } = req.params;
      const validatedData = updateCommentSchema.parse(req.body);

      const comment = await CommentModel.findById(commentId);

      if (!comment || !comment.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check if user is the author or admin
      if (
        comment.author.toString() !== req.user.userId &&
        req.user.role === UserRole.USER
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments'
        });
      }

      comment.content = validatedData.content;
      await comment.save();

      const updatedComment = await CommentModel.findById(commentId)
        .populate('author', 'username profilePictureUrl');

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: {
          id: updatedComment!._id.toString(),
          content: updatedComment!.content,
          author: {
            id: (updatedComment!.author as any)._id.toString(),
            username: (updatedComment!.author as any).username,
            profilePictureUrl: (updatedComment!.author as any).profilePictureUrl
          },
          thread: updatedComment!.thread.toString(),
          parentComment: updatedComment!.parentComment?.toString() || null,
          likes: updatedComment!.likes.length,
          createdAt: updatedComment!.createdAt,
          updatedAt: updatedComment!.updatedAt
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { commentId } = req.params;

      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check if user is the author or admin
      if (
        comment.author.toString() !== req.user.userId &&
        req.user.role === UserRole.USER
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      // Soft delete
      comment.isActive = false;
      await comment.save();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async toggleLikeComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      const { commentId } = req.params;

      const comment = await CommentModel.findById(commentId);

      if (!comment || !comment.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const userId = req.user.userId;
      const likeIndex = comment.likes.findIndex(
        (likeId) => likeId.toString() === userId
      );

      if (likeIndex > -1) {
        // Unlike
        comment.likes.splice(likeIndex, 1);
      } else {
        // Like
        comment.likes.push(userId as any);
      }

      await comment.save();

      res.json({
        success: true,
        message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
        data: {
          likes: comment.likes.length,
          userLiked: likeIndex === -1
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
}

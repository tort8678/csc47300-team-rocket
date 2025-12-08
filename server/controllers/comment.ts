import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import CommentModel from '../database/commentModel.ts';
import ThreadModel, { ThreadStatus } from '../database/threadModel.ts';
import { AuthRequest, UserRole } from '../types/index.ts';
import { isAdmin } from '../middleware/auth.ts';
import { uploadFileToGridFS, getFileFromGridFS, getFileInfoFromGridFS } from '../services/gridfs.ts';

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
      const isAdminUser = req.user ? isAdmin(req.user.role) : false;
      if (!isAdminUser && thread.status !== ThreadStatus.APPROVED) {
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
          attachments: comment.attachments ? comment.attachments.map((id: any) => id.toString()) : [],
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
      
      // Handle both JSON and FormData
      let content: string, parentCommentId: string | undefined;
      let attachments: string[] = [];

      // Check if this is a FormData request (has files or Content-Type is multipart)
      const contentType = req.headers['content-type'] || '';
      const hasFiles = (req as any).files && Array.isArray((req as any).files) && (req as any).files.length > 0;
      const isFormData = contentType.includes('multipart/form-data') || hasFiles;
      
      if (isFormData) {
        // FormData request - fields come as strings from multer
        // Multer populates req.body with form fields
        console.log('FormData request detected');
        console.log('req.body:', req.body);
        console.log('req.body type:', typeof req.body);
        console.log('req.body keys:', req.body ? Object.keys(req.body) : 'no body');
        console.log('req.body.content:', req.body?.content);
        console.log('files:', (req as any).files);
        
        if (!req.body) {
          console.error('req.body is missing for FormData request');
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: 'Request body is missing'
          });
        }
        
        // Extract content from FormData
        const contentValue = req.body.content;
        console.log('contentValue:', contentValue, 'type:', typeof contentValue);
        
        if (!contentValue || (typeof contentValue === 'string' && contentValue.trim().length === 0)) {
          console.error('Content is missing or empty');
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: 'Comment content is required'
          });
        }
        
        content = String(contentValue).trim();
        
        // Validate content length
        if (content.length > 2000) {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: 'Comment content must be less than 2000 characters'
          });
        }
        
        // Handle parentCommentId - it might be an empty string, undefined, or a valid ID
        const parentCommentIdValue = req.body.parentCommentId;
        if (parentCommentIdValue && String(parentCommentIdValue).trim().length > 0) {
          parentCommentId = String(parentCommentIdValue).trim();
        } else {
          parentCommentId = undefined;
        }
        
        // Get files from multer and upload to GridFS
        const files = (req as any).files;
        if (files && Array.isArray(files) && files.length > 0) {
          try {
            // Upload each file to GridFS and get the file IDs
            attachments = await Promise.all(
              files.map(async (file: any) => {
                if (!file.buffer) {
                  throw new Error('File buffer is missing');
                }
                const fileId = await uploadFileToGridFS(file);
                return fileId;
              })
            );
          } catch (fileError: any) {
            console.error('Error uploading files to GridFS:', fileError);
            return res.status(500).json({
              success: false,
              message: 'Error uploading files',
              error: fileError.message || String(fileError)
            });
          }
        }
      } else {
        // JSON request
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: 'Request body is required'
          });
        }
        
        try {
          const validatedData = createCommentSchema.parse(req.body);
          content = validatedData.content;
          parentCommentId = validatedData.parentCommentId;
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            return res.status(400).json({
              success: false,
              message: 'Validation error',
              error: validationError.issues.map(e => e.message).join(', ')
            });
          }
          throw validationError;
        }
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      if (content.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content must be less than 2000 characters'
        });
      }

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
      if (parentCommentId) {
        const parentComment = await CommentModel.findById(parentCommentId);
        if (!parentComment || !parentComment.isActive) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      const commentData: any = {
        content,
        author: req.user.userId,
        thread: threadId,
        parentComment: parentCommentId || undefined,
      };
      
      if (attachments.length > 0) {
        commentData.attachments = attachments.map(id => new mongoose.Types.ObjectId(id));
      }
      
      const comment = await CommentModel.create(commentData) as any;

      const populatedComment = await CommentModel.findById(comment._id.toString())
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
          attachments: populatedComment!.attachments ? populatedComment!.attachments.map((id: any) => id.toString()) : [],
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
      
      // Handle both JSON and FormData
      let content: string;
      let newAttachments: string[] = [];
      let deletedAttachments: string[] = [];

      // Check if this is a FormData request
      const contentType = req.headers['content-type'] || '';
      const isFormData = contentType.includes('multipart/form-data') || (req as any).files;
      
      if (isFormData) {
        // FormData request
        content = req.body.content ? String(req.body.content).trim() : '';
        deletedAttachments = req.body.deletedAttachments 
          ? (Array.isArray(req.body.deletedAttachments) 
              ? req.body.deletedAttachments 
              : JSON.parse(req.body.deletedAttachments))
          : [];
        
        // Get files from multer and upload to GridFS
        const files = (req as any).files;
        if (files && Array.isArray(files) && files.length > 0) {
          try {
            newAttachments = await Promise.all(
              files.map(async (file: any) => {
                if (!file.buffer) {
                  throw new Error('File buffer is missing');
                }
                const fileId = await uploadFileToGridFS(file);
                return fileId;
              })
            );
          } catch (fileError: any) {
            console.error('Error uploading files to GridFS:', fileError);
            return res.status(500).json({
              success: false,
              message: 'Error uploading files',
              error: fileError.message || String(fileError)
            });
          }
        }
      } else {
        // JSON request
        const validatedData = updateCommentSchema.parse(req.body);
        content = validatedData.content;
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      if (content.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Comment content must be less than 2000 characters'
        });
      }

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

      comment.content = content;
      
      // Handle attachments
      if (isFormData) {
        // Remove deleted attachments
        if (deletedAttachments && deletedAttachments.length > 0) {
          const remainingAttachments = (comment.attachments || []).filter(
            (id: any) => !deletedAttachments.includes(id.toString())
          );
          comment.attachments = remainingAttachments.map((id: any) => 
            id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id.toString())
          ) as mongoose.Types.ObjectId[];
        }
        
        // Add new attachments
        if (newAttachments.length > 0) {
          const existingAttachments = (comment.attachments || []).map((id: any) => 
            id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id.toString())
          );
          comment.attachments = [
            ...existingAttachments,
            ...newAttachments.map(id => new mongoose.Types.ObjectId(id))
          ] as mongoose.Types.ObjectId[];
        }
      }
      
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
          attachments: updatedComment!.attachments ? updatedComment!.attachments.map((id: any) => id.toString()) : [],
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

  static async getAttachmentInfo(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      
      const fileInfo = await getFileInfoFromGridFS(fileId);
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: fileInfo._id.toString(),
          filename: fileInfo.metadata?.originalname || fileInfo.filename,
          mimetype: fileInfo.metadata?.mimetype || 'application/octet-stream',
          size: fileInfo.length || fileInfo.metadata?.size || 0
        }
      });
    } catch (error: any) {
      console.error('Get attachment info error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving file info',
        error: error.message || String(error)
      });
    }
  }

  static async getAttachment(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      
      // Get file info first to set proper headers
      const fileInfo = await getFileInfoFromGridFS(fileId);
      if (!fileInfo) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Set appropriate headers for download
      res.setHeader('Content-Type', fileInfo.metadata?.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.metadata?.originalname || fileInfo.filename}"`);
      
      // Stream the file
      const downloadStream = getFileFromGridFS(fileId);
      
      downloadStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error retrieving file'
          });
        }
      });
      
      downloadStream.pipe(res);
    } catch (error: any) {
      console.error('Get attachment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving file',
        error: error.message || String(error)
      });
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

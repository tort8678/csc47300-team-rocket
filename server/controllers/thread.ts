import { Request, Response } from 'express';
import { z } from 'zod';
import ThreadModel, { ThreadStatus } from '../database/threadModel.js';
import CommentModel from '../database/commentModel.js';
import UserModel from '../database/userModel.js';
import { AuthRequest, UserRole } from '../types/index.js';
import { uploadFileToGridFS, getFileFromGridFS, getFileInfoFromGridFS } from '../services/gridfs.js';

// Validation schemas
const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  category: z.string().min(1)
});

const updateThreadSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  category: z.string().min(1).optional()
});

export class ThreadController {
  static async getThreads(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as string) || 'recent';
      const category = req.query.category as string;
      const authorId = req.query.authorId as string;


      const skip = (page - 1) * limit;

      // Build query - only show approved threads to regular users
      const query: any = { isActive: true };
      
      // Admin can see all statuses, regular users only see approved
      const isAdmin = req.user?.role === UserRole.ADMIN;
      if (!isAdmin) {
        query.status = ThreadStatus.APPROVED;
      } else {
        // Admin can filter by status if provided
        const status = req.query.status as string;
        if (status && Object.values(ThreadStatus).includes(status as ThreadStatus)) {
          query.status = status;
        }
      }
      
      if (category && category !== 'all') {
        query.category = category;
      }
      if (authorId) {
        query.author = authorId;
      }

      // Build sort
      let sortOption: any = { createdAt: -1 };
      if (sort === 'popular') {
        sortOption = { likes: -1, createdAt: -1 };
      } else if (sort === 'views') {
        sortOption = { views: -1, createdAt: -1 };
      }

      const threads = await ThreadModel.find(query)
        .populate('author', 'username profilePictureUrl')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      // Get comment counts for each thread and check if user liked each thread
      const userId = req.user?.userId;
      const threadsWithCounts = await Promise.all(
        threads.map(async (thread) => {
          const commentCount = await CommentModel.countDocuments({
            thread: thread._id,
            isActive: true
          });

          // Check if user has liked this thread
          let userLiked = false;
          if (userId) {
            userLiked = thread.likes.some(
              (likeId) => likeId.toString() === userId
            );
          }

          return {
            id: thread._id.toString(),
            title: thread.title,
            content: thread.content,
            author: {
              id: (thread.author as any)._id.toString(),
              username: (thread.author as any).username,
              profilePictureUrl: (thread.author as any).profilePictureUrl
            },
            category: thread.category,
            likes: thread.likes.length,
            views: thread.views,
            replies: commentCount,
            attachments: thread.attachments ? thread.attachments.map((id: any) => id.toString()) : [],
            status: thread.status,
            userLiked,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt
          };
        })
      );


      if (sort === 'replies') {
        threadsWithCounts.sort((a, b) => b.replies - a.replies);
      }
      
      const total = await ThreadModel.countDocuments(query);

      res.json({
        success: true,
        data: threadsWithCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async getThreadById(req: AuthRequest, res: Response) {
    try {
      const { threadId } = req.params;
      const shouldIncrementView = req.query.incrementView === 'true';

      const thread = await ThreadModel.findById(threadId)
        .populate('author', 'username profilePictureUrl bio major classYear');

      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      // Check if user can view this thread
      // Regular users can only see approved threads, unless it's their own
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const isAuthor = req.user && thread.author.toString() === req.user.userId;
      
      if (!isAdmin && !isAuthor && thread.status !== ThreadStatus.APPROVED) {
        return res.status(403).json({
          success: false,
          message: 'Thread is not available'
        });
      }

      // Increment view count only if requested
      if (shouldIncrementView) {
        thread.views += 1;
        await thread.save();
      }

      // Get comment count
      const commentCount = await CommentModel.countDocuments({
        thread: threadId,
        isActive: true
      });

      // Check if user has liked this thread
      let userLiked = false;
      if (req.user) {
        userLiked = thread.likes.some(
          (likeId) => likeId.toString() === req.user!.userId
        );
      }

      res.json({
        success: true,
        data: {
          id: thread._id.toString(),
          title: thread.title,
          content: thread.content,
          author: {
            id: (thread.author as any)._id.toString(),
            username: (thread.author as any).username,
            profilePictureUrl: (thread.author as any).profilePictureUrl,
            bio: (thread.author as any).bio,
            major: (thread.author as any).major,
            classYear: (thread.author as any).classYear
          },
          category: thread.category,
          likes: thread.likes.length,
          views: thread.views,
          replies: commentCount,
          userLiked,
          attachments: thread.attachments ? thread.attachments.map((id: any) => id.toString()) : [],
          status: thread.status,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt
        }
      });
    } catch (error) {
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

  static async createThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Handle both JSON and FormData
      let title: string, content: string, category: string;
      let attachments: string[] = [];

      // Check if this is a FormData request (has files or Content-Type is multipart)
      const contentType = req.headers['content-type'] || '';
      const isFormData = contentType.includes('multipart/form-data') || (req as any).files;
      
      if (isFormData) {
        // FormData request - fields come as strings from multer
        title = req.body.title ? String(req.body.title).trim() : '';
        content = req.body.content ? String(req.body.content).trim() : '';
        category = req.body.category ? String(req.body.category).trim() : '';
        
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
        title = req.body.title ? String(req.body.title).trim() : '';
        content = req.body.content ? String(req.body.content).trim() : '';
        category = req.body.category ? String(req.body.category).trim() : '';
      }
      
      // Validate the data
      try {
        const validatedData = createThreadSchema.parse({ title, content, category });
        title = validatedData.title;
        content = validatedData.content;
        category = validatedData.category;
      } catch (validationError: any) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: validationError.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          });
        }
        throw validationError;
      }

      const thread = await ThreadModel.create({
        title,
        content,
        category,
        author: req.user.userId,
        status: ThreadStatus.PENDING, // New threads start as pending
        attachments: attachments.length > 0 ? attachments : undefined
      });

      const populatedThread = await ThreadModel.findById(thread._id)
        .populate('author', 'username profilePictureUrl');

      res.status(201).json({
        success: true,
        message: 'Thread created successfully',
        data: {
          id: populatedThread!._id.toString(),
          title: populatedThread!.title,
          content: populatedThread!.content,
          author: {
            id: (populatedThread!.author as any)._id.toString(),
            username: (populatedThread!.author as any).username,
            profilePictureUrl: (populatedThread!.author as any).profilePictureUrl
          },
          category: populatedThread!.category,
          likes: populatedThread!.likes.length,
          views: populatedThread!.views,
          replies: 0,
          attachments: populatedThread!.attachments ? populatedThread!.attachments.map((id: any) => id.toString()) : [],
          createdAt: populatedThread!.createdAt,
          updatedAt: populatedThread!.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error creating thread:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message || String(error) 
      });
    }
  }

  static async updateThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;
      
      // Handle both JSON and FormData
      let title: string, content: string, category: string;
      let newAttachments: string[] = [];

      // Check if this is a FormData request (has files or Content-Type is multipart)
      const contentType = req.headers['content-type'] || '';
      const isFormData = contentType.includes('multipart/form-data') || (req as any).files;
      
      if (isFormData) {
        // FormData request - fields come as strings from multer
        title = req.body.title ? String(req.body.title).trim() : '';
        content = req.body.content ? String(req.body.content).trim() : '';
        category = req.body.category ? String(req.body.category).trim() : '';
        
        // Get files from multer and upload to GridFS
        const files = (req as any).files;
        if (files && Array.isArray(files) && files.length > 0) {
          try {
            // Upload each file to GridFS and get the file IDs
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
        title = req.body.title ? String(req.body.title).trim() : '';
        content = req.body.content ? String(req.body.content).trim() : '';
        category = req.body.category ? String(req.body.category).trim() : '';
      }

      // Validate the data
      const validatedData = updateThreadSchema.parse({ title, content, category });

      const thread = await ThreadModel.findById(threadId);

      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      // Check if user is the author or admin
      if (
        thread.author.toString() !== req.user.userId &&
        req.user.role === UserRole.USER
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own threads'
        });
      }

      // Update thread fields
      Object.assign(thread, validatedData);
      
      // Handle deleted attachments
      let deletedAttachments: string[] = [];
      if (req.body.deletedAttachments) {
        try {
          deletedAttachments = typeof req.body.deletedAttachments === 'string' 
            ? JSON.parse(req.body.deletedAttachments) 
            : req.body.deletedAttachments;
        } catch (e) {
          // If parsing fails, try as array
          deletedAttachments = Array.isArray(req.body.deletedAttachments) ? req.body.deletedAttachments : [];
        }
      }
      
      // Remove deleted attachments
      if (deletedAttachments.length > 0) {
        const existingAttachments = thread.attachments ? thread.attachments.map((id: any) => id.toString()) : [];
        thread.attachments = existingAttachments.filter((id: string) => !deletedAttachments.includes(id));
        
        // Delete files from GridFS
        const { deleteFileFromGridFS } = await import('../services/gridfs.js');
        for (const fileId of deletedAttachments) {
          try {
            await deleteFileFromGridFS(fileId);
          } catch (error) {
            console.error(`Error deleting file ${fileId}:`, error);
          }
        }
      }
      
      // If new files were uploaded, add them to existing attachments
      if (newAttachments.length > 0) {
        const existingAttachments = thread.attachments ? thread.attachments.map((id: any) => id.toString()) : [];
        thread.attachments = [...existingAttachments, ...newAttachments];
      }
      
      await thread.save();

      const updatedThread = await ThreadModel.findById(threadId)
        .populate('author', 'username profilePictureUrl');

      const commentCount = await CommentModel.countDocuments({
        thread: threadId,
        isActive: true
      });

      res.json({
        success: true,
        message: 'Thread updated successfully',
        data: {
          id: updatedThread!._id.toString(),
          title: updatedThread!.title,
          content: updatedThread!.content,
          author: {
            id: (updatedThread!.author as any)._id.toString(),
            username: (updatedThread!.author as any).username,
            profilePictureUrl: (updatedThread!.author as any).profilePictureUrl
          },
          category: updatedThread!.category,
          likes: updatedThread!.likes.length,
          views: updatedThread!.views,
          replies: commentCount,
          attachments: updatedThread!.attachments ? updatedThread!.attachments.map((id: any) => id.toString()) : [],
          createdAt: updatedThread!.createdAt,
          updatedAt: updatedThread!.updatedAt
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

  static async deleteThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;

      const thread = await ThreadModel.findById(threadId);

      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      // Check if user is the author or admin
      if (
        thread.author.toString() !== req.user.userId &&
        req.user.role === UserRole.USER
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own threads'
        });
      }

      // Soft delete
      thread.isActive = false;
      await thread.save();

      res.json({
        success: true,
        message: 'Thread deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async toggleLikeThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;

      const thread = await ThreadModel.findById(threadId);

      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      const userId = req.user.userId;
      const likeIndex = thread.likes.findIndex(
        (likeId) => likeId.toString() === userId
      );

      if (likeIndex > -1) {
        // Unlike
        thread.likes.splice(likeIndex, 1);
      } else {
        // Like
        thread.likes.push(userId as any);
      }

      await thread.save();

      res.json({
        success: true,
        message: likeIndex > -1 ? 'Thread unliked' : 'Thread liked',
        data: {
          likes: thread.likes.length,
          userLiked: likeIndex === -1
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async getPendingThreads(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const query: any = { 
        isActive: true,
        status: ThreadStatus.PENDING
      };

      const threads = await ThreadModel.find(query)
        .populate('author', 'username profilePictureUrl bio major classYear')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const threadsWithDetails = threads.map((thread) => ({
        id: thread._id.toString(),
        title: thread.title,
        content: thread.content,
        author: {
          id: (thread.author as any)._id.toString(),
          username: (thread.author as any).username,
          profilePictureUrl: (thread.author as any).profilePictureUrl,
          bio: (thread.author as any).bio,
          major: (thread.author as any).major,
          classYear: (thread.author as any).classYear
        },
        category: thread.category,
        status: thread.status,
        views: thread.views,
        likes: thread.likes.length,
        attachments: thread.attachments || [],
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      }));

      const total = await ThreadModel.countDocuments(query);

      res.json({
        success: true,
        data: threadsWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async approveThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { threadId } = req.params;
      const thread = await ThreadModel.findById(threadId);

      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      thread.status = ThreadStatus.APPROVED;
      await thread.save();

      res.json({
        success: true,
        message: 'Thread approved successfully',
        data: {
          id: thread._id.toString(),
          status: thread.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async rejectThread(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { threadId } = req.params;
      const thread = await ThreadModel.findById(threadId);

      if (!thread || !thread.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      thread.status = ThreadStatus.REJECTED;
      await thread.save();

      res.json({
        success: true,
        message: 'Thread rejected successfully',
        data: {
          id: thread._id.toString(),
          status: thread.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async getThreadStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const total = await ThreadModel.countDocuments({ isActive: true });
      const pending = await ThreadModel.countDocuments({ 
        isActive: true, 
        status: ThreadStatus.PENDING 
      });
      const approved = await ThreadModel.countDocuments({ 
        isActive: true, 
        status: ThreadStatus.APPROVED 
      });
      const rejected = await ThreadModel.countDocuments({ 
        isActive: true, 
        status: ThreadStatus.REJECTED 
      });

      res.json({
        success: true,
        data: {
          total,
          pending,
          approved,
          rejected
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async getPublicStats(req: Request, res: Response) {
    try {
      // Get user count
      const totalUsers = await UserModel.countDocuments({ isActive: true });

      // Get approved threads count
      const approvedThreads = await ThreadModel.countDocuments({ 
        isActive: true, 
        status: ThreadStatus.APPROVED 
      });

      // Get total comments count
      const totalComments = await CommentModel.countDocuments({ isActive: true });

      // Calculate total posts (threads + comments)
      const totalPosts = approvedThreads + totalComments;

      // Get category statistics
      const categoryStats = await ThreadModel.aggregate([
        { 
          $match: { 
            isActive: true, 
            status: ThreadStatus.APPROVED 
          } 
        },
        {
          $group: {
            _id: '$category',
            threads: { $sum: 1 }
          }
        }
      ]);

      // Get comment counts per category
      const categoryCommentCounts = await CommentModel.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'threads',
            localField: 'thread',
            foreignField: '_id',
            as: 'threadData'
          }
        },
        { $unwind: '$threadData' },
        {
          $match: {
            'threadData.status': ThreadStatus.APPROVED,
            'threadData.isActive': true
          }
        },
        {
          $group: {
            _id: '$threadData.category',
            comments: { $sum: 1 }
          }
        }
      ]);

      // Combine category stats
      const categoryData: Record<string, { threads: number; posts: number }> = {};
      
      categoryStats.forEach((stat: any) => {
        categoryData[stat._id] = {
          threads: stat.threads,
          posts: stat.threads
        };
      });

      categoryCommentCounts.forEach((stat: any) => {
        if (categoryData[stat._id]) {
          categoryData[stat._id].posts += stat.comments;
        } else {
          categoryData[stat._id] = {
            threads: 0,
            posts: stat.comments
          };
        }
      });

      res.json({
        success: true,
        data: {
          members: totalUsers,
          threads: approvedThreads,
          posts: totalPosts,
          categories: categoryData
        }
      });
    } catch (error: any) {
      console.error('Public stats error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message || String(error)
      });
    }
  }
}

import { Response } from 'express';
import { AuthRequest, ApiResponse, UserRole } from '../types/index.ts';
import User from '../database/userModel.ts';
import ThreadModel from '../database/threadModel.ts';
import CommentModel from '../database/commentModel.ts';
import { isAdminLevel2, isAdmin } from '../middleware/auth.ts';
import { z } from 'zod';

// Validation schemas
const createAdminSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2])
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  major: z.string().optional(),
  classYear: z.string().optional(),
  location: z.string().optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2]).optional(),
  isActive: z.boolean().optional()
});

const updateThreadSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional()
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isActive: z.boolean().optional()
});

const formatBanExpiry = (timestamp: string | Date | null | undefined) => {
  if (!timestamp) return 'Permanent';
  const expiry = new Date(timestamp);
  const now = new Date();
  if (expiry <= now) return 'Expired';

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return expiry.toLocaleString('en-US', options);
};

export class AdminController {
  static async getUsers(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { page = 1, limit = 10, includeInactive = false } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Both Admin Level 1 and 2 can see inactive (banned) users
      const isAdminUser = isAdmin(req.user.role);
      const query: any = {};
      
      // Only filter out inactive users if explicitly requested and user is not an admin
      if (!includeInactive && !isAdminUser) {
        query.isActive = true;
      }

      let users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      // Check and auto-unban users whose ban has expired
      const now = new Date();
      for (const user of users) {
        if (!user.isActive && user.bannedUntil && user.bannedUntil <= now) {
          user.isActive = true;
          user.bannedUntil = null;
          await user.save();
        }
      }

      // Re-fetch to get updated data
      users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      // Transform users to include id field
      const usersWithId = users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio,
        major: user.major,
        classYear: user.classYear,
        location: user.location,
        EMPLID: user.EMPLID,
        role: user.role,
        isActive: user.isActive,
        bannedUntil: user.bannedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.json({
        success: true,
        data: usersWithId,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async getUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { userId } = req.params;
      const { includeInactive = false } = req.query;

      // Both Admin Level 1 and 2 can see inactive (banned) users
      const isAdminUser = isAdmin(req.user.role);
      const query: any = { _id: userId };
      
      // Only filter out inactive users if explicitly requested and user is not an admin
      if (!includeInactive && !isAdminUser) {
        query.isActive = true;
      }

      let user = await User.findOne(query).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check and auto-unban if ban expired
      const now = new Date();
      if (!user.isActive && user.bannedUntil && user.bannedUntil <= now) {
        user.isActive = true;
        user.bannedUntil = null;
        await user.save();
        // Re-fetch to get updated data
        user = await User.findOne(query).select('-password');
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
      }

      // Transform user to include id field
      const userWithId = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio,
        major: user.major,
        classYear: user.classYear,
        location: user.location,
        EMPLID: user.EMPLID,
        role: user.role,
        isActive: user.isActive,
        bannedUntil: user.bannedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        data: userWithId
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async createAdmin(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can create admin users
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can create admin users'
        });
      }

      const validatedData = createAdminSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: validatedData.username },
          { email: validatedData.email }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      const user = await User.create({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        role: validatedData.role,
        isActive: true
      });

      const userResponse = await User.findById(user._id).select('-password');

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: userResponse
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }

      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async updateUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { userId } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      // Only Admin Level 2 can change roles
      if (validatedData.role && !isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can change user roles'
        });
      }

      // Find user (Admin Level 2 can see inactive users)
      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = { _id: userId };
      if (!isLevel2) {
        query.isActive = true;
      }

      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user
      Object.assign(user, validatedData);
      await user.save();

      const updatedUser = await User.findById(user._id).select('-password');

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }

      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can delete users
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can delete users'
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async restoreUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can restore users
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can restore users'
        });
      }

      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = true;
      await user.save();

      const restoredUser = await User.findById(user._id).select('-password');

      res.json({
        success: true,
        message: 'User restored successfully',
        data: restoredUser
      });
    } catch (error: any) {
      console.error('Error restoring user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async banUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only admins can ban users
      if (!isAdmin(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { userId } = req.params;
      const { duration } = req.body; // duration in hours, or null for forever

      // Validate duration
      let bannedUntil: Date | null = null;
      if (duration !== null && duration !== undefined) {
        if (typeof duration === 'number' && duration > 0) {
          bannedUntil = new Date(Date.now() + duration * 60 * 60 * 1000); // Convert hours to milliseconds
        } else if (duration === 'forever' || duration === null) {
          bannedUntil = null; // Forever ban
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid ban duration. Must be a number of hours or "forever"'
          });
        }
      } else {
        // Default to forever if not specified
        bannedUntil = null;
      }

      const targetUser = await User.findById(userId);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Permission checks:
      // Admin Level 1 can only ban regular users (cannot ban any admins)
      // Admin Level 2 can ban Admin Level 1 and regular users (but not Admin Level 2)
      const isLevel2 = isAdminLevel2(req.user.role);
      const targetIsAdmin = isAdmin(targetUser.role);
      const targetIsLevel2 = isAdminLevel2(targetUser.role);

      // Admin Level 2 cannot be banned by anyone
      if (targetIsLevel2) {
        return res.status(403).json({
          success: false,
          message: 'Cannot ban Admin Level 2 users'
        });
      }

      // Admin Level 1 can only ban regular users (not any admins, including Admin Level 1)
      if (!isLevel2 && targetIsAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin Level 1 can only ban regular users'
        });
      }

      // Prevent self-ban
      if (targetUser._id.toString() === req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot ban yourself'
        });
      }

      // Ban user
      targetUser.isActive = false;
      targetUser.bannedUntil = bannedUntil;
      await targetUser.save();

      const bannedUser = await User.findById(targetUser._id.toString()).select('-password');

      if (!bannedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Transform user to include id field
      const bannedUserWithId = {
        id: bannedUser._id.toString(),
        username: bannedUser.username,
        email: bannedUser.email,
        profilePictureUrl: bannedUser.profilePictureUrl,
        bio: bannedUser.bio,
        major: bannedUser.major,
        classYear: bannedUser.classYear,
        location: bannedUser.location,
        EMPLID: bannedUser.EMPLID,
        role: bannedUser.role,
        isActive: bannedUser.isActive,
        bannedUntil: bannedUser.bannedUntil,
        createdAt: bannedUser.createdAt,
        updatedAt: bannedUser.updatedAt
      };

      res.json({
        success: true,
        message: bannedUntil ? `User banned until ${formatBanExpiry(bannedUntil.toISOString())}` : 'User banned permanently',
        data: bannedUserWithId
      });
    } catch (error: any) {
      console.error('Error banning user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async unbanUser(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only admins can unban users
      if (!isAdmin(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { userId } = req.params;
      const targetUser = await User.findById(userId);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Permission checks:
      // Admin Level 1 can only unban regular users
      // Admin Level 2 can unban Admin Level 1 and regular users
      const isLevel2 = isAdminLevel2(req.user.role);
      const targetIsAdmin = isAdmin(targetUser.role);
      const targetIsLevel2 = isAdminLevel2(targetUser.role);

      if (!isLevel2 && targetIsAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin Level 1 can only unban regular users'
        });
      }

      if (targetIsLevel2) {
        return res.status(403).json({
          success: false,
          message: 'Cannot unban Admin Level 2 users'
        });
      }

      // Unban user (set isActive to true and clear ban duration)
      targetUser.isActive = true;
      targetUser.bannedUntil = null;
      await targetUser.save();

      const unbannedUser = await User.findById(targetUser._id.toString()).select('-password');

      if (!unbannedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Transform user to include id field
      const unbannedUserWithId = {
        id: unbannedUser._id.toString(),
        username: unbannedUser.username,
        email: unbannedUser.email,
        profilePictureUrl: unbannedUser.profilePictureUrl,
        bio: unbannedUser.bio,
        major: unbannedUser.major,
        classYear: unbannedUser.classYear,
        location: unbannedUser.location,
        EMPLID: unbannedUser.EMPLID,
        role: unbannedUser.role,
        isActive: unbannedUser.isActive,
        bannedUntil: unbannedUser.bannedUntil,
        createdAt: unbannedUser.createdAt,
        updatedAt: unbannedUser.updatedAt
      };

      res.json({
        success: true,
        message: 'User unbanned successfully',
        data: unbannedUserWithId
      });
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async getThreads(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { page = 1, limit = 10, includeInactive = false } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = {};
      
      if (!includeInactive || !isLevel2) {
        query.isActive = true;
      }

      const threads = await ThreadModel.find(query)
        .populate('author', 'username profilePictureUrl')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await ThreadModel.countDocuments(query);

      res.json({
        success: true,
        data: threads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Error fetching threads:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async getThread(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;
      const { includeInactive = false } = req.query;

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = { _id: threadId };
      
      if (!includeInactive || !isLevel2) {
        query.isActive = true;
      }

      const thread = await ThreadModel.findOne(query)
        .populate('author', 'username profilePictureUrl');

      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      res.json({
        success: true,
        data: thread
      });
    } catch (error: any) {
      console.error('Error fetching thread:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async updateThread(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { threadId } = req.params;
      const validatedData = updateThreadSchema.parse(req.body);

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = { _id: threadId };
      if (!isLevel2) {
        query.isActive = true;
      }

      const thread = await ThreadModel.findOne(query);

      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      Object.assign(thread, validatedData);
      await thread.save();

      const updatedThread = await ThreadModel.findById(thread._id)
        .populate('author', 'username profilePictureUrl');

      res.json({
        success: true,
        message: 'Thread updated successfully',
        data: updatedThread
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }

      console.error('Error updating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async deleteThread(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can delete threads
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can delete threads'
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

      // Soft delete
      thread.isActive = false;
      await thread.save();

      res.json({
        success: true,
        message: 'Thread deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting thread:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async restoreThread(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can restore threads
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can restore threads'
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

      thread.isActive = true;
      await thread.save();

      const restoredThread = await ThreadModel.findById(thread._id)
        .populate('author', 'username profilePictureUrl');

      res.json({
        success: true,
        message: 'Thread restored successfully',
        data: restoredThread
      });
    } catch (error: any) {
      console.error('Error restoring thread:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async getComments(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { page = 1, limit = 10, includeInactive = false } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = {};
      
      if (!includeInactive || !isLevel2) {
        query.isActive = true;
      }

      const comments = await CommentModel.find(query)
        .populate('author', 'username profilePictureUrl')
        .populate('thread', 'title')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await CommentModel.countDocuments(query);

      res.json({
        success: true,
        data: comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async getComment(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { commentId } = req.params;
      const { includeInactive = false } = req.query;

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = { _id: commentId };
      
      if (!includeInactive || !isLevel2) {
        query.isActive = true;
      }

      const comment = await CommentModel.findOne(query)
        .populate('author', 'username profilePictureUrl')
        .populate('thread', 'title');

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      res.json({
        success: true,
        data: comment
      });
    } catch (error: any) {
      console.error('Error fetching comment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async updateComment(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { commentId } = req.params;
      const validatedData = updateCommentSchema.parse(req.body);

      const isLevel2 = isAdminLevel2(req.user.role);
      const query: any = { _id: commentId };
      if (!isLevel2) {
        query.isActive = true;
      }

      const comment = await CommentModel.findOne(query);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      Object.assign(comment, validatedData);
      await comment.save();

      const updatedComment = await CommentModel.findById(comment._id)
        .populate('author', 'username profilePictureUrl')
        .populate('thread', 'title');

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }

      console.error('Error updating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async deleteComment(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can delete comments
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can delete comments'
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

      // Soft delete
      comment.isActive = false;
      await comment.save();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  static async restoreComment(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Only Admin Level 2 can restore comments
      if (!isAdminLevel2(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Admin Level 2 can restore comments'
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

      comment.isActive = true;
      await comment.save();

      const restoredComment = await CommentModel.findById(comment._id)
        .populate('author', 'username profilePictureUrl')
        .populate('thread', 'title');

      res.json({
        success: true,
        message: 'Comment restored successfully',
        data: restoredComment
      });
    } catch (error: any) {
      console.error('Error restoring comment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}


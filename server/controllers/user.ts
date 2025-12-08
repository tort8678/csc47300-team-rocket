import { UserService } from "../services/user";
import { Request, Response } from "express";
import { UserI } from "../database/userModel";
import { AuthRequest } from "../types/index.js";
import ThreadModel, { ThreadStatus } from "../database/threadModel.js";
import CommentModel from "../database/commentModel.js";
import { UserRole } from "../types/index.js";
import { isAdmin } from "../middleware/auth.js";


export class UserController {
    static async getUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async updateUser(req: Request, res: Response) {
        const updateData: Partial<UserI> = req.body;
        try {
            const updatedUser = await UserService.updateUser(updateData._id?.toString() || "", updateData);
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const deletedUser = await UserService.deleteUser(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async createUser(req: Request, res: Response) {
        const userData: Partial<UserI> = req.body;
        try {
            const newUser = await UserService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    static async getUserByUsername(req: Request, res: Response) {
        const username = req.params.username;
        try {
            const user = await UserService.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: "User not found" 
                });
            }

            // Check if user is banned - hide from non-admins
            const authHeader = req.headers.authorization;
            let isAdminUser = false;
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const jwt = require('jsonwebtoken');
                    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
                    const token = authHeader.substring(7);
                    const decoded = jwt.verify(token, JWT_SECRET) as any;
                    // Use the imported isAdmin function for consistency
                    isAdminUser = isAdmin(decoded.role);
                } catch (e) {
                    // Invalid token, treat as non-admin
                }
            }

            // Check and auto-unban if ban expired
            const now = new Date();
            if (!user.isActive && user.bannedUntil && user.bannedUntil <= now) {
                user.isActive = true;
                user.bannedUntil = null;
                await user.save();
            }

            // If user is banned and requester is not admin, return not found
            // Admins can view banned users' profiles
            if (!user.isActive && !isAdminUser) {
                return res.status(404).json({ 
                    success: false,
                    message: "User not found" 
                });
            }

            res.json({
                success: true,
                data: {
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
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: "Server error", 
                error: String(error)
            });
        }
    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }


    static async getCurrentUserProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false,
                    message: "Not authenticated" 
                });
            }

            const user = await UserService.getUserById(req.user.userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: "User not found" 
                });
            }

            // Check and auto-unban if ban expired
            const now = new Date();
            if (!user.isActive && user.bannedUntil && user.bannedUntil <= now) {
                user.isActive = true;
                user.bannedUntil = null;
                await user.save();
            }

            res.json({
                success: true,
                data: {
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
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async updateCurrentUserProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false,
                    message: "Not authenticated" 
                });
            }

            const updateData: Partial<UserI> = req.body;
            // Remove fields that shouldn't be updated directly
            delete updateData._id;
            delete updateData.password;
            delete updateData.username;
            delete updateData.email;
            delete updateData.role;
            delete updateData.isActive;

            const updatedUser = await UserService.updateUser(req.user.userId, updateData);
            if (!updatedUser) {
                return res.status(404).json({ 
                    success: false,
                    message: "User not found" 
                });
            }

            res.json({
                success: true,
                data: {
                    id: updatedUser._id.toString(),
                    username: updatedUser.username,
                    email: updatedUser.email,
                    profilePictureUrl: updatedUser.profilePictureUrl,
                    bio: updatedUser.bio,
                    major: updatedUser.major,
                    classYear: updatedUser.classYear,
                    location: updatedUser.location,
                    EMPLID: updatedUser.EMPLID,
                    role: updatedUser.role,
                    createdAt: updatedUser.createdAt
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async getUserThreadsByUsername(req: Request, res: Response) {
        try {
            const { username } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const user = await UserService.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const isAdminUser = (req as AuthRequest).user ? isAdmin((req as AuthRequest).user!.role) : false;
            const currentUserId = (req as AuthRequest).user?.userId;
            
            // Check if user is viewing their own profile
            const isViewingOwnProfile = currentUserId && user._id.toString() === currentUserId.toString();
            
            const query: any = { author: user._id, isActive: true };
            
            // Only filter by status if:
            // 1. User is not an admin AND
            // 2. User is not viewing their own profile
            if (!isAdminUser && !isViewingOwnProfile) {
                query.status = ThreadStatus.APPROVED;
            }
            // If isAdminUser is true OR isViewingOwnProfile is true, no status filter is added (shows all statuses)

            const threads = await ThreadModel.find(query)
                .populate('author', 'username profilePictureUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await ThreadModel.countDocuments(query);

            const threadsData = threads.map(thread => ({
                id: thread._id.toString(),
                title: thread.title,
                content: thread.content,
                author: {
                    id: (thread.author as any)._id.toString(),
                    username: (thread.author as any).username,
                    profilePictureUrl: (thread.author as any).profilePictureUrl
                },
                category: thread.category,
                status: thread.status,
                likes: thread.likes.length,
                replies: thread.replies || 0,
                views: thread.views || 0,
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt
            }));

            res.json({
                success: true,
                data: threadsData,
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

    static async getUserCommentsByUsername(req: Request, res: Response) {
        try {
            const { username } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const user = await UserService.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const comments = await CommentModel.find({ author: user._id, isActive: true })
                .populate('author', 'username profilePictureUrl')
                .populate({
                    path: 'thread',
                    select: 'title status author',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                })
                .populate({
                    path: 'parentComment',
                    select: 'author',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await CommentModel.countDocuments({ author: user._id, isActive: true });

            const commentsData = comments
                .filter(comment => comment.thread && comment.author) // Filter out comments with deleted threads/authors
                .map(comment => {
                    const thread = comment.thread as any;
                    const author = comment.author as any;
                    const parentComment = comment.parentComment as any;
                    
                    // Determine repliedToUsername:
                    // If it's a top-level comment (no parentComment), return thread author username
                    // If it's a reply (has parentComment), return parent comment author username
                    let repliedToUsername: string | null = null;
                    if (comment.parentComment && parentComment?.author) {
                        // It's a reply - get parent comment author
                        repliedToUsername = parentComment.author?.username || null;
                    } else if (thread?.author) {
                        // It's a top-level comment - get thread author
                        repliedToUsername = thread.author?.username || null;
                    }
                    
                    return {
                        id: comment._id.toString(),
                        content: comment.content,
                        author: {
                            id: author?._id?.toString() || '',
                            username: author?.username || 'Unknown',
                            profilePictureUrl: author?.profilePictureUrl
                        },
                        thread: {
                            id: thread?._id?.toString() || '',
                            title: thread?.title || 'Deleted Thread',
                            status: thread?.status || 'deleted'
                        },
                        repliedToUsername,
                        likes: comment.likes?.length || 0,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt
                    };
                });

            res.json({
                success: true,
                data: commentsData,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error in getUserCommentsByUsername:', error);
            res.status(500).json({ 
                success: false,
                message: "Server error", 
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
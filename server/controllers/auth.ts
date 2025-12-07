import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../database/userModel.ts';
import { AuthRequest, JWTPayload, UserRole } from '../types/index.ts';
import { generateToken } from '../middleware/auth.ts';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  EMPLID: z.number().optional()
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

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

      // Create new user
      const userData: any = {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        role: UserRole.USER
      };
      
      // Only add EMPLID if it's provided and valid
      if (validatedData.EMPLID && validatedData.EMPLID > 0) {
        userData.EMPLID = validatedData.EMPLID;
      }
      
      const user = await User.create(userData);

      // Generate JWT token
      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        email: user.email
      };

      const token = generateToken(tokenPayload);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            bio: user.bio,
            major: user.major,
            classYear: user.classYear,
            location: user.location,
            EMPLID: user.EMPLID
          }
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        return res.status(400).json({
          success: false,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        });
      }
      
      // Handle other MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: messages
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message || String(error)
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user and include password
      const user = await User.findOne({
        $or: [
          { username: validatedData.username },
          { email: validatedData.username }
        ]
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact an administrator.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(validatedData.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        email: user.email
      };

      const token = generateToken(tokenPayload);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            bio: user.bio,
            major: user.major,
            classYear: user.classYear,
            location: user.location,
            EMPLID: user.EMPLID
          }
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.issues.map(e => e.message).join(', ')
        });
      }
      
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message || String(error)
      });
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          profilePictureUrl: user.profilePictureUrl,
          bio: user.bio,
          major: user.major,
          classYear: user.classYear,
          location: user.location,
          EMPLID: user.EMPLID,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message || String(error)
      });
    }
  }
}

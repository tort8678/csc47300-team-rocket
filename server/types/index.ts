import { Request } from 'express';

export enum UserRole {
  USER = 'user',
  ADMIN_LEVEL_1 = 'admin_level_1',
  ADMIN_LEVEL_2 = 'admin_level_2'
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload | null;
  files?: any[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


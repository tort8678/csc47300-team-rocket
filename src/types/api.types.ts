export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string | {
    id: string;
    username: string;
    profilePictureUrl?: string;
    bio?: string;
    major?: string;
    classYear?: string;
  };
  category: string;
  likes: number;
  views: number;
  replies: number;
  attachments?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  status?: 'pending' | 'approved' | 'rejected';
  userLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  thread: string;
  parentComment?: string | null;
  likes: number;
  userLiked: boolean;
  attachments?: string[];
  replies: Comment[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  major?: string;
  classYear?: string;
  location?: string;
  EMPLID?: number;
  role?: string;
  isActive?: boolean;
  bannedUntil?: string | Date | null;
  createdAt?: string | Date;
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

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  EMPLID?: number;
}

export interface UpdateProfileRequest {
  bio?: string;
  major?: string;
  classYear?: string;
  location?: string;
  profilePictureUrl?: string;
}

export interface CreateThreadRequest {
  title: string;
  content: string;
  category: string;
}

export interface UpdateThreadRequest {
  title?: string;
  content?: string;
  category?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

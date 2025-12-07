import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  Thread,
  CreateThreadRequest,
  UpdateThreadRequest,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  PaginatedApiResponse
} from '../types/api.types.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/Login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User endpoints
  async getUserProfileByUsername(username: string): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/users/username/${username}`);
    return response.data;
  }

  async getOwnProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/users/profile/me');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>('/users/profile/me', data);
    return response.data;
  }

  async getUserThreads(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<Thread>> {
    const response = await this.api.get<PaginatedApiResponse<Thread>>(
      `/users/username/${username}/threads`,
      { params: { page, limit } }
    );
    return response.data;
  }

  async getUserComments(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedApiResponse<Comment>> {
    const response = await this.api.get<PaginatedApiResponse<Comment>>(
      `/users/username/${username}/comments`,
      { params: { page, limit } }
    );
    return response.data;
  }

  // Thread endpoints
  async getPublicStats(): Promise<ApiResponse<{
    members: number;
    threads: number;
    posts: number;
    categories: Record<string, { threads: number; posts: number }>;
  }>> {
    const response = await this.api.get<ApiResponse<{
      members: number;
      threads: number;
      posts: number;
      categories: Record<string, { threads: number; posts: number }>;
    }>>('/threads/stats/public');
    return response.data;
  }

  async getThreads(params?: {
    page?: number;
    limit?: number;
    sort?: 'recent' | 'popular' | 'replies' | 'views';
    category?: string;
    authorId?: string;
  }): Promise<PaginatedApiResponse<Thread>> {
    const response = await this.api.get<PaginatedApiResponse<Thread>>('/threads', {
      params
    });
    return response.data;
  }

  async getThreadById(threadId: string, incrementView: boolean = false): Promise<ApiResponse<Thread>> {
    const response = await this.api.get<ApiResponse<Thread>>(`/threads/${threadId}`, {
      params: { incrementView: incrementView ? 'true' : 'false' }
    });
    return response.data;
  }

  async createThread(data: CreateThreadRequest): Promise<ApiResponse<Thread>> {
    const response = await this.api.post<ApiResponse<Thread>>('/threads', data);
    return response.data;
  }

  async updateThread(
    threadId: string,
    data: UpdateThreadRequest
  ): Promise<ApiResponse<Thread>> {
    const response = await this.api.put<ApiResponse<Thread>>(
      `/threads/${threadId}`,
      data
    );
    return response.data;
  }

  async deleteThread(threadId: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/threads/${threadId}`);
    return response.data;
  }

  async toggleLikeThread(threadId: string): Promise<ApiResponse<{ likes: number; userLiked: boolean }>> {
    const response = await this.api.post<ApiResponse<{ likes: number; userLiked: boolean }>>(
      `/threads/${threadId}/like`
    );
    return response.data;
  }

  // Comment endpoints
  async getThreadComments(threadId: string): Promise<ApiResponse<Comment[]>> {
    const response = await this.api.get<ApiResponse<Comment[]>>(
      `/comments/thread/${threadId}`
    );
    return response.data;
  }
  
  async createComment(
    threadId: string,
    data: CreateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    const response = await this.api.post<ApiResponse<Comment>>(
      `/comments/thread/${threadId}`,
      data
    );
    return response.data;
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    const response = await this.api.put<ApiResponse<Comment>>(
      `/comments/${commentId}`,
      data
    );
    return response.data;
  }

  async deleteComment(commentId: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/comments/${commentId}`);
    return response.data;
  }

  async toggleLikeComment(commentId: string): Promise<ApiResponse<{ likes: number; userLiked: boolean }>> {
    const response = await this.api.post<ApiResponse<{ likes: number; userLiked: boolean }>>(
      `/comments/${commentId}/like`
    );
    return response.data;
  }

  // Admin endpoints
  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedApiResponse<User>> {
    const response = await this.api.get<PaginatedApiResponse<User>>('/admin/users', {
      params
    });
    return response.data;
  }

  async getAdminUser(userId: string, includeInactive?: boolean): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/admin/users/${userId}`, {
      params: { includeInactive }
    });
    return response.data;
  }

  async createAdmin(data: {
    username: string;
    email: string;
    password: string;
    role: 'admin_level_1' | 'admin_level_2';
  }): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  }

  async updateAdminUser(
    userId: string,
    data: {
      username?: string;
      email?: string;
      bio?: string;
      major?: string;
      classYear?: string;
      location?: string;
      role?: 'user' | 'admin_level_1' | 'admin_level_2';
      isActive?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>(`/admin/users/${userId}`, data);
    return response.data;
  }

  async deleteAdminUser(userId: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/admin/users/${userId}`);
    return response.data;
  }

  async restoreAdminUser(userId: string): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>(`/admin/users/${userId}/restore`);
    return response.data;
  }

  async getAdminThreads(params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedApiResponse<Thread>> {
    const response = await this.api.get<PaginatedApiResponse<Thread>>('/admin/threads', {
      params
    });
    return response.data;
  }

  async getAdminThread(threadId: string, includeInactive?: boolean): Promise<ApiResponse<Thread>> {
    const response = await this.api.get<ApiResponse<Thread>>(`/admin/threads/${threadId}`, {
      params: { includeInactive }
    });
    return response.data;
  }

  async updateAdminThread(
    threadId: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Thread>> {
    const response = await this.api.put<ApiResponse<Thread>>(
      `/admin/threads/${threadId}`,
      data
    );
    return response.data;
  }

  async deleteAdminThread(threadId: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/admin/threads/${threadId}`);
    return response.data;
  }

  async restoreAdminThread(threadId: string): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>(`/admin/threads/${threadId}/restore`);
    return response.data;
  }

  async getAdminComments(params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedApiResponse<Comment>> {
    const response = await this.api.get<PaginatedApiResponse<Comment>>('/admin/comments', {
      params
    });
    return response.data;
  }

  async updateAdminComment(
    commentId: string,
    data: {
      content?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Comment>> {
    const response = await this.api.put<ApiResponse<Comment>>(
      `/admin/comments/${commentId}`,
      data
    );
    return response.data;
  }

  async deleteAdminComment(commentId: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/admin/comments/${commentId}`);
    return response.data;
  }

  async restoreAdminComment(commentId: string): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>(`/admin/comments/${commentId}/restore`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
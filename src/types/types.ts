export interface User {
    id: string;
    username: string;
    password: string;
    profilePictureUrl?: string;
    email: string;
    bio?: string;
    createdAt: Date;
    EMPLID: number;
}

export interface Post {
    id: string;
    threadId: string;
    authorId: string;
    content: string;
    createdAt: Date;
}

export interface Thread {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    category: string;
    replies: number;
    views: number;
}
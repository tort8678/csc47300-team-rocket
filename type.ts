interface User {
    id: string;
    name: string;
    password: string;
    profilePictureUrl: string;
    email: string;
    bio: string;
    createdAt: Date;
    EMPLID: number;
}

interface Post {
    id: string;
    threadId: string;
    authorId: string;
    content: string;
    createdAt: Date;
}

interface Thread {
    id: string;
    title: string;
    createdAt: Date;
    category: string;
}
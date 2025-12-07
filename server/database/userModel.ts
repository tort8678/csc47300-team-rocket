import mongoose, { Schema } from "mongoose";

export interface UserThreads {
    threadId: mongoose.Types.ObjectId;
}

export interface UserComments {
    commentIds: mongoose.Types.ObjectId[];
    threadId: mongoose.Types.ObjectId;
}
export interface UserI {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    profilePictureUrl?: string;
    email: string;
    bio?: string;
    createdAt: Date;
    EMPLID: number;
    threads?: UserThreads[];
    comments?: UserComments[];
}

const UserThreadSchema = new Schema<UserThreads>({
    threadId: { type: Schema.Types.ObjectId, ref: "ThreadId" }
});
const UserCommentSchema = new Schema<UserComments>({
    commentIds: [{ type: Schema.Types.ObjectId, ref: "CommentId" }],
    threadId: { type: Schema.Types.ObjectId, ref: "ThreadId", required: true }
});

const userSchema = new Schema<UserI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePictureUrl: { type: String },
    bio: { type: String },
    EMPLID: { type: Number, required: true, unique: true },
    threads: [UserThreadSchema],
    comments: [UserCommentSchema]
}, { timestamps: true });

const User = mongoose.model<UserI>("User", userSchema);

export default User;
import mongoose, { Schema, Document } from "mongoose";

export enum ThreadStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface ThreadI extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    category: string;
    status: ThreadStatus;
    views: number;
    likes: mongoose.Types.ObjectId[];
    attachments?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ThreadSchema = new Schema<ThreadI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(ThreadStatus),
        default: ThreadStatus.PENDING
    },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    attachments: [{ type: Schema.Types.ObjectId }], // Store GridFS file IDs
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for better query performance
ThreadSchema.index({ status: 1, isActive: 1 });
ThreadSchema.index({ category: 1, status: 1, isActive: 1 });
ThreadSchema.index({ createdAt: -1 });

const ThreadModel = mongoose.model<ThreadI>("Thread", ThreadSchema);

export { ThreadModel };
export default ThreadModel;

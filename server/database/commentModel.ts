import mongoose, { Schema, Document } from "mongoose";

export interface CommentI extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    author: mongoose.Types.ObjectId;
    thread: mongoose.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<CommentI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for better query performance
CommentSchema.index({ thread: 1, isActive: 1 });
CommentSchema.index({ parentComment: 1 });

const CommentModel = mongoose.model<CommentI>("Comment", CommentSchema);

export { CommentModel };
export default CommentModel;


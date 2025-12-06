// get all posts from a single user --> user has array of post ids, including comments. Comments have post id and comment id, with comment id optional
import mongoose, { Schema } from "mongoose";
interface MessageBody {
    _id: mongoose.Types.ObjectId;
    authorId: string;
    content: string;
    createdAt: Date;
}
export interface ReplyI extends MessageBody {
    threadId: string;
}

export interface ThreadI extends MessageBody {
    title: string;
    replies?: ReplyI[];
    category: string;
    views: number;
}
const ReplySchema = new Schema<ReplyI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    threadId: { type: String, required: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true }
});
const ThreadSchema = new Schema<ThreadI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    createdAt: { type: Date, required: true },
    category: { type: String, required: true },
    views: { type: Number, required: true },
    replies: [ReplySchema]
});
const ThreadModel = mongoose.model("Thread", ThreadSchema);
export { ThreadModel };
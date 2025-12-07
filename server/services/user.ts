import UserModel, { UserI } from "../database/userModel.js";
import mongoose from "mongoose";

export class UserService {
    static async createUser(userData: Partial<UserI>) {
        const user = new UserModel(userData);
        return await user.save();
    }
    static async getUserById(userId: string) {
        return await UserModel.findById(userId).exec();
    }
    static async getUserByUsername(username: string) {
        return await UserModel.findOne({ username }).exec();
    }
    static async updateUser(userId: string, updateData: Partial<UserI>) {
        return await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    }
    static async deleteUser(userId: string) {
        return await UserModel.findByIdAndDelete(userId).exec();
    }

    static async getAllUsers() {
        return await UserModel.find().exec();
    }

    static async AddThreadToUser(userId: string, threadId: string) {
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            throw new Error("User not found");
        }
        user.threads = user.threads || [];
        user.threads.push({ threadId: new mongoose.Types.ObjectId(threadId) });
        return await user.save();
    }

    static async AddCommentToUser(userId: string, threadId: string, commentId: string) {
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            throw new Error("User not found");
        }
        user.comments = user.comments || [];
        const threadComments = user.comments.find(c => c.threadId.toString() === threadId);
        if (threadComments) {
            threadComments.commentIds.push(new mongoose.Types.ObjectId(commentId));
        } else {
            user.comments.push({
                threadId: new mongoose.Types.ObjectId(threadId),
                commentIds: [new mongoose.Types.ObjectId(commentId)]
            });
        }
        return await user.save();
    }

    static async RemoveThreadFromUser(userId: string, threadId: string) {
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            throw new Error("User not found");
        }
        user.threads = user.threads?.filter(t => t.threadId.toString() !== threadId);
        return await user.save();
    }

    static async RemoveCommentFromUser(userId: string, threadId: string, commentId: string) {
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            throw new Error("User not found");
        }
        const threadComments = user.comments?.find(c => c.threadId.toString() === threadId);
        if (threadComments) {
            threadComments.commentIds = threadComments.commentIds.filter(id => id.toString() !== commentId);
            if (threadComments.commentIds.length === 0) {
                user.comments = user.comments?.filter(c => c.threadId.toString() !== threadId);
            }
        }
        return await user.save();
    }

    static async getUserThreads(userId: string) {
        const user = await UserModel.findById(userId).populate('threads.threadId').exec();
        if (!user) {
            throw new Error("User not found");
        }
        return user.threads;
    }
    static async getUserComments(userId: string) {
        const user = await UserModel.findById(userId).populate('comments.threadId').exec();
        if (!user) {
            throw new Error("User not found");
        }
        return user.comments;
    }   
}
import UserModel, { UserI } from "../database/userModel.js";

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
}
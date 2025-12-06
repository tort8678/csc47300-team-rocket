import mongoose, { Schema } from "mongoose";

export interface UserI {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    profilePictureUrl?: string;
    email: string;
    bio?: string;
    createdAt: Date;
    EMPLID: number;
}
const userSchema = new Schema<UserI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePictureUrl: { type: String },
    bio: { type: String },
    EMPLID: { type: Number, required: true, unique: true }
}, { timestamps: true });

const User = mongoose.model<UserI>("User", userSchema);

export default User;
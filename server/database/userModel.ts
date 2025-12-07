import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/index.ts';

export interface UserI extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    profilePictureUrl?: string;
    email: string;
    bio?: string;
    major?: string;
    classYear?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
    EMPLID?: number;
    role: UserRole;
    isActive: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserI>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    profilePictureUrl: { type: String },
    bio: { type: String },
    major: { type: String },
    classYear: { type: String },
    location: { type: String },
    EMPLID: { type: Number, unique: true, sparse: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<UserI>("User", userSchema);

export default User;

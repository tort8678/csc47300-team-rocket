import { UserService } from "../services/user";
import { Request, Response } from "express";
import { UserI } from "../database/userModel";


export class UserController {
    static async getUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async updateUser(req: Request, res: Response) {
        const updateData: Partial<UserI> = req.body;
        try {
            const updatedUser = await UserService.updateUser(updateData._id?.toString() || "", updateData);
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const deletedUser = await UserService.deleteUser(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async createUser(req: Request, res: Response) {
        const userData: Partial<UserI> = req.body;
        try {
            const newUser = await UserService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    static async getUserByUsername(req: Request, res: Response) {
        const username = req.params.username;
        try {
            const user = await UserService.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }

    static async addThreadToUser(req: Request, res: Response) {
        const { userId, threadId } = req.body;
        try{
            res.json( await UserService.AddThreadToUser(userId,threadId));
             
        } catch (error){
            res.status(500).json({ message: "Server error", error})
        }
    }
}
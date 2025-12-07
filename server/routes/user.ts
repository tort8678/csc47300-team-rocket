import { UserController } from "../controllers/user.js";
import express from "express";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/get/:userId", UserController.getUser);
router.post("/create", UserController.createUser);
router.patch("/update", UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);
router.get("/username/:username", UserController.getUserByUsername);
router.get("/username/:username/threads", UserController.getUserThreadsByUsername);
router.get("/username/:username/comments", UserController.getUserCommentsByUsername);

// Profile routes (authenticated)
router.get("/profile/me", authenticate, UserController.getCurrentUserProfile);
router.put("/profile/me", authenticate, UserController.updateCurrentUserProfile);

export default router;
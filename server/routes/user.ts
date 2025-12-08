import { UserController } from "../controllers/user.js";
import express from "express";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/get/:userId", UserController.getUser);
router.post("/create", UserController.createUser);
router.patch("/update", UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);
router.get("/username/:username", UserController.getUserByUsername);
router.get("/username/:username/threads", optionalAuthenticate, UserController.getUserThreadsByUsername);
router.get("/username/:username/comments", optionalAuthenticate, UserController.getUserCommentsByUsername);

// Profile routes (authenticated)
router.get("/profile/me", authenticate, UserController.getCurrentUserProfile);
router.put("/profile/me", authenticate, UserController.updateCurrentUserProfile);

export default router;
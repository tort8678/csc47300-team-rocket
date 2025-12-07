import { UserController } from "../controllers/user";
import express from "express";
const router = express.Router();

router.get("/get/:userId", UserController.getUser);
router.post("/create", UserController.createUser);
router.patch("/update", UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);
router.get("/username/:username", UserController.getUserByUsername);
router.post("/addThreadToUser", UserController.addThreadToUser)

export default router;
import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/register", userController.getCreateUserPage);
userRouter.post("/register", userController.postUser);
userRouter.get("/login", userController.getLoginPage);

export default userRouter;
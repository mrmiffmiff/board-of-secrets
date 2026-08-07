import { Router } from "express";
import userController from "../controllers/userController.js";
import passport from "passport";
import ensureLoggedIn from "../middleware/ensureLoggedIn.js";

const userRouter = Router();

userRouter.get("/register", userController.getCreateUserPage);
userRouter.post("/register", userController.postUser);
userRouter.get("/login", userController.getLoginPage);
userRouter.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
}));
userRouter.get("/logout", userController.logout);
userRouter.get("/upgrade", ensureLoggedIn, userController.getSecretPage);
userRouter.post("/upgrade", ensureLoggedIn, userController.postSecret);

export default userRouter;
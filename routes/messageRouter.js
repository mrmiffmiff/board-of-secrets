import { Router } from "express";
import messageController from "../controllers/messageController.js";
import ensureLoggedIn from "../middleware/ensureLoggedIn.js";

const messageRouter = Router();

messageRouter.get("/", messageController.getIndex);
messageRouter.get("/new-message", ensureLoggedIn, messageController.getNewMessagePage);
messageRouter.post("/new-message", ensureLoggedIn, messageController.postMessage);

export default messageRouter;

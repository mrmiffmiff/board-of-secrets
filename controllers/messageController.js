import db from "../db/message_queries.js";
import { body, validationResult, matchedData } from "express-validator";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getIndex(req, res) {
    const isMember = Boolean(req.user?.isMember);
    const messages = isMember
        ? await db.getMessagesWithAuthors()
        : await db.getMessages();
    res.render("index", { title: "Board of Secrets", messages, isMember });
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getNewMessagePage(req, res) {
    res.render("newMessage", { title: "New Message", styles: ["forms"] });
}

const validateMessage = [
    body("title").trim()
        .notEmpty().withMessage("A title is required.")
        .isLength({ max: 100 }).withMessage("Title must be at most 100 characters."),
    body("post").trim()
        .isLength({ min: 10 }).withMessage("Post must be at least 10 characters."),
];

const postMessage = [
    validateMessage,
    /**
    *
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("newMessage", {
                title: "New Message",
                styles: ["forms"],
                errors: errors.array(),
            });
        }
        const { title, post } = matchedData(req);
        await db.addMessage(title, post, req.user.id);
        res.redirect("/");
    }
];

export default {
    getIndex,
    getNewMessagePage,
    postMessage,
};

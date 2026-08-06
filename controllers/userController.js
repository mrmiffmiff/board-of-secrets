import db from "../db/user_queries.js";
import bcrypt from "bcryptjs";
import { body, validationResult, matchedData, oneOf } from "express-validator";

const alphaErr = "must only contain letters, spaces, hyphens, and underscores."
const nameErr = "At least one name field must be filled."

const validateUser = [
    body("firstName").trim()
        .isAlpha('en-US', { ignore: " -_" }).withMessage(`First name ${alphaErr}`),
    body("lastName").trim()
        .isAlpha('en-US', { ignore: " -_" }).withMessage(`Last name ${alphaErr}`),
    oneOf([
        body("firstName").notEmpty(),
        body("lastName").notEmpty(),
    ], { message: nameErr }),
    body("email").trim()
        .notEmpty().withMessage("An email address is required.")
        .isEmail().withMessage("Email must be an email address.")
        .custom(async value => {
            const existingUser = await db.getUserByUsername(value);
            if (existingUser) {
                throw new Error("Email already in use");
            }
            return true;
        }),
    body("password")
        .isLength({ min: 8, max: 20 }).withMessage("Password must have from 8 to 20 characters."),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords must match.");
        }
        return true;
    })
];

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
function getCreateUserPage(req, res) {
    res.render("createUser", { title: "Create User", styles: ["forms"] });
}

const postUser = [
    validateUser,
    /**
    * 
    * @param {import('express').Request} req 
    * @param {import('express').Response} res 
    */
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("createUser", {
                title: "Create User",
                styles: ["forms"],
                errors: errors.array(),
            });
        }
        const { firstName, lastName, email, password } = matchedData(req);
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.addUser(firstName, lastName, email, hashedPassword);
        res.redirect("/");
    }
];

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
function getLoginPage(req, res) {
    res.render("login", { title: "Login", styles: ["forms"] });
}

function logout(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}

export default {
    getCreateUserPage,
    postUser,
    getLoginPage,
    logout,
}
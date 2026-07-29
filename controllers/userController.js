import db from "../db/user_queries.js";
import bcrypt from "bcryptjs";

async function addUser(req, res) {
    // const users = await db.getExample();
    // res.render("index", { users: users });
    const { first_name, last_name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.addUser(first_name, last_name, username, hashedPassword);
    res.redirect("/");
}

export default {
    addUser,
}
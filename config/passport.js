import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import db from "../db/user_queries.js";

passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await db.getUserByUsername(email);
        const failMessage = "Incorrect username or password"
        if (!user) {
            return done(null, false, { message: failMessage });
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return done(null, false, { message: failMessage });
        }
        const { passwordHash, ...safeUser } = user;
        return done(null, safeUser);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUser(id);
        const { passwordHash, ...safeUser } = user;
        done(null, safeUser);
    } catch (err) {
        done(err);
    }
});

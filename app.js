import path from "node:path";
import express from "express";
const __dirname = import.meta.dirname;
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
const pgSession = connectPgSimple(session);
import pool from "./db/pool.js";
import "./config/passport.js";

const sessionStore = new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
});

const app = express();
app.disable("x-powered-by"); // No reason to disclose

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// If relevant
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));
app.use(
    session(
        {
            secret: process.env.SESSIONSECRET,
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            },
        }
    )
);
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use("/", userRouter);
app.use("/", messageRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Express app listening on port ${PORT}`);
});
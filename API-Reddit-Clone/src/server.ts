import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import "reflect-metadata";
import { createConnection } from "typeorm";
import trim from "./middlewares/trim";
import authRoutes from "./routes/auth";
import miscRoutes from "./routes/misc";
import postsRoutes from "./routes/posts";
import subsRoutes from "./routes/subs";
import usersRoutes from "./routes/users";

dotenv.config();

const app = express();
const { PORT, ORIGIN } = process.env;
const port = Number(PORT);

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/subs", subsRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/users", usersRoutes);

app.listen(port, async function bootApp() {
  console.log(`Server started on port: ${port}`);
  try {
    const conn = await createConnection();
    await conn.runMigrations();

    console.log("Database connection successfully established");
  } catch (error) {
    console.log({ error });
  }
});

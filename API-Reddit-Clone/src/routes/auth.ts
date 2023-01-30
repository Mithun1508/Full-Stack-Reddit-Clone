import bcrypt from "bcrypt";
import { isEmpty, validate } from "class-validator";
import cookie from "cookie";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";
import auth from "../middlewares/auth";
import user from "../middlewares/user";

const mapErrors = (errors: Object[]) => {
  return errors.reduce((prev: any, error: any) => {
    prev[error.property] = Object.entries(error.constraints)[0][1];
    return prev;
  }, {});
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) {
      errors.email = "Email is already taken";
    }

    if (usernameUser) {
      errors.username = "Username is already taken";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User({ email, username, password });
    errors = await validate(user);

    if (errors.length > 0) {
      return res.status(400).json(mapErrors(errors));
    }

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) {
      errors.username = "Username must not be empty";
    }

    if (isEmpty(password)) {
      errors.password = "Password must not be empty";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        username: `User with username \`${username}\` not found`,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        password: "Password is incorrect",
      });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET!);

    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? ".harrymanchanda.in"
            : undefined,
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      }),
    );

    return res.status(200).json(user);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const me = (_req: Request, res: Response) => {
  return res.status(200).json(res.locals.user);
};

const logout = (_req: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? ".harrymanchanda.in"
          : undefined,
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    }),
  );

  return res.status(200).json({
    success: true,
  });
};

const authRoutes = Router();
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", user, auth, me);
authRoutes.get("/logout", user, auth, logout);

export default authRoutes;

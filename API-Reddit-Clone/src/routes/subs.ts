import { isEmpty } from "class-validator";
import { Request, Response, Router, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { getRepository } from "typeorm";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";
import auth from "../middlewares/auth";
import user from "../middlewares/user";
import { makeId } from "../utils/helpers";

const createSubs = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;
  const user: User = res.locals.user;

  try {
    let errors: any = {};

    if (isEmpty(name)) {
      errors.name = "Name must not be empty";
    }

    if (isEmpty(title)) {
      errors.title = "Title must not be empty";
    }

    const sub = await getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", {
        name: name.toLowerCase(),
      })
      .getOne();

    if (sub) {
      errors.name = "Sub exists already";
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();
    return res.status(200).json(sub);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const findSub = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: {
        createdAt: "DESC",
      },
      relations: ["comments", "votes"],
    });
    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.status(200).json(sub);
  } catch (error) {
    return res.status(404).json({
      sub: "Sub not found",
    });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({
      where: { name: req.params.name },
    });

    if (sub.username !== user.username) {
      return res.status(403).json({
        error: "You don't own this sub",
      });
    }

    res.locals.sub = sub;
    return next();
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, "public/images");
    },
    filename: (_req, file, callback) => {
      const name = makeId(15);
      callback(null, `${name}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("Invalid file format"));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;

  try {
    const { type } = req.body;

    if (type !== "image" && type !== "banner") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Invalid type",
      });
    }

    let oldImageUrn: string = "";

    if (type === "image") {
      oldImageUrn = sub.imageUrn ?? "";
      sub.imageUrn = req.file.filename;
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn ?? "";
      sub.bannerUrn = req.file.filename;
    }

    await sub.save();

    if (oldImageUrn !== "") {
      const oldImageUrnPath = path.join("public", "images", oldImageUrn);
      if (fs.existsSync(oldImageUrnPath)) {
        fs.unlinkSync(oldImageUrnPath);
      }
    }
    return res.status(200).json(sub);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const searchSubs = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (isEmpty(name)) {
      return res.status(400).json({
        error: "Name must not be empty",
      });
    }

    const subs = await getRepository(Sub)
      .createQueryBuilder()
      .where("LOWER(name) LIKE :name", {
        name: `${name.toLowerCase().trim()}%`,
      })
      .getMany();

    return res.status(200).json(subs);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const subsRoutes = Router();
subsRoutes.post("/", user, auth, createSubs);
subsRoutes.get("/:name", user, findSub);
subsRoutes.get("/search/:name", searchSubs);
subsRoutes.post(
  "/:name/image",
  user,
  auth,
  ownSub,
  upload.single("file"),
  uploadSubImage,
);

export default subsRoutes;

import { Request, Response, Router } from "express";
import Post from "../entities/Post";
import auth from "../middlewares/auth";
import User from "../entities/User";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";
import user from "../middlewares/user";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;
  const user: User = res.locals.user;

  if (title.trim() === "") {
    return res.status(400).json({
      title: "Title must not be empty",
    });
  }

  try {
    const subRecord = await Sub.findOneOrFail({ name: sub });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const readPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number;
  const postsPerPage: number = (req.query.count || 8) as number;

  try {
    const posts = await Post.find({
      order: {
        createdAt: "DESC",
      },
      relations: ["comments", "votes", "sub"],
      skip: currentPage * postsPerPage,
      take: postsPerPage,
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const findPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["sub", "votes", "comments"] },
    );

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({
      error: `Post with identifier \`${identifier}\` and slug \`${slug}\` not found`,
    });
  }
};

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body } = req.body;
  const user: User = res.locals.user;

  try {
    let post;
    try {
      post = await Post.findOneOrFail({ identifier, slug });
    } catch (error) {
      return res.status(404).json({
        error: `Post with identifier \`${identifier}\` and slug \`${slug}\` not found`,
      });
    }
    const comment = new Comment({ body, user, post });
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const findPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail({ identifier, slug });
    const comments = await Comment.find({
      where: { post },
      order: {
        createdAt: "DESC",
      },
      relations: ["votes"],
    });

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(404).json({
      error: `Post with identifier \`${identifier}\` and slug \`${slug}\` not found`,
    });
  }
};

const postsRoutes = Router();
postsRoutes.post("/", user, auth, createPost);
postsRoutes.get("/", user, readPosts);
postsRoutes.get("/:identifier/:slug", user, findPost);
postsRoutes.post("/:identifier/:slug/comments", user, auth, commentOnPost);
postsRoutes.get("/:identifier/:slug/comments", user, findPostComments);

export default postsRoutes;

import { Request, Response, Router } from "express";
import User from "../entities/User";
import user from "../middlewares/user";
import Post from "../entities/Post";
import Comment from "../entities/Comment";

const readUserSubmissions = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const user = await User.findOneOrFail({
      where: { username },
      select: ["username", "createdAt"],
    });

    const posts = await Post.find({
      where: { user },
      relations: ["comments", "votes", "sub"],
    });

    const comments = await Comment.find({
      where: { user },
      relations: ["post"],
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    let submissions: any[] = [];

    posts.forEach((p) =>
      submissions.push({
        type: "Post",
        ...p.toJSON(),
      }),
    );

    comments.forEach((c) =>
      submissions.push({
        type: "Comment",
        ...c.toJSON(),
      }),
    );

    submissions.sort((a, b) => {
      if (b.createdAt > a.createdAt) {
        return 1;
      }

      if (b.createdAt < a.createdAt) {
        return -1;
      }

      return 0;
    });

    return res.status(200).json({
      user,
      submissions,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const usersRoutes = Router();
usersRoutes.get("/:username", user, readUserSubmissions);

export default usersRoutes;

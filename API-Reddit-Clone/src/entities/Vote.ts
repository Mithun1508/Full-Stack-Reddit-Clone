import { Column, Entity as TOEntity, JoinColumn, ManyToOne } from "typeorm";
import Post from "./Post";
import Entity from "./shared/Entity";
import User from "./User";
import Comment from "./Comment";

@TOEntity("votes")
export default class Vote extends Entity {
  constructor(vote: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({ name: "post_id", referencedColumnName: "id" })
  post: Post;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: "comment_id", referencedColumnName: "id" })
  comment: Comment;
}

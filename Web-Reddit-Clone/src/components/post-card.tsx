import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Post } from "../types";
import axios from "axios";
import classNames from "classnames";
import ActionButton from "./action-button";
import { useAuthState } from "../context/auth";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  revalidate?: Function;
}

const PostCard: React.FC<PostCardProps> = ({
  post: {
    identifier,
    title,
    slug,
    body,
    username,
    subName,
    createdAt,
    url,
    commentCount,
    voteScore,
    userVote,
    sub,
  },
  revalidate,
}) => {
  const { authenticated } = useAuthState();
  const router = useRouter();

  const isInSubPage = router.pathname === `/r/[sub]`;

  const vote = async (value: number) => {
    if (!authenticated) {
      router.push(`/login/?next=${router.asPath}`);
    }

    if (value === userVote) {
      value = 0;
    }

    try {
      await axios.post("/misc/vote", {
        identifier,
        slug,
        value,
      });

      if (revalidate) {
        revalidate();
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div
      key={identifier}
      className="flex mb-4 bg-white rounded"
      id={identifier}
    >
      <div className="w-10 py-3 text-center bg-gray-200 rounded-l">
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          <i
            className={classNames("icon-arrow-up", {
              "text-red-500": userVote === 1,
            })}
          />
        </div>
        <p className="text-xs font-bold">{voteScore}</p>
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
          onClick={() => vote(-1)}
        >
          <i
            className={classNames("icon-arrow-down", {
              "text-blue-600": userVote === -1,
            })}
          />
        </div>
      </div>
      <div className="w-full p-2">
        <div className="flex items-center">
          {!isInSubPage && (
            <>
              <Link href={`/r/${subName}`}>
                <a className="flex items-center">
                  <img
                    src={sub.imageUrl}
                    className="w-5 h-5 mr-1 rounded-full"
                  />
                  <span className="text-xs font-bold hover:underline">
                    /r/{subName}
                  </span>
                </a>
              </Link>
              <span className="mx-1 text-xs text-gray-500">•</span>
            </>
          )}

          <p className="text-xs text-gray-500">
            Posted by
            <Link href={`/u/${username}`}>
              <a className="mx-1 hover:underline">/u/{username}</a>
            </Link>
            <span>•</span>
            <Link href={url}>
              <a className="mx-1 hover:underline">
                {dayjs(createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <Link href={url}>
          <a className="my-1 text-lg font-medium hover:underline">{title}</a>
        </Link>
        {body && <p className="my-1 text-sm">{body}</p>}
        <div className="flex">
          <Link href={url}>
            <a>
              <ActionButton>
                <i className="mr-1 fas fa-comment-alt fa-xs" />
                <span className="font-bold">{commentCount} Comments</span>
              </ActionButton>
            </a>
          </Link>
          <ActionButton>
            <i className="mr-1 fas fa-share fa-xs" />
            <span className="font-bold">Share</span>
          </ActionButton>
          <ActionButton>
            <i className="mr-1 fas fa-bookmark fa-xs" />
            <span className="font-bold">Save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

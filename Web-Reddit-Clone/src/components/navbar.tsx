import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RedditLogo from "../assets/images/reddit.svg";
import { useAuthDispatch, useAuthState } from "../context/auth";
import { Sub } from "../types";

const Navbar: React.FC = () => {
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [timer, setTimer] = useState(null);
  const { authenticated, loading } = useAuthState();
  const dispatch = useAuthDispatch();
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.get("/auth/logout");
      dispatch("LOGOUT");
      window.location.reload();
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    if (name.trim() === "") {
      setSubs([]);
      return;
    }
    searchSubs();
  }, [name]);

  const searchSubs = () => {
    clearTimeout(timer);

    setTimer(
      setTimeout(async () => {
        try {
          const { data } = await axios.get(`/subs/search/${name}`);
          setSubs(data);
        } catch (error) {
          console.log({ error });
        }
      }, 250),
    );
  };

  const goToSub = (subName: string) => {
    router.push(`/r/${subName}`);
    setName("");
  };

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-5 bg-white">
      <div className="flex items-center">
        <Link href="/">
          <a>
            <RedditLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        <span className="hidden text-2xl font-semibold lg:block">
          <Link href="/">
            <a>readit</a>
          </Link>
        </span>
      </div>
      <div className="max-w-full px-4 w-160">
        <div className="relative flex items-center bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
          <i className="pl-4 pr-3 text-gray-500 fas fa-search" />
          <input
            type="text"
            placeholder="Search..."
            className="py-1 pr-3 bg-transparent rounded focus:outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div
            className="absolute left-0 right-0 bg-white"
            style={{
              top: "100%",
            }}
          >
            {subs?.map((sub, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => goToSub(sub.name)}
              >
                <Image
                  src={sub.imageUrl}
                  className="rounded-full"
                  alt="Sub"
                  title="Sub"
                  width={32}
                  height={32}
                />
                <div className="ml-4 text-sm">
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-gray-600">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex">
        {!loading &&
          (authenticated ? (
            <button
              className="hidden w-20 py-1 mr-4 leading-5 button blue hollow sm:block lg:w-32"
              onClick={logout}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link href={`/login/?next=${router.asPath}`}>
                <a className="hidden w-20 py-1 mr-4 leading-5 button blue hollow sm:block lg:w-32">
                  Log In
                </a>
              </Link>
              <Link href="/register">
                <a className="hidden w-20 py-1 leading-5 button blue sm:block lg:w-32">
                  Sign Up
                </a>
              </Link>
            </>
          ))}
      </div>
    </div>
  );
};

export default Navbar;

import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import InputGroup from "../components/input-group";
import { useRouter } from "next/router";
import { useAuthState } from "../context/auth";

function PageRegister() {
  const router = useRouter();

  const [agreement, setAgreement] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();

  if (authenticated) {
    router.push("/");
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!agreement) {
      setErrors({
        ...errors,
        agreement: "You must agree to T&C's",
      });
      return;
    }

    try {
      await axios.post("/auth/register", { email, username, password });
      router.push("/login");
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  return (
    <>
      <Head>
        <title>Register</title>
      </Head>

      <div className="flex bg-white">
        <div
          className="h-screen bg-center bg-cover w-36"
          style={{
            backgroundImage: "url('/images/bricks.jpg')",
          }}
        />
        <div className="flex flex-col justify-center pl-6">
          <div className="w-70">
            <h1 className="mb-2 text-lg font-medium">Sign up</h1>
            <p className="mb-10 text-xs">
              By continuing, you agree to our User Agreement and Privacy Policy.
            </p>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-6">
                <input
                  type="checkbox"
                  className="mr-1 cursor-pointer"
                  id="agreement"
                  checked={agreement}
                  onChange={(event) => setAgreement(event.target.checked)}
                />
                <label htmlFor="agreement" className="text-xs cursor-pointer">
                  I agree to get emails about cool stuff on Readit.
                </label>
                <small className="block font-medium text-red-600">
                  {errors.agreement}
                </small>
              </div>
              <InputGroup
                className="mb-2"
                type="email"
                value={email}
                setValue={setEmail}
                placeholder="EMAIL"
                error={errors.email}
              />
              <InputGroup
                className="mb-2"
                type="text"
                value={username}
                setValue={setUsername}
                placeholder="USERNAME"
                error={errors.username}
              />
              <InputGroup
                className="mb-4"
                type="password"
                value={password}
                setValue={setPassword}
                placeholder="PASSWORD"
                error={errors.password}
              />
              <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
                Sign Up
              </button>
            </form>
            <small>
              Already a Readitor?
              <Link href="/login">
                <a className="ml-1 text-blue-500 uppercase">Log In</a>
              </Link>
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

export default PageRegister;

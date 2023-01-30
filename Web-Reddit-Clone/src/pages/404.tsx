import Head from "next/head";
import Link from "next/link";

function PageNotFound() {
  return (
    <>
      <Head>
        <title>404: Page Not Found</title>
      </Head>

      <div className="flex flex-col items-center">
        <h1 className="mt-10 mb-4 text-5xl text-gray-800">Page Not Found</h1>
        <Link href="/">
          <a className="px-4 py-2 mt-4 blue button">Back to Homepage</a>
        </Link>
      </div>
    </>
  );
}

export default PageNotFound;

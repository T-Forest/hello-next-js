import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";

export default function ExamplePost() {
  return (
    <Layout children>
      <Head>
        <title>Example Post?</title>
      </Head>
      <h1>Example Post</h1>
      <h2>
        <Link href="/">
          <a>Back To Home</a>
        </Link>
      </h2>
    </Layout>
  );
}

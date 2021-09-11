import { InferGetServerSidePropsType } from "next";
import { octokit } from "../../src/utils/fetcher";

/** getStaticPropsの戻り値型を取り出すために記載する */
export type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;

export const getStaticProps = async () => {
  const repos = await octokit
    .request("GET /users/T-Forest/repos", {
      username: "T-Forest",
    })
    .catch((error) => {
      // oktokit.request関数の第１引数が不正な場合、エラー
      // ここのログはサーバ側にしか出力されない
      console.error(error);
      return null;
    });
  return { props: { repos } };
};

//TODO: Page?
export default function Page(props: PageProps) {
  if (!props?.repos?.data) return <>error</>;
  props.repos.data.map((repo) => {
    // ここのログはクライアント側に出力される
    console.log(repo.url);
  });
  console.log(props.repos.data);
  return <div>Hello Next.js</div>;
}

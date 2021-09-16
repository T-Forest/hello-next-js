import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/client";
import type { Endpoints } from "@octokit/types";
import { now } from "../../src/utils/data";
import { Octokit } from "@octokit/core";
import Error from "../../pages/_error";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);
  if (!session) {
    return propsFactory({
      err: { status: 401, message: "Unauthorized" },
    });
  }

  try {
    // accessTokenを付与したoctokitインスタンス生成
    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // ログインユーザ名取得
    const username = await octokit
      .request("GET /user")
      .then(({ data }) => data.login);
    const param = { username };

    // プライベートリポジトリ情報を含めてリクエスト
    const res = await Promise.all([
      octokit.request("GET /users/{username}", param),
      octokit.request("GET /user/repos", { type: "owner" }),
    ]);

    return propsFactory({ user: res[0], repos: res[1] });
  } catch (err) {
    return propsFactory({
      err: { status: err.status, message: err.message },
    });
  }
};

function getAllRepoName(allRepoData: StaticProps["repos"]["data"]): string {
  if (
    !allRepoData ||
    !(allRepoData instanceof Array) ||
    allRepoData.length === 0
  ) {
    return "";
  }

  return allRepoData.reduce(
    (ret, data) => ret + (ret === "" ? "" : ", ") + data.full_name,
    ""
  );
}

// ___________________________________________________________________________
//
type StaticProps = {
  user: {
    data: Endpoints["GET /users/{username}"]["response"]["data"] | null;
  };
  repos: {
    data: Endpoints["GET /user/repos"]["response"]["data"] | null;
  };
  err: { status: number; message: string } | null;
  generatedAt: string;
};
type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;
// ___________________________________________________________________________
//
const propsFactory = (injects?: Partial<StaticProps>) => ({
  props: {
    user: { data: null },
    repos: { data: null },
    err: null,
    generatedAt: now(),
    ...injects,
  },
});
// ___________________________________________________________________________

// ___________________________________________________________________________
//
/** ユーザのリポジトリ一覧（認証が必要） - SSR */
export default function Page({ user, repos, err, generatedAt }: PageProps) {
  if (err) {
    console.log(err);
    return <Error statusCode={err.status} title={err.message} />;
  }
  if (!user.data || !repos.data) return <div>loading!</div>;
  return (
    <>
      <div>data: {user.data}</div>
      <div>user name: {user?.data?.login}</div>
      <div>repos: {getAllRepoName(repos?.data)}</div>
      <div>generatedAt: {generatedAt}</div>
    </>
  );
}

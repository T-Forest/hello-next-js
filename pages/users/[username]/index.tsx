import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import type { Endpoints } from "@octokit/types";
import { now } from "../../../src/utils/data";
import { octokit } from "../../../src/utils/fetcher";
import { useRouter } from "next/router";
import Error from "../../_error";

/** getStaticPaths: 動的ルートページの事前ビルド設定を定義する */
export const getStaticPaths = async () => {
  return {
    // 事前ビルドする動的ルートPATHを定義する
    paths: [],
    // 段階的静的生成(ISG / ISR)
    fallback: true,
  };
};

/** getStaticProps: ビルド時に静的生成を行う際のAPI */
export const getStaticProps = async (context: GetStaticPropsContext) => {
  // pathsを表す変数名は、ファイル名に対応 ここではparam.username
  const username = context.params?.username;
  // パラメータチェック
  if (typeof username !== "string") {
    return propsFactory({
      err: {
        status: 400,
        message: "Bad Request",
      },
    });
  }

  try {
    const param = { username };
    const res = await Promise.all([
      octokit.request("GET /users/{username}", param),
      octokit.request("GET /users/{username}/repos", param),
    ]);
    console.log("get data");
    return propsFactory({
      user: res[0],
      repos: res[1],
    });
  } catch (err) {
    return propsFactory({
      err: {
        status: err.status,
        message: err.message,
      },
    });
  }
};

//-----------------------------------------------------------------------------
export default function Page({ user, repos, err, generatedAt }: PageProps) {
  const router = useRouter();
  if (err) {
    return <Error statusCode={err.status} title={err.message} />;
  }
  // fallback=trueの場合、クライアントでloading中になる瞬間がある
  if (router.isFallback || !user.data || !repos.data) {
    return (
      <>
        <div>Loading!</div>
      </>
    );
  }
  return (
    <>
      <div>user name: {user?.data?.login}</div>
      <div>repos: {getAllRepoName(repos?.data)}</div>
      <div>generatedAt: {generatedAt}</div>
    </>
  );
}

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

//-----------------------------------------------------------------------------
type StaticProps = {
  user: {
    // Endpoints: GitHub API 取得データのinterface（明示的な型指定が可能）
    data: Endpoints["GET /users/{username}"]["response"]["data"] | null;
  };
  repos: {
    data: Endpoints["GET /users/{username}/repos"]["response"]["data"] | null;
  };
  err: {
    status: number;
    message: string;
  } | null;
  generatedAt: string;
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const propsFactory = (injects?: Partial<StaticProps>) => ({
  props: {
    user: { data: null },
    repos: { data: null },
    err: null,
    generatedAt: now(),
    ...injects,
  },
  // ISGでなくISR(10s経過後、再生成される)
  revalidate: 10,
});

//-----------------------------------------------------------------------------

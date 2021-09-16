import { Octokit } from "@octokit/core";
import { Session } from "next-auth";
import { session, useSession } from "next-auth/client";
import Error from "../../_error";
import { useRouter } from "next/router";
import useSWR from "swr";

// ___________________________________________________________________________
//
type Props = { session: Session; repo: string };
// ___________________________________________________________________________

function PageBase({ session, repo }: Props) {
  const key = "GET /repos/${repo}";
  // useSWR: キャッシュを返却後にデータフェッチ＆リロードせず再描画
  const { data, error } = useSWR(key, async () => {
    // accessTokenを付与したoctokitインスタンス生成
    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // ログインユーザ名取得
    const owner = await octokit
      .request("GET /user")
      .then(({ data }) => data.login);
    const param = { owner, repo };

    // プライベートリポジトリ情報を含めてリクエスト
    return Promise.all([
      octokit.request("GET /repos/{owner}/{repo}", param),
      octokit.request("GET /repos/{owner}/{repo}/commits", param),
    ]);
  });

  if (error) {
    return <Error statusCode={error.status || 500} title={error.message} />;
  }
  if (!data) return <div>loading!</div>;
  return <div>my/[repo] page!</div>;
}

/** ユーザの特定リポジトリ情報（認証が必要） - CSR(useSWR) */
export default function Page() {
  const [session] = useSession();
  const router = useRouter();
  const repo = router.query.repo;
  if (typeof repo !== "string") {
    return <Error statusCode={400} title="Bad Request" />;
  }
  if (!session?.accessToken) {
    return <Error statusCode={401} title="Unauthorized" />;
  }
  return <PageBase session={session} repo={repo} />;
}

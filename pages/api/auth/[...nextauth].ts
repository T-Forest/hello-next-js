import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECERT,
      scope: "repo", //リポジトリ閲覧権限の指定
    }),
  ],
  callbacks: {
    async jwt(token, user, account) {
      // サインイン直後にaccessTokenを含める
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async session(session, userOrToken) {
      // sessionからaccessTokenを参照できるように
      return Promise.resolve({
          ...session,
          accessToken: (userOrToken as JWT).accessToken as string,
      })
    },
  },
});

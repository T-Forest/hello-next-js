import { Octokit } from "@octokit/core";

/** GitHub API */
export const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
});
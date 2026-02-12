// GitHub API Types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  html_url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  state: "open" | "closed";
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  labels: Array<{
    name: string;
    color: string;
  }>;
  pull_request?: any;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  body: string | null;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  html_url: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

export interface GitHubSocialAccount {
  provider: string;
  url: string;
}

export interface GitHubSearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export interface CreateRepoPayload {
  name: string;
  description?: string;
  private?: boolean;
}

export interface CreateIssuePayload {
  title: string;
  body?: string;
}

export interface CreatePullRequestPayload {
  title: string;
  head: string;
  base: string;
  body?: string;
}

export interface CreateBranchPayload {
  ref: string;
  sha: string;
}

export interface UpdateFilePayload {
  message: string;
  content: string;
  sha?: string;
  branch?: string;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

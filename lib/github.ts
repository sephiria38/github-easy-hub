import type {
  GitHubUser,
  GitHubRepo,
  GitHubBranch,
  GitHubIssue,
  GitHubPullRequest,
  GitHubContent,
  GitHubEvent,
  GitHubSocialAccount,
  GitHubSearchUsersResponse,
  CreateRepoPayload,
  CreateIssuePayload,
  CreatePullRequestPayload,
  CreateBranchPayload,
  UpdateFilePayload,
  RateLimit,
} from "./types";

const GITHUB_API_BASE = "https://api.github.com";

class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // User APIs
  async getAuthenticatedUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("/user");
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.request<GitHubUser>(`/users/${username}`);
  }

  async getUserSocialAccounts(
    username: string
  ): Promise<GitHubSocialAccount[]> {
    return this.request<GitHubSocialAccount[]>(
      `/users/${username}/social_accounts`
    );
  }

  async getUserRepos(username: string, sort = "stars"): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>(
      `/users/${username}/repos?sort=${sort}&per_page=100`
    );
  }

  async getUserStarred(username: string): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>(
      `/users/${username}/starred?per_page=100`
    );
  }

  async getUserEvents(username: string): Promise<GitHubEvent[]> {
    return this.request<GitHubEvent[]>(
      `/users/${username}/events/public?per_page=30`
    );
  }

  async getUserFollowers(username: string): Promise<GitHubUser[]> {
    return this.request<GitHubUser[]>(
      `/users/${username}/followers?per_page=100`
    );
  }

  async getUserFollowing(username: string): Promise<GitHubUser[]> {
    return this.request<GitHubUser[]>(
      `/users/${username}/following?per_page=100`
    );
  }

  async searchUsers(query: string): Promise<GitHubSearchUsersResponse> {
    return this.request<GitHubSearchUsersResponse>(
      `/search/users?q=${encodeURIComponent(query)}&per_page=30`
    );
  }

  // Repository APIs
  async getAuthenticatedUserRepos(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>(
      "/user/repos?sort=updated&per_page=100"
    );
  }

  async createRepo(data: CreateRepoPayload): Promise<GitHubRepo> {
    return this.request<GitHubRepo>("/user/repos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  // Branch APIs
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request<GitHubBranch[]>(
      `/repos/${owner}/${repo}/branches?per_page=100`
    );
  }

  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    sha: string
  ): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    });
  }

  // Content APIs
  async getContents(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<GitHubContent | GitHubContent[]> {
    const refParam = ref ? `?ref=${ref}` : "";
    return this.request<GitHubContent | GitHubContent[]>(
      `/repos/${owner}/${repo}/contents/${path}${refParam}`
    );
  }

  async uploadFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
    sha?: string
  ): Promise<any> {
    const body: any = {
      message,
      content,
    };
    if (branch) body.branch = branch;
    if (sha) body.sha = sha;

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // Issue APIs
  async getIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.request<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?per_page=100`
    );
  }

  async createIssue(
    owner: string,
    repo: string,
    data: CreateIssuePayload
  ): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    data: Partial<GitHubIssue>
  ): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(
      `/repos/${owner}/${repo}/issues/${issueNumber}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async addIssueComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<any> {
    return this.request(
      `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ body }),
      }
    );
  }

  // Pull Request APIs
  async getPullRequests(
    owner: string,
    repo: string
  ): Promise<GitHubPullRequest[]> {
    return this.request<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?per_page=100`
    );
  }

  async createPullRequest(
    owner: string,
    repo: string,
    data: CreatePullRequestPayload
  ): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async mergePullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
      method: "PUT",
    });
  }

  // Rate Limit
  async getRateLimit(): Promise<{ resources: { core: RateLimit } }> {
    return this.request("/rate_limit");
  }
}

export default GitHubClient;

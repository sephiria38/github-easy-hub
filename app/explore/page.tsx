"use client";

import { useState } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  GitHubSocialAccount,
} from "@/lib/types";

export default function ExplorePage() {
  const { token } = useToken();
  const { client } = useGitHub(token);
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GitHubUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [userStarred, setUserStarred] = useState<GitHubRepo[]>([]);
  const [userEvents, setUserEvents] = useState<GitHubEvent[]>([]);
  const [userFollowers, setUserFollowers] = useState<GitHubUser[]>([]);
  const [userFollowing, setUserFollowing] = useState<GitHubUser[]>([]);
  const [userSocial, setUserSocial] = useState<GitHubSocialAccount[]>([]);
  const [activeTab, setActiveTab] = useState<
    "profile" | "repos" | "starred" | "activity" | "connections"
  >("profile");
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !searchQuery.trim()) return;

    setSearching(true);
    try {
      const data = await client.searchUsers(searchQuery);
      setSearchResults(data.items);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setSearching(false);
    }
  };

  const loadUserDetails = async (username: string) => {
    if (!client) return;
    setLoadingDetails(true);

    try {
      const [user, repos, starred, events, followers, following] =
        await Promise.all([
          client.getUser(username),
          client.getUserRepos(username, "stars"),
          client.getUserStarred(username),
          client.getUserEvents(username),
          client.getUserFollowers(username),
          client.getUserFollowing(username),
        ]);

      setSelectedUser(user);
      setUserRepos(repos);
      setUserStarred(starred);
      setUserEvents(events);
      setUserFollowers(followers);
      setUserFollowing(following);

      // Try to get social accounts (may fail if not available)
      try {
        const social = await client.getUserSocialAccounts(username);
        setUserSocial(social);
      } catch {
        setUserSocial([]);
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const getLanguageColors = (repos: GitHubRepo[]) => {
    const languages: { [key: string]: number } = {};
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PushEvent":
        return "🟢";
      case "WatchEvent":
        return "⭐";
      case "IssuesEvent":
        return "📝";
      case "PullRequestEvent":
        return "🔀";
      case "ForkEvent":
        return "🍴";
      case "CreateEvent":
        return "✨";
      case "DeleteEvent":
        return "🗑️";
      default:
        return "📌";
    }
  };

  const getEventText = (type: string) => {
    switch (type) {
      case "PushEvent":
        return "Push";
      case "WatchEvent":
        return "Star";
      case "IssuesEvent":
        return "Issue";
      case "PullRequestEvent":
        return "PR";
      case "ForkEvent":
        return "Fork";
      case "CreateEvent":
        return "Create";
      case "DeleteEvent":
        return "Delete";
      default:
        return type.replace("Event", "");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        🔍 ユーザー検索
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ユーザー名で検索
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="例: torvalds, language:JavaScript location:Tokyo"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {searching ? "検索中..." : "検索"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-semibold mb-1">検索のヒント:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>language:JavaScript - 言語で絞り込み</li>
            <li>location:Tokyo - 場所で絞り込み</li>
            <li>followers:&gt;100 - フォロワー数で絞り込み</li>
          </ul>
        </div>
      </div>

      {searchResults.length > 0 && !selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => loadUserDetails(user.login)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.name || user.login}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    @{user.login}
                  </p>
                </div>
              </div>
              {user.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>👥 {user.followers} followers</span>
                <span>📁 {user.public_repos} repos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              ← 検索結果に戻る
            </button>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <img
                src={selectedUser.avatar_url}
                alt={selectedUser.login}
                className="w-32 h-32 rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedUser.name || selectedUser.login}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{selectedUser.login}
                </p>
                {selectedUser.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedUser.bio}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {selectedUser.company && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">🏢</span>{" "}
                      {selectedUser.company}
                    </div>
                  )}
                  {selectedUser.location && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">📍</span>{" "}
                      {selectedUser.location}
                    </div>
                  )}
                  {selectedUser.blog && (
                    <div>
                      <a
                        href={selectedUser.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        🔗 Website
                      </a>
                    </div>
                  )}
                  {selectedUser.email && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">✉️</span>{" "}
                      {selectedUser.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.followers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Followers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.following}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Following
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.public_repos}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Repositories
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(selectedUser.created_at).getFullYear()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Joined
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                {[
                  { id: "profile", label: "プロフィール" },
                  { id: "repos", label: "リポジトリ" },
                  { id: "starred", label: "スター" },
                  { id: "activity", label: "アクティビティ" },
                  { id: "connections", label: "つながり" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as typeof activeTab)
                    }
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === "profile" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          よく使う言語
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getLanguageColors(userRepos).map(([lang, count]) => (
                            <span
                              key={lang}
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm"
                            >
                              {lang} ({count})
                            </span>
                          ))}
                        </div>
                      </div>

                      {userSocial.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            SNS リンク
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {userSocial.map((social, i) => (
                              <a
                                key={i}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm transition-colors"
                              >
                                {social.provider}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "repos" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        人気リポジトリ (スター順)
                      </h3>
                      {userRepos.slice(0, 10).map((repo) => (
                        <a
                          key={repo.id}
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                            {repo.name}
                          </h4>
                          {repo.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {repo.language && <span>💻 {repo.language}</span>}
                            <span>⭐ {repo.stargazers_count}</span>
                            <span>🍴 {repo.forks_count}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {activeTab === "starred" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        スターしたリポジトリ
                      </h3>
                      {userStarred.slice(0, 10).map((repo) => (
                        <a
                          key={repo.id}
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                            {repo.full_name}
                          </h4>
                          {repo.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {repo.language && <span>💻 {repo.language}</span>}
                            <span>⭐ {repo.stargazers_count}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        最近のアクティビティ
                      </h3>
                      {userEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {getEventIcon(event.type)}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-semibold">
                                  {getEventText(event.type)}
                                </span>{" "}
                                at {event.repo.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(event.created_at).toLocaleString("ja-JP")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "connections" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          フォロワー ({userFollowers.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {userFollowers.slice(0, 12).map((follower) => (
                            <div
                              key={follower.id}
                              onClick={() => loadUserDetails(follower.login)}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <img
                                src={follower.avatar_url}
                                alt={follower.login}
                                className="w-12 h-12 rounded-full mx-auto mb-2"
                              />
                              <p className="text-xs text-center text-gray-900 dark:text-white font-medium truncate">
                                {follower.login}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          フォロー中 ({userFollowing.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {userFollowing.slice(0, 12).map((following) => (
                            <div
                              key={following.id}
                              onClick={() => loadUserDetails(following.login)}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <img
                                src={following.avatar_url}
                                alt={following.login}
                                className="w-12 h-12 rounded-full mx-auto mb-2"
                              />
                              <p className="text-xs text-center text-gray-900 dark:text-white font-medium truncate">
                                {following.login}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

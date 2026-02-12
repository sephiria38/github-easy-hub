"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type { GitHubRepo, GitHubPullRequest, GitHubBranch } from "@/lib/types";

export default function PullsPage() {
  const { token } = useToken();
  const { client, user } = useGitHub(token);
  const { showToast } = useToast();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pulls, setPulls] = useState<GitHubPullRequest[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    head: "",
    base: "",
    body: "",
  });

  useEffect(() => {
    loadRepos();
  }, [client]);

  useEffect(() => {
    if (selectedRepo && user) {
      loadPulls();
      loadBranches();
    }
  }, [selectedRepo, user, client]);

  const loadRepos = async () => {
    if (!client) return;
    try {
      const data = await client.getAuthenticatedUserRepos();
      setRepos(data);
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const loadPulls = async () => {
    if (!client || !selectedRepo || !user) return;
    setLoading(true);
    try {
      const data = await client.getPullRequests(user.login, selectedRepo);
      setPulls(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    if (!client || !selectedRepo || !user) return;
    try {
      const data = await client.getBranches(user.login, selectedRepo);
      setBranches(data);
      if (data.length > 0 && !formData.base) {
        setFormData((prev) => ({ ...prev, base: data[0].name }));
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user || !selectedRepo) return;

    setCreating(true);
    try {
      await client.createPullRequest(user.login, selectedRepo, {
        title: formData.title,
        head: formData.head,
        base: formData.base,
        body: formData.body,
      });
      showToast("Pull Requestを作成しました！", "success");
      setShowCreateForm(false);
      setFormData({ title: "", head: "", base: "", body: "" });
      loadPulls();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleMerge = async (pr: GitHubPullRequest) => {
    if (!client || !user || !selectedRepo) return;

    try {
      await client.mergePullRequest(user.login, selectedRepo, pr.number);
      showToast("Pull Requestをマージしました！", "success");
      loadPulls();
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        🔀 Pull Request管理
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 Pull Requestって何？
        </h2>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Pull Request（PR）は、あるブランチの変更を別のブランチにマージするための提案です。
          コードレビューを経て、チームメンバーが変更を確認・承認した後にマージされます。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              リポジトリを選択 *
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- 選択してください --</option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.name}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
          {selectedRepo && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              {showCreateForm ? "キャンセル" : "+ 新規作成"}
            </button>
          )}
        </div>

        {showCreateForm && selectedRepo && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              新しいPull Requestを作成
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    元ブランチ (head) *
                  </label>
                  <select
                    value={formData.head}
                    onChange={(e) =>
                      setFormData({ ...formData, head: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">選択</option>
                    {branches.map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    先ブランチ (base) *
                  </label>
                  <select
                    value={formData.base}
                    onChange={(e) =>
                      setFormData({ ...formData, base: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {branches.map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={5}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {creating ? "作成中..." : "作成"}
              </button>
            </form>
          </div>
        )}

        {selectedRepo && !showCreateForm && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pull Request一覧 ({pulls.length})
                </h3>
                {pulls.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Pull Requestがありません
                  </p>
                ) : (
                  pulls.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                pr.state === "open"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : pr.merged_at
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {pr.state === "open"
                                ? "🟢 Open"
                                : pr.merged_at
                                ? "🟣 Merged"
                                : "🔴 Closed"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              #{pr.number}
                            </span>
                          </div>
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                            {pr.title}
                          </h4>
                          {pr.body && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {pr.body}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {pr.head.ref} → {pr.base.ref}
                            </span>
                            <span>
                              作成: {new Date(pr.created_at).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pr.state === "open" && (
                          <button
                            onClick={() => handleMerge(pr)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            マージ
                          </button>
                        )}
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          GitHubで見る
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

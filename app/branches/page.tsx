"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type { GitHubRepo, GitHubBranch } from "@/lib/types";

export default function BranchesPage() {
  const { token } = useToken();
  const { client, user } = useGitHub(token);
  const { showToast } = useToast();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [baseBranch, setBaseBranch] = useState("");

  useEffect(() => {
    loadRepos();
  }, [client]);

  useEffect(() => {
    if (selectedRepo && user) {
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

  const loadBranches = async () => {
    if (!client || !selectedRepo || !user) return;
    setLoading(true);
    try {
      const data = await client.getBranches(user.login, selectedRepo);
      setBranches(data);
      if (data.length > 0 && !baseBranch) {
        setBaseBranch(data[0].name);
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user || !selectedRepo || !newBranchName || !baseBranch) return;

    setCreating(true);
    try {
      const branch = branches.find((b) => b.name === baseBranch);
      if (!branch) {
        throw new Error("ベースブランチが見つかりません");
      }

      await client.createBranch(user.login, selectedRepo, newBranchName, branch.commit.sha);
      showToast("ブランチを作成しました！", "success");
      setShowCreateForm(false);
      setNewBranchName("");
      loadBranches();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        🌿 ブランチ管理
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 ブランチって何？
        </h2>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ブランチは、メインの開発ラインから分岐して独立した作業を行うための機能です。
          新機能の開発やバグ修正を別のブランチで行うことで、メインのコードに影響を与えずに作業できます。
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
              新しいブランチを作成
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ブランチ名 *
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/new-feature"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ベースブランチ *
                </label>
                <select
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
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
                  ブランチ一覧 ({branches.length})
                </h3>
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        🌿 {branch.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        SHA: {branch.commit.sha.substring(0, 7)}
                      </p>
                    </div>
                    {branch.protected && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        🔒 保護中
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

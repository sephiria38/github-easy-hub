"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type { GitHubRepo, GitHubContent } from "@/lib/types";

export default function DownloadPage() {
  const { token } = useToken();
  const { client, user } = useGitHub(token);
  const { showToast } = useToast();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    loadRepos();
  }, [client]);

  useEffect(() => {
    if (selectedRepo && user) {
      loadContents("");
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

  const loadContents = async (path: string) => {
    if (!client || !selectedRepo || !user) return;
    setLoading(true);
    try {
      const data = await client.getContents(user.login, selectedRepo, path);
      if (Array.isArray(data)) {
        setContents(data);
        setCurrentPath(path);
      } else {
        // Single file
        downloadFile(data);
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file: GitHubContent) => {
    if (file.download_url) {
      window.open(file.download_url, "_blank");
      showToast(`${file.name} をダウンロード中...`, "info");
    }
  };

  const downloadZip = async () => {
    if (!selectedRepo || !user || !token) return;
    const repo = repos.find((r) => r.name === selectedRepo);
    const branch = repo?.default_branch ?? "main";
    try {
      const response = await fetch(
        `/api/download?owner=${encodeURIComponent(user.login)}&repo=${encodeURIComponent(selectedRepo)}&branch=${encodeURIComponent(branch)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `ダウンロードに失敗しました: ${response.status}`
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedRepo}-${branch}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("ZIPファイルをダウンロードしました", "info");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const navigateBack = () => {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    const newPath = pathParts.join("/");
    loadContents(newPath);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        📥 ファイルダウンロード
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 ファイルダウンロードについて
        </h2>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          リポジトリのファイルを個別にダウンロードしたり、プロジェクト全体をZIPでダウンロードできます。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div>
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
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentPath && (
                  <button
                    onClick={navigateBack}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    ← 戻る
                  </button>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPath || "/"}
                </span>
              </div>
              <button
                onClick={downloadZip}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                📦 プロジェクトをZIPダウンロード
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {contents.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    ファイルがありません
                  </p>
                ) : (
                  contents.map((item) => (
                    <div
                      key={item.path}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {item.type === "dir" ? "📁" : "📄"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          {item.type === "file" && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(item.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      {item.type === "dir" ? (
                        <button
                          onClick={() => loadContents(item.path)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          開く
                        </button>
                      ) : (
                        <button
                          onClick={() => downloadFile(item)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          ダウンロード
                        </button>
                      )}
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

"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type { GitHubRepo, GitHubBranch } from "@/lib/types";

export default function UploadPage() {
  const { token } = useToken();
  const { client, user } = useGitHub(token);
  const { showToast } = useToast();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: "pending" | "uploading" | "success" | "error";
  }>({});

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
    try {
      const data = await client.getBranches(user.login, selectedRepo);
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranch(data[0].name);
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
      const progress: { [key: string]: "pending" } = {};
      fileList.forEach((file) => {
        progress[file.name] = "pending";
      });
      setUploadProgress(progress);
    }
  };

  const handleUpload = async () => {
    if (!client || !user || !selectedRepo || !selectedBranch || files.length === 0) {
      showToast("必要な情報を入力してください", "error");
      return;
    }

    setUploading(true);

    for (const file of files) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: "uploading" }));

      try {
        const reader = new FileReader();
        const content = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = btoa(reader.result as string);
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsBinaryString(file);
        });

        await client.uploadFile(
          user.login,
          selectedRepo,
          file.name,
          content,
          `Upload ${file.name}`,
          selectedBranch
        );

        setUploadProgress((prev) => ({ ...prev, [file.name]: "success" }));
      } catch (error: any) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: "error" }));
        showToast(`${file.name}: ${error.message}`, "error");
      }
    }

    setUploading(false);
    const allSuccess = Object.values(uploadProgress).every(
      (status) => status === "success"
    );
    if (allSuccess) {
      showToast("全てのファイルをアップロードしました！", "success");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        📤 ファイルアップロード
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 ファイルアップロードについて
        </h2>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ローカルのファイルを選択したリポジトリにアップロードできます。複数のファイルを一度にアップロードすることも可能です。
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ブランチを選択 *
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ファイルを選択 *
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              選択されたファイル ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {uploadProgress[file.name] === "pending" && "⏳ 待機中"}
                    {uploadProgress[file.name] === "uploading" && "⏫ アップロード中"}
                    {uploadProgress[file.name] === "success" && "✅ 完了"}
                    {uploadProgress[file.name] === "error" && "❌ エラー"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedRepo || !selectedBranch || files.length === 0}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface TokenInputProps {
  onTokenSubmit: (token: string) => void;
}

export default function TokenInput({ onTokenSubmit }: TokenInputProps) {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 GitHub Easy Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            GitHubを簡単に操作できるWebアプリ
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔑 GitHub Personal Access Token を入力
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Personal Access Token
              </label>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              ログイン
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 トークンの取得方法
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>GitHubにログイン</li>
              <li>Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
              <li>Generate new token をクリック</li>
              <li>必要な権限にチェック（repo, user など）</li>
              <li>生成されたトークンをコピーして入力</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

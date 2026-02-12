"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ようこそ GitHub Easy Hub へ！ 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          GitHubをもっと簡単に、もっと便利に使えるWebアプリケーションです。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/repos"
            className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              リポジトリ管理
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              リポジトリの一覧表示、作成、管理
            </p>
          </Link>

          <Link
            href="/upload"
            className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📤</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ファイルアップロード
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              リポジトリにファイルをアップロード
            </p>
          </Link>

          <Link
            href="/download"
            className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📥</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ファイルダウンロード
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              リポジトリからファイルをダウンロード
            </p>
          </Link>

          <Link
            href="/branches"
            className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ブランチ管理
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ブランチの作成と管理
            </p>
          </Link>

          <Link
            href="/issues"
            className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Issue管理
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              課題の追跡と管理
            </p>
          </Link>

          <Link
            href="/pulls"
            className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <div className="text-3xl mb-2">🔀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Pull Request管理
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              変更のレビューとマージ
            </p>
          </Link>

          <Link
            href="/explore"
            className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors md:col-span-2"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ユーザー検索
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              GitHubユーザーを検索して詳細情報を表示
            </p>
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">
          💡 このアプリについて
        </h2>
        <p className="text-blue-800 dark:text-blue-300">
          GitHub Easy Hubは、GitHub
          APIを活用してリポジトリ管理やユーザー検索を簡単に行えるWebアプリケーションです。
          サイドバーから各機能にアクセスして、GitHubをより便利に活用しましょう！
        </p>
      </div>
    </div>
  );
}

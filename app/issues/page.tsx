"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useToken } from "@/hooks/useToken";
import { useToast } from "@/components/Toast";
import type { GitHubRepo, GitHubIssue } from "@/lib/types";

// Issue テンプレート
const issueTemplates = {
  blank: {
    name: "空白",
    body: "",
  },
  feature: {
    name: "機能リクエスト",
    body: `## Overview / 概要
[アプリの目的・何を解決するか]

## Tech Stack / 技術スタック
- Framework: 
- Language: 
- Key Libraries: 
- API: 
- Deployment: 

## Requirements / 機能要件
- [ ] 

## API Specification / API仕様
[エンドポイント、リクエスト/レスポンス形式など]

## UI Specification / UI仕様
[画面構成、コンポーネント、表示ルール]

## Environment Variables / 環境変数
- \`KEY_NAME\`: 用途

## Language / 言語指示
All code comments, UI text, error messages, and documentation must be written in Japanese (日本語).`,
  },
  bug: {
    name: "バグ報告",
    body: `## 問題の説明 / Description
[バグの詳細な説明]

## 再現手順 / Steps to Reproduce
1. 
2. 
3. 

## 期待される動作 / Expected Behavior
[本来どう動くべきか]

## 実際の動作 / Actual Behavior
[実際にどう動いているか]

## 環境情報 / Environment
- OS: 
- ブラウザ: 
- バージョン: 

## スクリーンショット / Screenshots
[スクリーンショットがあれば添付]

## 追加情報 / Additional Context
[その他関連する情報]`,
  },
  task: {
    name: "タスク",
    body: `## タスク概要 / Task Overview
[タスクの目的と背景]

## 詳細 / Details
[具体的な作業内容]

## チェックリスト / Checklist
- [ ] 
- [ ] 
- [ ] 

## 関連情報 / Related Information
[関連するIssueやPR、ドキュメントへのリンク]

## 完了条件 / Definition of Done
[このタスクが完了したと判断できる条件]`,
  },
} as const;

export default function IssuesPage() {
  const { token } = useToken();
  const { client, user } = useGitHub(token);
  const { showToast } = useToast();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof issueTemplates>("blank");

  useEffect(() => {
    loadRepos();
  }, [client]);

  useEffect(() => {
    if (selectedRepo && user) {
      loadIssues();
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

  const loadIssues = async () => {
    if (!client || !selectedRepo || !user) return;
    setLoading(true);
    try {
      const data = await client.getIssues(user.login, selectedRepo);
      // Filter out pull requests
      const realIssues = data.filter((issue) => !issue.pull_request);
      setIssues(realIssues);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user || !selectedRepo) return;

    setCreating(true);
    try {
      await client.createIssue(user.login, selectedRepo, formData);
      showToast("Issueを作成しました！", "success");
      setShowCreateForm(false);
      setFormData({ title: "", body: "" });
      setSelectedTemplate("blank");
      loadIssues();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleTemplateChange = (template: keyof typeof issueTemplates) => {
    setSelectedTemplate(template);
    setFormData(prev => ({ ...prev, body: issueTemplates[template].body }));
  };

  const handleClose = async (issue: GitHubIssue) => {
    if (!client || !user || !selectedRepo) return;

    try {
      await client.updateIssue(user.login, selectedRepo, issue.number, {
        state: "closed",
      });
      showToast("Issueをクローズしました！", "success");
      loadIssues();
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user || !selectedRepo || !selectedIssue || !comment) return;

    setAddingComment(true);
    try {
      await client.addIssueComment(user.login, selectedRepo, selectedIssue.number, comment);
      showToast("コメントを追加しました！", "success");
      setComment("");
      setSelectedIssue(null);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        📝 Issue管理
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 Issueって何？
        </h2>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Issueは、バグ報告や機能リクエスト、タスクの管理などに使われる課題追跡システムです。
          プロジェクトの問題点や改善点を整理して管理できます。
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
              新しいIssueを作成
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  テンプレートを選択
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value as keyof typeof issueTemplates)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(issueTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  本文
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={15}
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
                  Issue一覧 ({issues.length})
                </h3>
                {issues.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Issueがありません
                  </p>
                ) : (
                  issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                issue.state === "open"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {issue.state === "open" ? "🟢 Open" : "🔴 Closed"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              #{issue.number}
                            </span>
                          </div>
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                            {issue.title}
                          </h4>
                          {issue.body && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {issue.body}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>💬 {issue.comments} コメント</span>
                            <span>
                              作成: {new Date(issue.created_at).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {issue.state === "open" && (
                          <>
                            <button
                              onClick={() => setSelectedIssue(issue)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              コメント追加
                            </button>
                            <button
                              onClick={() => handleClose(issue)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              クローズ
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              コメントを追加 - #{selectedIssue.number}
            </h3>
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="コメントを入力..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={5}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingComment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {addingComment ? "送信中..." : "送信"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssue(null);
                    setComment("");
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

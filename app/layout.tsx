"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import { useToken } from "@/hooks/useToken";
import { useGitHub } from "@/hooks/useGitHub";
import TokenInput from "@/components/TokenInput";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setToken, clearToken, isLoading: tokenLoading } = useToken();
  const { user, client, isLoading: userLoading, error } = useGitHub(token);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Fetch rate limit when client is available
  useEffect(() => {
    if (client) {
      client
        .getRateLimit()
        .then((data) => {
          setRateLimit({
            remaining: data.resources.core.remaining,
            limit: data.resources.core.limit,
          });
        })
        .catch((err) => console.error("Failed to fetch rate limit:", err));
    }
  }, [client]);

  const handleLogout = () => {
    clearToken();
    setSidebarOpen(false);
  };

  if (tokenLoading || userLoading) {
    return (
      <html lang="ja">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!token || error) {
    return (
      <html lang="ja">
        <body>
          <TokenInput onTokenSubmit={setToken} />
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <body>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
              user={user}
              onLogout={handleLogout}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              rateLimit={rateLimit || undefined}
            />
            <div className="flex h-[calc(100vh-57px)]">
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-6">{children}</div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

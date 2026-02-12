"use client";

import { useState, useEffect } from "react";
import GitHubClient from "@/lib/github";
import { GitHubUser } from "@/lib/types";

export function useGitHub(token: string | null) {
  const [client, setClient] = useState<GitHubClient | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setClient(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const gitHubClient = new GitHubClient(token);
    setClient(gitHubClient);

    gitHubClient
      .getAuthenticatedUser()
      .then((userData) => {
        setUser(userData);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setError("Failed to authenticate. Please check your token.");
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  return { client, user, isLoading, error };
}

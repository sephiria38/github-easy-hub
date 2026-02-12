"use client";

import { useState, useEffect } from "react";

const TOKEN_KEY = "github_token";

export function useToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    setTokenState(storedToken);
    setIsLoading(false);
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return { token, setToken, clearToken, isLoading };
}

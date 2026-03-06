"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "anthropic_api_key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function ApiKeyInput() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setKey(stored);
      setSaved(true);
    } else {
      setOpen(true);
    }
  }, []);

  const isValid = key.startsWith("sk-ant-") && key.length >= 20;

  const handleSave = () => {
    if (!isValid) return;
    localStorage.setItem(STORAGE_KEY, key);
    setSaved(true);
    setOpen(false);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKey("");
    setSaved(false);
    setOpen(true);
  };

  const masked = key ? `sk-ant-***...${key.slice(-4)}` : "";

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm cursor-pointer"
      >
        <span className="text-white/70 font-medium">Anthropic APIキー</span>
        <span className={`text-xs ${saved ? "text-emerald-400" : "text-yellow-400"}`}>
          {saved ? "設定済み" : "未設定"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {saved ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-white/40 bg-white/5 rounded px-3 py-2 font-mono">
                {masked}
              </code>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-2 cursor-pointer"
              >
                削除
              </button>
            </div>
          ) : (
            <>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  キーはブラウザに保存され、サーバーには保存されません
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isValid}
                  className="text-xs bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold px-4 py-1.5 rounded cursor-pointer disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type OfflineCommand = {
  type: string;
  payload: unknown;
  createdAt: string;
};

const QUEUE_KEY = "grammart:offline-command-queue";

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

export function enqueueOfflineCommand(command: OfflineCommand) {
  const existing = readQueue();
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, command]));
}

export function readQueue(): OfflineCommand[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as OfflineCommand[];
  } catch {
    return [];
  }
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

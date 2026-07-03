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

import { pushOfflineSync } from "./api";

export async function syncOfflineQueue() {
  const queue = readQueue();
  if (queue.length === 0) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  const operations = queue.map((cmd, idx) => ({
    clientOperationId: `offline-${cmd.createdAt}-${idx}`,
    type: cmd.type,
    payload: JSON.stringify(cmd.payload)
  }));

  try {
    const response = await pushOfflineSync(operations);
    if (response && response.results) {
      clearQueue();
      return response.results;
    }
  } catch (error) {
    console.error("Offline queue sync failed:", error);
    throw error;
  }
}

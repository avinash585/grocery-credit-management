"use client";

import { useEffect, useState } from "react";
import { addQueueItem, getQueueItems, clearQueueItems, OfflineCommand } from "./db";

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setOnline(navigator.onLine);
    }
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

export async function enqueueOfflineCommand(command: OfflineCommand): Promise<void> {
  await addQueueItem(command);
}

export async function readQueue(): Promise<OfflineCommand[]> {
  return await getQueueItems();
}

export async function clearQueue(): Promise<void> {
  await clearQueueItems();
}

import { pushOfflineSync } from "./api";

export async function syncOfflineQueue() {
  const queue = await readQueue();
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
      await clearQueue();
      return response.results;
    }
  } catch (error) {
    console.error("Offline queue sync failed:", error);
    throw error;
  }
}

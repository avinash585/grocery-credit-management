import type { Language } from "@/lib/i18n";
import { enqueueOfflineCommand } from "@/lib/offline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  preferredLanguage: Language;
  outstandingBalance: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  sellingPrice: string;
};

export type BillResponse = {
  id: string;
  customerId: string;
  status: string;
  totalAmount: string;
  creditBill: boolean;
};

export function getToken() {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem("grammart:access-token");
}

export function setToken(token: string) {
  localStorage.setItem("grammart:access-token", token);
}

async function apiFetch<T>(path: string, options: RequestInit = {}, offlineCommand?: { type: string; payload: unknown }) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  if (!navigator.onLine && offlineCommand) {
    enqueueOfflineCommand({ type: offlineCommand.type, payload: offlineCommand.payload, createdAt: new Date().toISOString() });
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (offlineCommand) {
      enqueueOfflineCommand({ type: offlineCommand.type, payload: offlineCommand.payload, createdAt: new Date().toISOString() });
    }
    const apiHost = API_BASE_URL.replace(/\/api\/?$/, "");
    const isLocalHttpApi = apiHost.startsWith("http://localhost") || apiHost.startsWith("http://127.0.0.1");
    if (typeof window !== "undefined" && window.location.protocol === "https:" && isLocalHttpApi) {
      throw new Error("Backend is local only. Deploy the Spring Boot API to HTTPS and set NEXT_PUBLIC_API_BASE_URL in Vercel.");
    }
    throw new Error(error instanceof Error ? error.message : "Could not reach backend");
  }
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const body = await response.json() as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      message = response.statusText || message;
    }
    if (offlineCommand) {
      enqueueOfflineCommand({ type: offlineCommand.type, payload: offlineCommand.payload, createdAt: new Date().toISOString() });
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function login(phone: string, password: string) {
  const response = await apiFetch<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password })
  });
  if (response) {
    setToken(response.accessToken);
  }
  return response;
}

export async function registerShop(payload: { shopName: string; ownerName: string; phone: string; password: string; preferredLanguage: Language }) {
  const response = await apiFetch<{ accessToken: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (response) {
    setToken(response.accessToken);
  }
  return response;
}

export function createCustomer(payload: { name: string; phone?: string; preferredLanguage: Language; notes?: string }) {
  return apiFetch<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(payload)
  }, { type: "CREATE_CUSTOMER", payload });
}

export function searchCustomers(query: string) {
  return apiFetch<Customer[]>(`/customers?query=${encodeURIComponent(query)}`);
}

export function searchProducts(query: string) {
  return apiFetch<Product[]>(`/products?query=${encodeURIComponent(query)}`);
}

export function createCreditBill(payload: { customerId: string; creditBill: boolean; items: Array<{ productId: string; quantity: string }> }) {
  return apiFetch<BillResponse>("/bills", {
    method: "POST",
    body: JSON.stringify(payload)
  }, { type: "CREATE_BILL", payload });
}

export function receivePayment(payload: { customerId: string; amount: string; note?: string }) {
  return apiFetch<{ customerId: string; outstandingBalance: string }>("/ledger/payment", {
    method: "POST",
    body: JSON.stringify(payload)
  }, { type: "RECEIVE_PAYMENT", payload });
}

export function chatWithAi(payload: {
  message: string;
  language: Language;
  customerName?: string;
  outstandingBalance?: string;
  transcript?: string;
  customers?: Customer[];
  products?: Product[];
}) {
  return fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then((response) => {
    if (!response.ok) {
      throw new Error("AI chat failed");
    }
    return response.json() as Promise<{ answer: string; live: boolean }>;
  });
}

export async function parseVoiceCommand(transcript: string, language: Language) {
  const payload = { transcript, language };
  if (!navigator.onLine) {
    enqueueOfflineCommand({ type: "VOICE_COMMAND", payload, createdAt: new Date().toISOString() });
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/voice/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    enqueueOfflineCommand({ type: "VOICE_COMMAND", payload, createdAt: new Date().toISOString() });
    return null;
  }

  return response.json() as Promise<{
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }>;
}

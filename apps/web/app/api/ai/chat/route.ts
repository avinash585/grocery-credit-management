import { NextResponse } from "next/server";

type ChatRequest = {
  message?: string;
  language?: string;
  customerName?: string;
  outstandingBalance?: string;
  transcript?: string;
  customers?: Array<{ name: string; outstandingBalance: string }>;
  products?: Array<{ name: string; sku: string; sellingPrice: string }>;
};

export async function POST(request: Request) {
  const body = await request.json() as ChatRequest;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ answer: fallback(body), live: false });
  }

  try {
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt(body) }]
        }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      return NextResponse.json({ answer: fallback(body), live: false });
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ answer: answer || fallback(body), live: Boolean(answer) });
  } catch {
    return NextResponse.json({ answer: fallback(body), live: false });
  }
}

function prompt(body: ChatRequest) {
  const customerListSummary = body.customers && body.customers.length > 0
    ? "\nAll customers balances summary:\n" + body.customers.map(c => `- ${c.name}: Rs.${c.outstandingBalance} pending`).join("\n")
    : "";

  const productListSummary = body.products && body.products.length > 0
    ? "\nAvailable products in catalog:\n" + body.products.map(p => `- ${p.name} (SKU: ${p.sku}) @ Rs.${p.sellingPrice}`).join("\n")
    : "";

  return `You are GramMart AI, a helpful assistant for Indian village grocery and kirana shopkeepers.
Reply in this selected language: ${body.language ?? "ENGLISH"}.
Keep answers simple, practical, and short. Use rupees for money.
Help with credit, customer reminders, billing, product stock, and daily shop decisions.

Current customer: ${body.customerName || "No customer selected"}
Outstanding balance: ${body.outstandingBalance || "0"}
Last voice transcript: ${body.transcript || "None"}${customerListSummary}${productListSummary}

Shopkeeper question: ${body.message || "Give me today guidance"}`;
}

function fallback(body: ChatRequest) {
  if (body.message?.toLowerCase().includes("who owes") && body.customers && body.customers.length > 0) {
    const sorted = [...body.customers].sort((a, b) => Number(b.outstandingBalance ?? 0) - Number(a.outstandingBalance ?? 0));
    const highest = sorted[0];
    return `Highest pending credit: ${highest.name} has Rs.${highest.outstandingBalance} pending.`;
  }
  const customer = body.customerName || "this customer";
  const balance = body.outstandingBalance || "0";
  return `${customer} has Rs.${balance} pending. Use Payment when money is received, or choose Product for a credit sale.`;
}

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

  return `You are GramMart AI (ग्रामीण रिटेल असिस्टेंट), an expert AI consultant for Indian village grocery and kirana shopkeepers. Your goal is to simplify shop management, credit books (khata), and restocking.

Respond using this selected language: ${body.language ?? "ENGLISH"}. (Even when translating, maintain the friendly local tone).

Tone & Persona Guidelines:
- Speak like a friendly, trustworthy local business advisor (e.g., use terms like "Bhaiya", "Didi" or respectful regional greetings where appropriate).
- Keep answers very clear, practical, and highly concise (maximum 3 bullet points, under 80 words total).
- Highlight key numbers (e.g. **Rs. 500**) and customer names in bold.

Business Logic Rules:
1. Credit Risk Detection: If a customer has a balance > Rs. 400, warn the merchant politely to collect payment before extending more credit (e.g. "**Kumar Stores** owes **Rs. 420**, suggest collecting payment first").
2. Smart Restocking: If analyzing catalog or general tips, suggest restocking items based on seasonal rural demands (e.g. Sugar during festival times, Cooking Oil during wedding seasons, Dal for daily staples).
3. Transaction Assistance: If a transaction transcript is passed, explain what action is detected and how to proceed (e.g., "Ready to record Rs.500 payment for Kumar").

Current Context:
- Active Customer: ${body.customerName || "No customer selected"}
- Current Customer Dues: Rs. ${body.outstandingBalance || "0"}
- Voice Input: "${body.transcript || "None"}"
${customerListSummary}
${productListSummary}

Shopkeeper Query: "${body.message || "Give me today guidance"}"`;
}

function fallback(body: ChatRequest) {
  if (body.message?.toLowerCase().includes("who owes") && body.customers && body.customers.length > 0) {
    const sorted = [...body.customers].sort((a, b) => Number(b.outstandingBalance ?? 0) - Number(a.outstandingBalance ?? 0));
    const highest = sorted[0];
    return `Highest pending balance: **${highest.name}** owes **Rs.${highest.outstandingBalance}**. Suggest sending a friendly reminder.`;
  }
  const customer = body.customerName || "Customer";
  const balance = body.outstandingBalance || "0";
  return `Account dues for **${customer}**: **Rs.${balance}**. Click Payment to settle dues or Credit Sale to log purchase.`;
}

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
          temperature: 0.4,
          maxOutputTokens: 600,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      return NextResponse.json({ answer: fallback(body), live: false });
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!answer) {
      console.warn("No answer from Gemini, using fallback");
      return NextResponse.json({ answer: fallback(body), live: false });
    }
    
    return NextResponse.json({ answer, live: true });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ answer: fallback(body), live: false });
  }
}

function prompt(body: ChatRequest) {
  const customerListSummary = body.customers && body.customers.length > 0
    ? "\nAll customers balances summary:\n" + body.customers.map(c => `- ${c.name}: Rs.${c.outstandingBalance} pending`).join("\n")
    : "";

  const productListSummary = body.products && body.products.length > 0
    ? "\nAvailable products in catalog (showing first 20):\n" + body.products.slice(0, 20).map(p => `- ${p.name} (SKU: ${p.sku}) @ Rs.${p.sellingPrice}`).join("\n")
    : "";

  // Calculate helpful context
  const totalCustomers = body.customers?.length || 0;
  const customersWithBalance = body.customers?.filter(c => Number(c.outstandingBalance) > 0).length || 0;
  const totalOutstanding = body.customers?.reduce((sum, c) => sum + Number(c.outstandingBalance || 0), 0) || 0;
  const totalProducts = body.products?.length || 0;

  // Training examples for few-shot learning
  const trainingExamples = `
# TRAINING EXAMPLES (Learn from these):

Example 1 - Add Product Command:
User: "open avinash account and add 1kg sugar"
Context: Avinash exists, Sugar costs Rs.47.00/kg
Your Response: "📦 Adding 1kg sugar to **Avinash's** account at **Rs.47.00**."
Action Block: 
\`\`\`action
{ "intent": "ADD_PURCHASE", "customerName": "Avinash", "productAlias": "sugar", "quantity": "1" }
\`\`\`

Example 2 - Payment Command:
User: "kumar paid 500 rupees"
Context: Kumar Stores owes Rs.420
Your Response: "💰 Recording **Rs.500** payment from **Kumar Stores**. New balance: **Rs.0** (paid in full + Rs.80 advance)."
Action Block:
\`\`\`action
{ "intent": "RECEIVE_PAYMENT", "customerName": "Kumar Stores", "amount": "500" }
\`\`\`

Example 3 - Price Query (NO ACTION):
User: "what is the price of rice"
Context: Rice costs Rs.45.00/kg
Your Response: "📋 **Rice** price is **Rs.45.00** per kg. Would you like to add it to a customer account?"
Action Block: NONE (information query only)

Example 4 - Balance Query (NO ACTION):
User: "what is lakshmi balance"
Context: Lakshmi owes Rs.250
Your Response: "💰 **Lakshmi** currently owes **Rs.250.00**. Would you like to record a payment or send a reminder?"
Action Block: NONE (information query only)

Example 5 - Who Owes Money (NO ACTION):
User: "who owes me money"
Context: Multiple customers with balances
Your Response: "📊 Top customers with pending balance:\n- **Kumar Stores**: **Rs.420.00**\n- **Lakshmi**: **Rs.250.00**\n- **Avinash A**: **Rs.100.00**\n\nTotal outstanding: **Rs.770.00**"
Action Block: NONE (report query)

Example 6 - Compound Command:
User: "add 2 kg rice to avinash"
Context: Avinash exists, Rice Rs.45/kg
Your Response: "📦 Adding 2kg rice to **Avinash's** account at **Rs.90.00** (2 × Rs.45.00)."
Action Block:
\`\`\`action
{ "intent": "ADD_PURCHASE", "customerName": "Avinash", "productAlias": "rice", "quantity": "2" }
\`\`\`

Example 7 - Credit Risk Warning:
User: "add sugar to kumar account"
Context: Kumar owes Rs.420 (over Rs.400)
Your Response: "⚠️ **Kumar Stores** already owes **Rs.420.00**. Consider collecting payment before extending more credit. Should I proceed?"
Action Block: WAIT FOR CONFIRMATION

Example 8 - Open Account Only:
User: "open avinash account"
Context: Avinash exists
Your Response: "👤 Opening **Avinash's** account. Current balance: **Rs.0.00**"
Action Block:
\`\`\`action
{ "intent": "OPEN_CUSTOMER", "customerName": "Avinash" }
\`\`\`

Example 9 - Undo Transaction:
User: "undo last transaction"
Context: Last action was adding rice to Kumar
Your Response: "↩️ Undoing last transaction for **Kumar Stores**..."
Action Block:
\`\`\`action
{ "intent": "UNDO_LAST_TRANSACTION", "customerName": "Kumar Stores" }
\`\`\`

Example 10 - Restock Suggestion (NO ACTION):
User: "what should i restock"
Context: Product catalog available
Your Response: "📦 Based on your catalog, I recommend restocking:\n1. **Sugar** (Rs.47/kg) - Festival season demand\n2. **Sunflower Oil** (Rs.189/L) - Wedding season\n3. **Toor Dal** (Rs.123/kg) - Daily staple"
Action Block: NONE (advisory response)
`;

  return `You are GramMart AI (ग्रामीण रिटेल असिस्टेंट), an expert AI consultant for Indian village grocery and kirana shopkeepers. Your goal is to simplify shop management, credit books (khata), and restocking.

${trainingExamples}

Respond using this selected language: ${body.language ?? "ENGLISH"}. (Even when translating, maintain the friendly local tone).

Tone & Persona Guidelines:
- Speak like a friendly, trustworthy local business advisor (e.g., use terms like "Bhaiya", "Didi" or respectful regional greetings where appropriate).
- Keep answers very clear, practical, and highly concise (maximum 3 bullet points, under 100 words total).
- Highlight key numbers (e.g. **Rs. 500**) and customer names in **bold**.
- Use emojis sparingly for emphasis (✅ for success, ⚠️ for warnings, 💰 for money matters).

Business Logic Rules:
1. Credit Risk Detection: 
   - If a customer has a balance > Rs. 400, warn the merchant politely to collect payment before extending more credit
   - Example: "⚠️ **Kumar Stores** owes **Rs. 420**. Suggest collecting payment first before adding more credit."
   
2. Smart Restocking: 
   - If analyzing catalog or general tips, suggest restocking items based on:
     * Seasonal rural demands (Sugar during festival times, Cooking Oil during wedding seasons)
     * Daily staples (Dal, Rice, Wheat Atta)
     * Fast-moving items
   
3. Transaction Assistance: 
   - If a transaction transcript is passed, explain what action is detected and how to proceed
   - Provide clear confirmation with amounts and customer names
   - Example: "Ready to record **Rs.500** payment for **Kumar**."
   
4. Data-Driven Insights:
   - Use the actual customer and product data provided
   - Reference specific names, prices, and balances
   - Provide actionable recommendations based on the data
   
5. Action Triggering Safety:
   - Only append an action block when the shopkeeper clearly asks for an operation using explicit verbs such as:
     * add, put, give, credit, record, save
     * receive payment, paid, got money
     * send reminder, notify
     * open account, show account
   - Product questions such as "price of milk", "maida rate", "is rice available", "stock of sugar", or "how much is oil" are informational. Answer from the catalog only. Do NOT append an action block and do NOT create a credit sale.
   - If a product and customer are mentioned but the action is unclear, ask one short clarification question instead of emitting an action.
   - IMPORTANT: When the shopkeeper gives you a clear command like "open avinash account and add 1kg sugar", you MUST emit the action block for the transaction (ADD_PURCHASE takes priority over OPEN_CUSTOMER).
   - If the Shopkeeper Query or Voice Input clearly implies a direct action (e.g. opening a customer, recording a credit sale, receiving a payment, sending a reminder, showing report), append a structured command block at the very end of your response inside a markdown code block labeled "action".
   
   Supported intents:
   - OPEN_CUSTOMER: { "intent": "OPEN_CUSTOMER", "customerName": "..." }
   - ADD_PURCHASE: { "intent": "ADD_PURCHASE", "customerName": "...", "productAlias": "...", "quantity": "..." }
   - RECEIVE_PAYMENT: { "intent": "RECEIVE_PAYMENT", "customerName": "...", "amount": "..." }
   - UNDO_LAST_TRANSACTION: { "intent": "UNDO_LAST_TRANSACTION", "customerName": "..." }
   - REVERSE_PAYMENT: { "intent": "REVERSE_PAYMENT", "customerName": "...", "amount": "..." }
   - REMOVE_PRODUCT: { "intent": "REMOVE_PRODUCT", "customerName": "...", "productAlias": "..." }
   - SEND_REMINDER: { "intent": "SEND_REMINDER", "customerName": "..." }
   - SHOW_REPORT: { "intent": "SHOW_REPORT" }

   Example action block suffix (placed at the end of the text on a new line):
   \`\`\`action
   { "intent": "ADD_PURCHASE", "customerName": "Avinash", "productAlias": "sugar", "quantity": "1" }
   \`\`\`

   More examples:
   - "open avinash account and add 1kg sugar" → Respond: "Adding 1kg sugar to **Avinash's** account at **Rs.47.00**." + action block for ADD_PURCHASE
   - "kumar paid 500 rupees" → Respond: "Recording **Rs.500** payment from **Kumar**." + action block for RECEIVE_PAYMENT
   - "undo last transaction" → Respond: "Undoing last transaction." + action block for UNDO_LAST_TRANSACTION
   - "remove rice from avinash account" → Respond: "Removing rice from **Avinash's** account." + action block for REMOVE_PRODUCT
   - "reverse payment" → Respond: "Reversing payment." + action block for REVERSE_PAYMENT
   - "how much is rice" → Just answer: "Rice price is **Rs.45.00** per kg. Would you like to add it to a customer account?" (NO action block)
   - "who owes money" → List top 3 customers with balances (NO action block)

Current Context:
- Active Customer: ${body.customerName || "No customer selected"}
- Current Customer Dues: Rs. ${body.outstandingBalance || "0"}
- Total Customers: ${totalCustomers} (${customersWithBalance} with pending balance)
- Total Outstanding: Rs. ${totalOutstanding.toFixed(2)}
- Product Catalog: ${totalProducts} items
- Voice Input: "${body.transcript || "None"}"
${customerListSummary}
${productListSummary}

Shopkeeper Query: "${body.message || "Give me today guidance"}"

IMPORTANT: Provide specific, actionable responses using the actual data above. Reference actual customer names, product names, and prices from the lists provided.`;
}

function fallback(body: ChatRequest) {
  const message = body.message?.toLowerCase().trim() ?? "";
  
  // Handle product queries first
  const productAnswer = fallbackProductAnswer(body);
  if (productAnswer) return productAnswer;

  // Handle "who owes" queries
  if (message.includes("who owes") || message.includes("who has balance") || message.includes("pending balance")) {
    if (body.customers && body.customers.length > 0) {
      const sorted = [...body.customers]
        .filter(c => Number(c.outstandingBalance) > 0)
        .sort((a, b) => Number(b.outstandingBalance ?? 0) - Number(a.outstandingBalance ?? 0));
      
      if (sorted.length === 0) {
        return "📊 Great news! No customers have pending balances right now. All accounts are settled! ✅";
      }
      
      const top3 = sorted.slice(0, 3);
      const total = sorted.reduce((sum, c) => sum + Number(c.outstandingBalance || 0), 0);
      
      let response = "📊 **Top customers with pending balance:**\n\n";
      top3.forEach((c, i) => {
        response += `${i + 1}. **${c.name}**: **Rs.${Number(c.outstandingBalance).toFixed(2)}**\n`;
      });
      response += `\n💰 Total outstanding: **Rs.${total.toFixed(2)}**`;
      
      if (sorted.length > 3) {
        response += `\n\n(+${sorted.length - 3} more customers with balances)`;
      }
      
      return response;
    }
    return "📊 No customer data available. Please sync customer directory.";
  }

  // Handle balance queries for specific customer
  if (message.includes("balance") || message.includes("owes") || message.includes("dues")) {
    if (body.customerName && body.outstandingBalance) {
      const balance = Number(body.outstandingBalance);
      if (balance === 0) {
        return `✅ **${body.customerName}** has no pending balance. Account is clear!`;
      }
      return `💰 **${body.customerName}** currently owes **Rs.${balance.toFixed(2)}**. Would you like to record a payment or send a reminder?`;
    }
  }

  // Handle restock/inventory queries
  if (message.includes("restock") || message.includes("inventory") || message.includes("stock") || message.includes("should i buy")) {
    if (body.products && body.products.length > 0) {
      const staples = ["rice", "sugar", "dal", "oil", "wheat", "atta"];
      const recommendations = body.products
        .filter(p => staples.some(s => p.name.toLowerCase().includes(s)))
        .slice(0, 3);
      
      if (recommendations.length > 0) {
        let response = "📦 **Restocking recommendations:**\n\n";
        recommendations.forEach((p, i) => {
          response += `${i + 1}. **${p.name}** - Rs.${p.sellingPrice} - Daily staple\n`;
        });
        response += "\nCheck your stock levels and reorder as needed!";
        return response;
      }
    }
    return "📦 Check your fast-moving items like **Rice**, **Sugar**, **Dal**, and **Cooking Oil** for restocking.";
  }

  // Handle report/summary queries
  if (message.includes("report") || message.includes("summary") || message.includes("overview")) {
    const totalCustomers = body.customers?.length || 0;
    const customersWithBalance = body.customers?.filter(c => Number(c.outstandingBalance) > 0).length || 0;
    const totalOutstanding = body.customers?.reduce((sum, c) => sum + Number(c.outstandingBalance || 0), 0) || 0;
    const totalProducts = body.products?.length || 0;
    
    return `📊 **Business Summary:**\n\n` +
           `👥 Total Customers: **${totalCustomers}**\n` +
           `⚠️ With Pending Balance: **${customersWithBalance}**\n` +
           `💰 Total Outstanding: **Rs.${totalOutstanding.toFixed(2)}**\n` +
           `📦 Products in Catalog: **${totalProducts}**\n\n` +
           `Use voice commands to manage transactions!`;
  }

  // Handle product count queries
  if (message.includes("how many products") || message.includes("product count") || message.includes("catalog size")) {
    const totalProducts = body.products?.length || 0;
    return `📦 You have **${totalProducts} products** in your catalog. Would you like to search for a specific item?`;
  }

  // Handle customer count queries
  if (message.includes("how many customers") || message.includes("customer count") || message.includes("total customers")) {
    const totalCustomers = body.customers?.length || 0;
    const withBalance = body.customers?.filter(c => Number(c.outstandingBalance) > 0).length || 0;
    return `👥 You have **${totalCustomers} customers** registered. **${withBalance}** have pending balances.`;
  }

  // Default response with context
  const customer = body.customerName || "No customer selected";
  const balance = body.outstandingBalance || "0";
  
  if (body.customerName) {
    return `👤 **${customer}**: Current balance **Rs.${balance}**\n\nYou can:\n• Record a payment\n• Add a credit sale\n• Send a reminder`;
  }
  
  return `🤖 **GramMart AI Ready!**\n\nI can help you with:\n• Opening customer accounts\n• Adding credit sales\n• Recording payments\n• Checking balances\n• Business reports\n\nTry: "open Avinash account" or "who owes money"`;
}

function fallbackProductAnswer(body: ChatRequest) {
  const message = body.message?.toLowerCase().trim() ?? "";
  if (!/\b(price|rate|cost|mrp|stock|available|availability|how much)\b/.test(message)) return null;
  const products = body.products ?? [];
  const words = message.split(/\s+/).filter(word => word.length > 2 && !["price", "rate", "cost", "mrp", "stock", "available", "availability", "how", "much", "what", "tell", "show"].includes(word));
  const product = products.find(item => {
    const haystack = [item.name, item.sku].filter(Boolean).join(" ").toLowerCase();
    return words.some(word => haystack.includes(word));
  });
  if (!product) return "I can answer product price or stock, but I could not find that item in the catalog. Please say the item name again.";
  return `${product.name} price is **Rs.${product.sellingPrice}**. I have not added it to any customer account.`;
}

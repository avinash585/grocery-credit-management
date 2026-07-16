import type { Customer, Product } from "@/lib/api";
import type { Language } from "@/lib/i18n";

export type AssistantIntent =
  | "GET_PRODUCT_PRICE"
  | "GET_STOCK"
  | "ADD_PURCHASE"
  | "OPEN_CUSTOMER"
  | "SEARCH_CUSTOMER"
  | "RECEIVE_PAYMENT"
  | "SHOW_LEDGER"
  | "SHOW_HISTORY"
  | "GENERATE_REPORT"
  | "SHOW_SALES"
  | "SHOW_CREDIT"
  | "REMOVE_ITEM"
  | "UNDO_LAST_TRANSACTION"
  | "REVERSE_PAYMENT"
  | "SEND_REMINDER"
  | "GENERAL_QUESTION";

export type AssistantCommand = {
  intent: string;
  customerName?: string;
  productAlias?: string;
  amount?: string;
  quantity?: string;
  slots?: {
    confidence?: number;
    detectedLanguage?: string;
    normalizedText?: string;
    raw?: string;
    unit?: string;
    productConfidence?: number;
    customerConfidence?: number;
    alternatives?: string[];
  };
};

export type ProductResolution = {
  product: Product | null;
  confidence: number;
  alternatives: Product[];
  matchedTerm?: string;
};

export type CustomerResolution = {
  customer: Customer | null;
  confidence: number;
  alternatives: Customer[];
  matchedText?: string;
};

export type AssistantAnalysis = {
  intent: AssistantIntent;
  command: AssistantCommand | null;
  productResolution: ProductResolution;
  customerResolution: CustomerResolution;
  quantity?: string;
  unit?: string;
  amount?: string;
  confidence: number;
  normalizedText: string;
  isQuery: boolean;
  isAction: boolean;
  message?: string;
};

const productSynonyms: Record<string, string[]> = {
  milk: ["milk", "paal", "pal", "doodh", "aavin milk", "amul milk", "nandini milk", "pasum paal"],
  rice: ["rice", "arisi", "chawal", "sadam rice", "ponni", "basmati"],
  sugar: ["sugar", "sakkarai", "chini", "cheeni"],
  oil: ["oil", "ennai", "tel"],
  dal: ["dal", "paruppu", "daal"],
  maida: ["maida", "maida flour", "white flour"],
  noodles: ["noodles", "maggie", "maggi", "instant noodles"],
  butter: ["butter", "vennai", "makhan"],
  buttermilk: ["buttermilk", "mor", "chaas"],
  curd: ["curd", "yogurt", "dahi", "thayir"],
  ghee: ["ghee", "nei"],
  tea: ["tea powder", "tea", "chai"],
  coffee: ["coffee powder", "coffee"],
};

const queryWords = [
  "price", "rate", "cost", "mrp", "how much", "what is", "tell me", "show me",
  "stock", "available", "availability", "left", "balance", "owes", "who owes",
  "report", "sales", "credit", "history", "ledger"
];

const actionWords = [
  "add", "put", "give", "credit", "sale", "sold", "purchase", "bought", "bill",
  "record", "save", "write", "enter", "log", "receive", "received", "paid", "payment",
  "open", "switch", "load", "send reminder", "remind", "undo", "reverse", "cancel",
  "remove", "delete"
];

const productStopWords = new Set([
  "price", "rate", "cost", "mrp", "stock", "available", "availability", "how", "much",
  "what", "is", "the", "of", "tell", "show", "me", "add", "put", "give", "credit",
  "sale", "sold", "purchase", "bought", "bill", "record", "save", "write", "enter",
  "log", "to", "for", "in", "on", "account", "khata", "customer", "open", "receive",
  "received", "paid", "payment", "rupees", "rs", "kg", "kilo", "kilogram", "g", "gram",
  "litre", "liter", "litres", "liters", "l", "ml", "packet", "pack", "piece", "pc"
]);

export function normalizeAssistantCommandText(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?_\-|()[\]{}'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string) {
  return normalizeAssistantCommandText(text).split(/\s+/).filter(Boolean);
}

function splitAliases(aliases?: string) {
  if (!aliases) return [];
  return aliases
    .replace(/\[|\]|"/g, " ")
    .split(/[,|;]/)
    .map((alias) => alias.trim())
    .filter(Boolean);
}

function localizedProductNames(product: Product) {
  return [
    product.name,
    product.nameTa,
    product.nameHi,
    product.nameTe,
    product.nameKn,
    product.nameMl,
    product.sku,
    product.brand ? `${product.brand} ${product.name}` : undefined,
    product.brand,
    ...splitAliases(product.aliases)
  ].filter(Boolean) as string[];
}

function productTerms(product: Product) {
  const names = localizedProductNames(product);
  const nameTokens = new Set(tokens(product.name));
  const synonymTerms = Object.entries(productSynonyms)
    .filter(([canonical, aliases]) => nameTokens.has(canonical) || aliases.some((alias) => normalizeAssistantCommandText(alias) === normalizeAssistantCommandText(product.name)))
    .flatMap(([, aliases]) => aliases);

  return Array.from(new Set([...names, ...synonymTerms].map(normalizeAssistantCommandText).filter((term) => term.length > 1)));
}

function phraseMatches(normalizedText: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i").test(normalizedText);
}

export function resolveAssistantProduct(text: string, products: Product[]): ProductResolution {
  const normalized = normalizeAssistantCommandText(text);
  const queryTokens = tokens(text).filter((token) => !productStopWords.has(token) && !/^\d+(\.\d+)?$/.test(token));

  const scored = products
    .filter((product) => product.enabled !== false)
    .map((product) => {
      let score = 0;
      let matchedTerm: string | undefined;
      for (const term of productTerms(product)) {
        const termTokens = term.split(/\s+/).filter(Boolean);
        if (!termTokens.length) continue;

        const exactPhrase = phraseMatches(normalized, term);
        const allTokensPresent = termTokens.every((token) => queryTokens.includes(token));
        const meaningfulOverlap = termTokens.filter((token) => token.length > 2 && queryTokens.includes(token)).length;

        let next = 0;
        if (exactPhrase) {
          next = termTokens.length > 1 ? 0.99 : 0.95;
        } else if (allTokensPresent) {
          next = termTokens.length > 1 ? 0.94 : 0.9;
        } else if (meaningfulOverlap > 0 && termTokens.length > 1) {
          next = 0.65 + Math.min(meaningfulOverlap / termTokens.length, 1) * 0.2;
        }

        if (next > score) {
          score = next;
          matchedTerm = term;
        }
      }
      return { product, score, matchedTerm };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.length - b.product.name.length);

  const best = scored[0];
  if (!best) return { product: null, confidence: 0, alternatives: [] };

  const alternatives = scored
    .filter((item) => item.product.id !== best.product.id && best.score - item.score < 0.08)
    .map((item) => item.product)
    .slice(0, 4);

  return {
    product: best.score >= 0.9 && alternatives.length === 0 ? best.product : null,
    confidence: best.score,
    alternatives: [best.product, ...alternatives].slice(0, 5),
    matchedTerm: best.matchedTerm
  };
}

export function resolveAssistantCustomer(text: string, customers: Customer[], activeCustomer: Customer | null): CustomerResolution {
  const normalized = normalizeAssistantCommandText(text);
  const exact = customers.find((customer) => phraseMatches(normalized, normalizeAssistantCommandText(customer.name)) || Boolean(customer.phone && normalized.includes(customer.phone)));
  if (exact) return { customer: exact, confidence: 1, alternatives: [], matchedText: exact.name };

  const firstNameMatches = customers.filter((customer) => {
    const first = normalizeAssistantCommandText(customer.name).split(/\s+/)[0];
    return first.length > 2 && phraseMatches(normalized, first);
  });
  if (firstNameMatches.length === 1) return { customer: firstNameMatches[0], confidence: 0.93, alternatives: [], matchedText: firstNameMatches[0].name };
  if (firstNameMatches.length > 1) return { customer: null, confidence: 0.75, alternatives: firstNameMatches.slice(0, 5) };

  const extracted = extractCustomerPhrase(normalized);
  if (extracted) {
    const byPhrase = customers.filter((customer) => normalizeAssistantCommandText(customer.name).includes(extracted) || extracted.includes(normalizeAssistantCommandText(customer.name).split(/\s+/)[0]));
    if (byPhrase.length === 1) return { customer: byPhrase[0], confidence: 0.9, alternatives: [], matchedText: extracted };
    if (byPhrase.length > 1) return { customer: null, confidence: 0.72, alternatives: byPhrase.slice(0, 5), matchedText: extracted };
  }

  return { customer: activeCustomer, confidence: activeCustomer ? 0.62 : 0, alternatives: [] };
}

function extractCustomerPhrase(normalized: string) {
  const patterns = [
    /\b(?:to|for|into|in|on)\s+([a-z][a-z\s]{1,40}?)\s+(?:account|khata|book)\b/,
    /\b(?:open|show|switch|load)\s+([a-z][a-z\s]{1,40}?)\s+(?:account|khata|customer)?\b/,
    /\b([a-z][a-z\s]{1,40}?)\s+(?:account|khata)\b/
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1]
        .replace(/\b(add|credit|sale|purchase|payment|paid|receive|received|rupees?|rs|milk|rice|sugar|oil|dal|maida|noodles|liters?|litres?|liter|litre|kg|kilo|packet|of)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

export function isAssistantInfoQueryText(text: string) {
  const normalized = normalizeAssistantCommandText(text);
  return queryWords.some((word) => phraseMatches(normalized, word));
}

export function isAssistantActionText(text: string) {
  const normalized = normalizeAssistantCommandText(text);
  return actionWords.some((word) => phraseMatches(normalized, word));
}

export function extractAssistantQuantityAndUnit(text: string) {
  const normalized = normalizeAssistantCommandText(text);
  const numberWords: Record<string, string> = {
    one: "1", two: "2", three: "3", four: "4", five: "5",
    six: "6", seven: "7", eight: "8", nine: "9", ten: "10"
  };
  const unitPattern = "(kg|kilo|kilogram|g|gram|litre|liter|litres|liters|l|ml|packet|pack|piece|pc)";
  const numeric = normalized.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*${unitPattern}?\\b`));
  if (numeric) return { quantity: numeric[1], unit: numeric[2] };
  for (const [word, value] of Object.entries(numberWords)) {
    const match = normalized.match(new RegExp(`\\b${word}\\b\\s*${unitPattern}?\\b`));
    if (match) return { quantity: value, unit: match[1] };
  }
  return { quantity: undefined, unit: undefined };
}

export function extractAssistantAmount(text: string) {
  const normalized = normalizeAssistantCommandText(text);
  const money = normalized.match(/\b(?:rs|rupees|inr)\s*(\d+(?:\.\d+)?)\b/) ?? normalized.match(/\b(\d+(?:\.\d+)?)\s*(?:rs|rupees|inr)\b/);
  if (money) return money[1];
  if (phraseMatches(normalized, "payment") || phraseMatches(normalized, "paid") || phraseMatches(normalized, "received")) {
    return normalized.match(/\b(\d+(?:\.\d+)?)\b/)?.[1];
  }
  return undefined;
}

export function analyzeAssistantCommand(
  text: string,
  customers: Customer[],
  products: Product[],
  language: Language,
  activeCustomer: Customer | null
): AssistantAnalysis {
  const normalizedText = normalizeAssistantCommandText(text);
  const productResolution = resolveAssistantProduct(text, products);
  const customerResolution = resolveAssistantCustomer(text, customers, activeCustomer);
  const { quantity, unit } = extractAssistantQuantityAndUnit(text);
  const amount = extractAssistantAmount(text);
  const isQuery = isAssistantInfoQueryText(text);
  const isAction = isAssistantActionText(text);

  let intent: AssistantIntent = "GENERAL_QUESTION";
  if (/\b(undo|reverse|cancel|remove|delete)\b/.test(normalizedText)) {
    intent = normalizedText.includes("payment") ? "REVERSE_PAYMENT" : productResolution.product ? "REMOVE_ITEM" : "UNDO_LAST_TRANSACTION";
  } else if (/\b(receive|received|paid|payment|settled|cash)\b/.test(normalizedText)) {
    intent = "RECEIVE_PAYMENT";
  } else if (isQuery && /\b(stock|available|availability|left)\b/.test(normalizedText)) {
    intent = "GET_STOCK";
  } else if (isQuery && productResolution.confidence > 0) {
    intent = "GET_PRODUCT_PRICE";
  } else if (isAction && productResolution.product) {
    intent = "ADD_PURCHASE";
  } else if (/\b(open|show|switch|load|search)\b/.test(normalizedText) && /\b(account|customer|khata)\b/.test(normalizedText)) {
    intent = normalizedText.includes("search") ? "SEARCH_CUSTOMER" : "OPEN_CUSTOMER";
  } else if (/\b(report)\b/.test(normalizedText)) {
    intent = "GENERATE_REPORT";
  } else if (/\b(sales)\b/.test(normalizedText)) {
    intent = "SHOW_SALES";
  } else if (/\b(credit|outstanding|owes|pending)\b/.test(normalizedText)) {
    intent = "SHOW_CREDIT";
  }

  const productConfidence = productResolution.product ? productResolution.confidence : 0;
  const customerConfidence = customerResolution.customer ? customerResolution.confidence : 0;
  const confidence = Math.min(
    0.99,
    Math.max(
      intent === "GENERAL_QUESTION" ? 0.45 : 0.7,
      productConfidence || 0,
      customerConfidence || 0
    )
  );

  let command: AssistantCommand | null = null;
  if (intent === "ADD_PURCHASE") {
    command = {
      intent,
      customerName: customerResolution.customer?.name,
      productAlias: productResolution.product?.name,
      quantity: quantity ?? "1",
      slots: {
        confidence: Math.min(productResolution.confidence, customerResolution.customer ? customerResolution.confidence : 0.65),
        detectedLanguage: language,
        normalizedText,
        raw: text,
        unit,
        productConfidence: productResolution.confidence,
        customerConfidence: customerResolution.confidence,
        alternatives: productResolution.alternatives.map((item) => item.name)
      }
    };
  } else if (intent === "RECEIVE_PAYMENT") {
    command = {
      intent,
      customerName: customerResolution.customer?.name,
      amount,
      slots: { confidence: amount && customerResolution.customer ? 0.95 : 0.75, detectedLanguage: language, normalizedText, raw: text }
    };
  } else if (intent === "OPEN_CUSTOMER" || intent === "SEARCH_CUSTOMER") {
    command = {
      intent: "OPEN_CUSTOMER",
      customerName: customerResolution.customer?.name,
      slots: { confidence: customerResolution.customer ? customerResolution.confidence : 0.4, detectedLanguage: language, normalizedText, raw: text }
    };
  } else if (intent === "UNDO_LAST_TRANSACTION" || intent === "REVERSE_PAYMENT" || intent === "REMOVE_ITEM") {
    command = {
      intent: intent === "REMOVE_ITEM" ? "REMOVE_PRODUCT" : intent,
      customerName: customerResolution.customer?.name,
      productAlias: productResolution.product?.name,
      amount,
      slots: { confidence, detectedLanguage: language, normalizedText, raw: text }
    };
  }

  return {
    intent,
    command,
    productResolution,
    customerResolution,
    quantity,
    unit,
    amount,
    confidence,
    normalizedText,
    isQuery,
    isAction
  };
}

export function formatProductAnswer(analysis: AssistantAnalysis, language: Language) {
  const product = analysis.productResolution.product;
  if (!product) {
    const alternatives = analysis.productResolution.alternatives.map((item) => getLocalizedProductName(item, language));
    if (alternatives.length > 0) {
      return `I found similar products but confidence is ${Math.round(analysis.productResolution.confidence * 100)}%. Did you mean ${alternatives.join(" or ")}?`;
    }
    return "I could not identify the product confidently. Please say the exact item name, for example Milk, Rice, Sugar, or Maida.";
  }

  const name = getLocalizedProductName(product, language);
  const price = Number(product.sellingPrice ?? "0");
  const stock = product.stockQuantity
    ? ` Stock: ${Number(product.stockQuantity).toLocaleString()}${product.unit ? ` ${product.unit}` : ""}.`
    : "";
  const mrp = product.mrp
    ? ` MRP: Rs.${Number(product.mrp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
    : "";
  const unit = product.unit ? ` per ${product.unit}` : "";
  const quantity = Number(analysis.quantity ?? "0");
  const spokenUnit = analysis.unit ?? product.unit ?? "unit";

  if (quantity > 0 && analysis.intent === "GET_PRODUCT_PRICE") {
    const total = price * quantity;
    return `Intent: GET_PRODUCT_PRICE. Product: ${name}. Quantity: ${analysis.quantity}. Unit: ${spokenUnit}. ${analysis.quantity} ${spokenUnit} of ${name} costs Rs.${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Price: Rs.${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}.${stock}${mrp} Confidence: ${Math.round(analysis.productResolution.confidence * 100)}%.`;
  }

  if (analysis.intent === "GET_STOCK") {
    return `Intent: GET_STOCK. Product: ${name}.${stock || " Stock is not available in the catalog."} Price: Rs.${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}.${mrp} Confidence: ${Math.round(analysis.productResolution.confidence * 100)}%.`;
  }

  return `Intent: GET_PRODUCT_PRICE. Product: ${name}. Current Price: Rs.${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}.${stock}${mrp} Confidence: ${Math.round(analysis.productResolution.confidence * 100)}%.`;
}

function getLocalizedProductName(product: Product, language: Language) {
  if (language === "TAMIL" && product.nameTa) return product.nameTa;
  if (language === "HINDI" && product.nameHi) return product.nameHi;
  if (language === "TELUGU" && product.nameTe) return product.nameTe;
  if (language === "KANNADA" && product.nameKn) return product.nameKn;
  if (language === "MALAYALAM" && product.nameMl) return product.nameMl;
  return product.name;
}

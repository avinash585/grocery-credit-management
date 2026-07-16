/**
 * Universal Intent Router
 * 
 * CRITICAL GUARANTEE: This router NEVER returns null or unknown.
 * Every query is classified into one of 50+ intent categories.
 * If confidence is low, it returns GENERAL_QUESTION with clarification flag.
 */

import type { Language } from "@/lib/i18n";
import type {
  IntentCategory,
  IntentClassification,
  ConversationContext,
  EntityMap,
} from "./types";
import { IntentCategory as Intent } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT KEYWORDS DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

interface IntentKeywords {
  intent: IntentCategory;
  keywords: string[];
  priority: number; // Higher priority checked first
  requiresEntity?: "customer" | "product" | "amount";
}

const INTENT_KEYWORDS: IntentKeywords[] = [
  // ─── ACCOUNT OPERATIONS ──────────────────────────────────────────────────────
  {
    intent: Intent.ACCOUNT_OPEN,
    keywords: ["open", "show", "load", "pull up", "switch to", "go to", "account", "khata", "கணக்கு", "खाता", "ఖాతా", "ಖಾತೆ", "അക്കൗണ്ട്", "திற", "खोल", "తెరు", "ತೆರೆ", "തുറ"],
    priority: 8,
    requiresEntity: "customer",
  },
  {
    intent: Intent.ACCOUNT_CREATE,
    keywords: ["create", "new", "add customer", "register", "signup", "புதிய", "नया", "కొత്త", "ಹೊಸ", "പുതിയ"],
    priority: 9,
  },
  {
    intent: Intent.ACCOUNT_BALANCE,
    keywords: ["balance", "due", "owing", "owe", "owes", "outstanding", "bakaya", "pending", "நிலுவை", "எவ்வளவு", "பாக்கி", "बकाया", "कितना", "బాకీ", "ಬಾಕಿ", "ബാക്കി"],
    priority: 7,
  },
  
  // ─── BILLING OPERATIONS ──────────────────────────────────────────────────────
  {
    intent: Intent.BILLING_ADD_PURCHASE,
    keywords: ["add", "credit", "sale", "purchase", "give", "took", "bought", "வாங்கினார்", "சேர்", "கொடு", "கடன்", "போடு", "ஆட்", "उधार", "जोड़", "दें", "లిఖో", "అప్పు", "ಸೇರಿಸು", "ಕೊಡು", "ചേർ", "കടം"],
    priority: 10,
    requiresEntity: "product",
  },
  {
    intent: Intent.BILLING_RECEIVE_PAYMENT,
    keywords: ["paid", "payment", "received", "receive", "cash", "settled", "pay", "gave money", "கொடுத்தார்", "பணம்", "கட்டினார்", "दिया", "भुगतान", "పైసలు", "చెల్లించ", "ಕೊಟ್ಟರು", "ಪಾವತಿ", "തന്നു", "അടച്ചു"],
    priority: 10,
    requiresEntity: "amount",
  },
  {
    intent: Intent.BILLING_UNDO_TRANSACTION,
    keywords: ["undo", "cancel last", "remove last", "reverse last", "delete last", "undo last", "வேண்டாம்", "நீக்கு", "रद्द", "తొలగించు", "ರದ್ದು", "റദ്ദ്"],
    priority: 9,
  },
  
  // ─── PRODUCT OPERATIONS ──────────────────────────────────────────────────────
  {
    intent: Intent.PRODUCT_PRICE,
    keywords: ["price", "cost", "rate", "how much", "what is price", "விலை", "எவ்வளவு", "விலை என்ன", "कीमत", "दाम", "ధర", "ಬೆಲೆ", "വില"],
    priority: 8,
    requiresEntity: "product",
  },
  {
    intent: Intent.PRODUCT_STOCK,
    keywords: ["stock", "available", "availability", "in stock", "have", "இருப்பு", "கிடைக்குமா", "स्टॉक", "उपलब्ध", "స్టాక్", "ಲಭ್ಯ", "സ്റ്റോക്ക്"],
    priority: 7,
    requiresEntity: "product",
  },
  
  // ─── BUSINESS INTELLIGENCE ───────────────────────────────────────────────────
  {
    intent: Intent.BI_TODAY_SALES,
    keywords: ["today sales", "today's sales", "sales today", "இன்று விற்பனை", "आज की बिक्री", "నేటి అమ్మకాలు", "ಇಂದಿನ ಮಾರಾಟ", "ഇന്നത്തെ വില്പന"],
    priority: 6,
  },
  {
    intent: Intent.BI_HIGHEST_PENDING,
    keywords: ["who owes", "highest pending", "most pending", "owes most", "எவர் நிலுவை", "सबसे ज्यादा", "అత్యధిక బాకీ", "ಹೆಚ್ಚು ಬಾಕಿ", "ഏറ്റവും കൂടുതൽ"],
    priority: 6,
  },
  {
    intent: Intent.BI_LOW_STOCK,
    keywords: ["low stock", "running low", "out of stock", "stock alert", "குறைந்த இருப்பு", "कम स्टॉक", "తక్కువ స్టాక్", "ಕಡಿಮೆ ಸ್ಟಾಕ್", "കുറഞ്ഞ സ്റ്റോക്ക്"],
    priority: 6,
  },
  {
    intent: Intent.BI_RESTOCK_SUGGEST,
    keywords: ["restock", "what to order", "what should i buy", "எதை வாங்கலாம்", "क्या मंगाऊं", "ఏమి ఆర్డర్", "ಏನು ಖರೀದಿಸಬೇಕು", "എന്താണ് ഓർഡർ"],
    priority: 6,
  },
  
  // ─── REPORTS ─────────────────────────────────────────────────────────────────
  {
    intent: Intent.REPORT_DAILY,
    keywords: ["daily report", "today report", "today's report", "இன்று அறிக்கை", "आज की रिपोर्ट", "రోజువారీ నివేదిక", "ದೈನಂದಿನ ವರದಿ", "ദിവസേന റിപ്പോർട്ട്"],
    priority: 5,
  },
  {
    intent: Intent.REPORT_MONTHLY,
    keywords: ["monthly report", "month report", "this month", "மாத அறிக்கை", "महीने की रिपोर्ट", "నెలవారీ నివేదిక", "ಮಾಸಿಕ ವರದಿ", "മാസിക റിപ്പോർട്ട്"],
    priority: 5,
  },
  
  // ─── CHAT & GENERAL ──────────────────────────────────────────────────────────
  {
    intent: Intent.CHAT_GREETING,
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "வணக்கம்", "नमस्ते", "హలో", "ನಮಸ್ಕಾರ", "നമസ്കാരം"],
    priority: 3,
  },
  {
    intent: Intent.CHAT_HELP,
    keywords: ["help", "what can you do", "how to use", "உதவி", "मदद", "సహాయం", "ಸಹಾಯ", "സഹായം"],
    priority: 3,
  },
  {
    intent: Intent.CHAT_THANK,
    keywords: ["thank", "thanks", "thank you", "நன்றி", "धन्यवाद", "ధన్యవాదాలు", "ಧನ್ಯವಾದ", "നന്ദി"],
    priority: 2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL INTENT ROUTER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class UniversalIntentRouter {
  /**
   * Main classification method
   * GUARANTEE: Never returns null, always classifies into an intent
   */
  public classify(
    query: string,
    language: Language,
    context: ConversationContext
  ): IntentClassification {
    // Step 1: Normalize query
    const normalized = this.normalizeQuery(query, language);
    
    // Step 2: Detect multiple intents
    const intents = this.detectMultipleIntents(normalized, language);
    
    // Step 3: Calculate confidence
    const confidence = this.calculateConfidence(normalized, intents[0], language);
    
    // Step 4: Return classification
    // Even if confidence is low, we return best guess with clarification flag
    return {
      intent: intents[0],
      confidence,
      entities: {} as EntityMap, // Will be filled by entity extractor
      requiresClarification: confidence < 0.7,
      missingEntities: [],
      multiIntent: intents.length > 1,
      subIntents: intents.slice(1),
      originalQuery: query,
      normalizedQuery: normalized,
      language,
    };
  }
  
  /**
   * Normalize query text for matching
   */
  private normalizeQuery(query: string, language: Language): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[.,!?_\-|]/g, " ")
      .replace(/\s+/g, " ");
  }
  
  /**
   * Detect multiple intents in single query
   * Example: "Open Avinash and add Rice" → [ACCOUNT_OPEN, BILLING_ADD_PURCHASE]
   */
  private detectMultipleIntents(
    normalized: string,
    language: Language
  ): IntentCategory[] {
    const detectedIntents: Array<{ intent: IntentCategory; score: number; priority: number }> = [];
    
    // Check each intent keyword set
    for (const intentDef of INTENT_KEYWORDS) {
      let matchCount = 0;
      let totalKeywords = intentDef.keywords.length;
      
      for (const keyword of intentDef.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        const score = matchCount / Math.min(totalKeywords, 5); // Normalize by first 5 keywords
        detectedIntents.push({
          intent: intentDef.intent,
          score,
          priority: intentDef.priority,
        });
      }
    }
    
    // If no intents matched, check for special patterns
    if (detectedIntents.length === 0) {
      return [this.fallbackIntent(normalized, language)];
    }
    
    // Sort by priority then score
    detectedIntents.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return b.score - a.score;
    });
    
    // Return unique intents
    const uniqueIntents = Array.from(
      new Set(detectedIntents.map((d) => d.intent))
    );
    
    return uniqueIntents.length > 0 ? uniqueIntents : [Intent.GENERAL_QUESTION];
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    normalized: string,
    intent: IntentCategory,
    language: Language
  ): number {
    const intentDef = INTENT_KEYWORDS.find((def) => def.intent === intent);
    if (!intentDef) return 0.3;
    
    let matchedKeywords = 0;
    for (const keyword of intentDef.keywords.slice(0, 5)) {
      // Check first 5
      if (normalized.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    }
    
    // Base confidence from keyword match
    let confidence = matchedKeywords / Math.min(intentDef.keywords.length, 5);
    
    // Boost confidence for longer queries with more context
    if (normalized.split(" ").length > 5) {
      confidence = Math.min(1.0, confidence + 0.1);
    }
    
    // Reduce confidence if query is too short
    if (normalized.split(" ").length < 3) {
      confidence *= 0.8;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }
  
  /**
   * Fallback intent when no keywords match
   * Analyzes query type to make best guess
   */
  private fallbackIntent(normalized: string, language: Language): IntentCategory {
    // Check for greeting patterns
    if (this.isGreeting(normalized, language)) {
      return Intent.CHAT_GREETING;
    }
    
    // Check for help request
    if (this.isHelpRequest(normalized, language)) {
      return Intent.CHAT_HELP;
    }
    
    // Check for thank you
    if (this.isThankYou(normalized, language)) {
      return Intent.CHAT_THANK;
    }
    
    // Check if question about products (price/stock)
    if (this.isProductQuestion(normalized)) {
      return Intent.PRODUCT_PRICE;
    }
    
    // Check if question about business data
    if (this.isBusinessQuestion(normalized)) {
      return Intent.BI_TODAY_SALES;
    }
    
    // Default: General question
    return Intent.GENERAL_QUESTION;
  }
  
  /**
   * Helper: Check if query is a greeting
   */
  private isGreeting(normalized: string, language: Language): boolean {
    const greetings = [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "வணக்கம்",
      "नमस्ते",
      "నమస్కారం",
      "ನಮಸ್ಕಾರ",
      "നമസ്കാരം",
    ];
    return greetings.some((g) => normalized.includes(g));
  }
  
  /**
   * Helper: Check if query is a help request
   */
  private isHelpRequest(normalized: string, language: Language): boolean {
    const helpPatterns = [
      "help",
      "how to",
      "what can",
      "how do i",
      "show me",
      "explain",
      "உதவி",
      "எப்படி",
      "मदद",
      "कैसे",
      "సహాయం",
      "ಸಹಾಯ",
      "സഹായം",
    ];
    return helpPatterns.some((p) => normalized.includes(p));
  }
  
  /**
   * Helper: Check if query is thank you
   */
  private isThankYou(normalized: string, language: Language): boolean {
    const thankPatterns = ["thank", "thanks", "நன்றி", "धन्यवाद", "ధన్యవాదాలు", "ಧನ್ಯವಾದ", "നന്ദി"];
    return thankPatterns.some((p) => normalized.includes(p));
  }
  
  /**
   * Helper: Check if asking about product info
   */
  private isProductQuestion(normalized: string): boolean {
    const productPatterns = [
      /\b(price|cost|rate|how much|விலை|कीमत|ధర|ಬೆಲೆ|വില)\b/,
      /\b(stock|available|கிடைக்கும|उपलब्ध|అందుబాటు|ಲಭ್ಯ|ലഭ്യം)\b/,
    ];
    return productPatterns.some((p) => p.test(normalized));
  }
  
  /**
   * Helper: Check if asking about business data
   */
  private isBusinessQuestion(normalized: string): boolean {
    const businessPatterns = [
      /\b(sales|revenue|profit|என்ன விற்பனை|बिक्री|అమ్మకాలు|ಮಾರಾಟ|വിൽപ്പന)\b/,
      /\b(today|yesterday|this month|இன்று|நேற்று|आज|कल|ఈరోజు|ನಿನ್ನೆ|ഇന്ന്)\b/,
      /\b(who owes|pending|balance|எவர் நிலுவை|बकाया|బాకీ|ಬಾಕಿ|ബാക്കി)\b/,
    ];
    return businessPatterns.some((p) => p.test(normalized));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const intentRouter = new UniversalIntentRouter();

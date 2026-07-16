/**
 * Universal Intent Router - Test Suite
 * 
 * Tests the core guarantee: NEVER returns null, always classifies
 */

import { describe, it, expect } from "@jest/globals";
import { UniversalIntentRouter } from "./intent-router";
import { IntentCategory as Intent } from "./types";
import type { ConversationContext } from "./types";

// Mock context for testing
const mockContext: ConversationContext = {
  sessionId: "test-session",
  activeCustomer: null,
  activeBill: null,
  activeProducts: [],
  language: "ENGLISH",
  conversationHistory: [],
  lastIntent: null,
  pendingActions: [],
  startedAt: new Date(),
  lastActivityAt: new Date(),
};

describe("UniversalIntentRouter", () => {
  const router = new UniversalIntentRouter();

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE GUARANTEE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Core Guarantee: Never Returns Null", () => {
    it("should classify empty string", () => {
      const result = router.classify("", "ENGLISH", mockContext);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it("should classify gibberish", () => {
      const result = router.classify("asdfghjkl qwerty", "ENGLISH", mockContext);
      expect(result).toBeDefined();
      expect(result.intent).toBe(Intent.GENERAL_QUESTION);
    });

    it("should classify single character", () => {
      const result = router.classify("a", "ENGLISH", mockContext);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it("should classify numbers only", () => {
      const result = router.classify("12345", "ENGLISH", mockContext);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it("should classify special characters only", () => {
      const result = router.classify("!@#$%^&*()", "ENGLISH", mockContext);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNT OPERATIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Account Operations", () => {
    it("should detect ACCOUNT_OPEN - English", () => {
      const queries = [
        "open avinash account",
        "show kumar account",
        "load lakshmi account",
        "switch to rajesh account",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it("should detect ACCOUNT_OPEN - Tamil", () => {
      const result = router.classify("அவினாஷ் கணக்கு திற", "TAMIL", mockContext);
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });

    it("should detect ACCOUNT_BALANCE", () => {
      const queries = [
        "what is kumar balance",
        "how much does lakshmi owe",
        "avinash outstanding",
        "check balance",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.ACCOUNT_BALANCE);
      });
    });

    it("should detect ACCOUNT_CREATE", () => {
      const queries = [
        "create new customer",
        "add new account",
        "register customer",
        "new customer signup",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.ACCOUNT_CREATE);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BILLING OPERATIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Billing Operations", () => {
    it("should detect BILLING_ADD_PURCHASE - English", () => {
      const queries = [
        "add rice to kumar",
        "credit sugar to lakshmi",
        "give milk to avinash",
        "kumar bought dal",
        "purchase oil",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BILLING_ADD_PURCHASE);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it("should detect BILLING_ADD_PURCHASE - Tamil", () => {
      const queries = [
        "குமார் கணக்கில் அரிசி சேர்",
        "லட்சுமி கணக்கில் பால் கொடு",
        "அவினாஷ் அக்கவுண்டில் ஒரு கிலோ சர்க்கரை",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "TAMIL", mockContext);
        expect(result.intent).toBe(Intent.BILLING_ADD_PURCHASE);
      });
    });

    it("should detect BILLING_RECEIVE_PAYMENT - English", () => {
      const queries = [
        "kumar paid 500",
        "received 1000 from lakshmi",
        "avinash gave money",
        "payment from rajesh",
        "settled 2000",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BILLING_RECEIVE_PAYMENT);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it("should detect BILLING_RECEIVE_PAYMENT - Tamil", () => {
      const result = router.classify("குமார் 500 ரூபாய் கொடுத்தார்", "TAMIL", mockContext);
      expect(result.intent).toBe(Intent.BILLING_RECEIVE_PAYMENT);
    });

    it("should detect BILLING_UNDO_TRANSACTION", () => {
      const queries = [
        "undo last transaction",
        "cancel last entry",
        "remove last purchase",
        "reverse last transaction",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BILLING_UNDO_TRANSACTION);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT OPERATIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Product Operations", () => {
    it("should detect PRODUCT_PRICE", () => {
      const queries = [
        "what is rice price",
        "price of milk",
        "how much is sugar",
        "cost of oil",
        "dal rate",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.PRODUCT_PRICE);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it("should detect PRODUCT_STOCK", () => {
      const queries = [
        "is rice available",
        "milk stock",
        "do you have sugar",
        "oil availability",
        "rice in stock",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.PRODUCT_STOCK);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS INTELLIGENCE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Business Intelligence", () => {
    it("should detect BI_TODAY_SALES", () => {
      const queries = [
        "today's sales",
        "sales today",
        "today sales report",
        "what are today's sales",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BI_TODAY_SALES);
      });
    });

    it("should detect BI_HIGHEST_PENDING", () => {
      const queries = [
        "who owes me the most",
        "highest pending balance",
        "who owes most money",
        "customer with most debt",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BI_HIGHEST_PENDING);
      });
    });

    it("should detect BI_LOW_STOCK", () => {
      const queries = [
        "low stock items",
        "running low on stock",
        "out of stock products",
        "stock alert",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BI_LOW_STOCK);
      });
    });

    it("should detect BI_RESTOCK_SUGGEST", () => {
      const queries = [
        "what should i restock",
        "what to order",
        "restock suggestions",
        "what should i buy",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.BI_RESTOCK_SUGGEST);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-INTENT DETECTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Multi-Intent Detection", () => {
    it("should detect multiple intents - open + add", () => {
      const result = router.classify(
        "open avinash account and add rice",
        "ENGLISH",
        mockContext
      );

      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
      expect(result.multiIntent).toBe(true);
      expect(result.subIntents).toContain(Intent.BILLING_ADD_PURCHASE);
    });

    it("should detect multiple intents - add + add", () => {
      const result = router.classify(
        "add rice and milk to kumar",
        "ENGLISH",
        mockContext
      );

      expect(result.intent).toBe(Intent.BILLING_ADD_PURCHASE);
      expect(result.multiIntent).toBe(true);
    });

    it("should detect multiple intents - add + receive", () => {
      const result = router.classify(
        "add sugar to lakshmi and receive 500",
        "ENGLISH",
        mockContext
      );

      expect(result.multiIntent).toBe(true);
      expect([result.intent, ...(result.subIntents || [])]).toContain(
        Intent.BILLING_ADD_PURCHASE
      );
      expect([result.intent, ...(result.subIntents || [])]).toContain(
        Intent.BILLING_RECEIVE_PAYMENT
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT & GENERAL TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Chat & General", () => {
    it("should detect CHAT_GREETING", () => {
      const queries = ["hello", "hi", "good morning", "hey there"];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.CHAT_GREETING);
      });
    });

    it("should detect CHAT_HELP", () => {
      const queries = [
        "help",
        "what can you do",
        "how to use",
        "show me features",
      ];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.CHAT_HELP);
      });
    });

    it("should detect CHAT_THANK", () => {
      const queries = ["thank you", "thanks", "thanks a lot"];

      queries.forEach((query) => {
        const result = router.classify(query, "ENGLISH", mockContext);
        expect(result.intent).toBe(Intent.CHAT_THANK);
      });
    });

    it("should fallback to GENERAL_QUESTION for unclear queries", () => {
      const result = router.classify("something random here", "ENGLISH", mockContext);
      expect(result.intent).toBe(Intent.GENERAL_QUESTION);
      expect(result.requiresClarification).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIDENCE SCORING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Confidence Scoring", () => {
    it("should have high confidence for clear commands", () => {
      const result = router.classify(
        "open avinash account",
        "ENGLISH",
        mockContext
      );
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("should have lower confidence for ambiguous queries", () => {
      const result = router.classify("kumar", "ENGLISH", mockContext);
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.requiresClarification).toBe(true);
    });

    it("should boost confidence for longer contextual queries", () => {
      const result = router.classify(
        "please open avinash account so i can add some items",
        "ENGLISH",
        mockContext
      );
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTILINGUAL SUPPORT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Multilingual Support", () => {
    it("should detect intent in Tamil", () => {
      const result = router.classify(
        "குமார் கணக்கு திற",
        "TAMIL",
        mockContext
      );
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });

    it("should detect intent in Hindi", () => {
      const result = router.classify(
        "कुमार खाता खोलें",
        "HINDI",
        mockContext
      );
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });

    it("should handle Tanglish (Tamil + English)", () => {
      const result = router.classify(
        "kumar account திற",
        "TANGLISH",
        mockContext
      );
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE CASES & ROBUSTNESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Edge Cases", () => {
    it("should handle typos gracefully", () => {
      const result = router.classify("opan avinash accont", "ENGLISH", mockContext);
      // Should still classify (maybe with lower confidence)
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it("should handle mixed case", () => {
      const result = router.classify("OPEN AVINASH ACCOUNT", "ENGLISH", mockContext);
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });

    it("should handle extra whitespace", () => {
      const result = router.classify(
        "  open    avinash    account  ",
        "ENGLISH",
        mockContext
      );
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });

    it("should handle punctuation", () => {
      const result = router.classify(
        "open avinash's account!",
        "ENGLISH",
        mockContext
      );
      expect(result.intent).toBe(Intent.ACCOUNT_OPEN);
    });
  });
});

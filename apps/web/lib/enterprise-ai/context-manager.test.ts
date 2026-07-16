/**
 * Context Manager Tests
 * 
 * Tests for AI memory system including:
 * - Session management
 * - Active customer/bill/product tracking
 * - Conversation history
 * - Pending actions
 * - Context inference
 * - Session expiry
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ContextManager } from "./context-manager";
import type { Customer, Product } from "@/lib/api";
import type { IntentCategory } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ═══════════════════════════════════════════════════════════════════════════════

const mockCustomer1: Customer = {
  id: "cust1",
  name: "Avinash Kumar",
  phone: "9876543210",
  address: "Chennai",
  balance: 1500,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockCustomer2: Customer = {
  id: "cust2",
  name: "Lakshmi Devi",
  phone: "9876543211",
  address: "Bangalore",
  balance: 2500,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockProduct1: Product = {
  id: "prod1",
  name: "Rice",
  price: 50,
  stock: 100,
  unit: "kg",
  category: "Grains",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockProduct2: Product = {
  id: "prod2",
  name: "Sugar",
  price: 45,
  stock: 80,
  unit: "kg",
  category: "Groceries",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Session Management", () => {
  let manager: ContextManager;
  
  beforeEach(() => {
    manager = new ContextManager();
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should create new session", () => {
    const context = manager.createSession("user123", "ENGLISH");
    
    expect(context.sessionId).toContain("session_user123");
    expect(context.activeCustomer).toBeNull();
    expect(context.activeBill).toBeNull();
    expect(context.activeProducts).toEqual([]);
    expect(context.language).toBe("ENGLISH");
    expect(context.conversationHistory).toEqual([]);
    expect(context.lastIntent).toBeNull();
    expect(context.pendingActions).toEqual([]);
    expect(context.startedAt).toBeInstanceOf(Date);
    expect(context.lastActivityAt).toBeInstanceOf(Date);
  });
  
  it("should get or create session", () => {
    const context1 = manager.getOrCreateSession("user123");
    const context2 = manager.getOrCreateSession("user123");
    
    // Should return same session
    expect(context1.sessionId).toBe(context2.sessionId);
  });
  
  it("should create session with custom language", () => {
    const context = manager.createSession("user123", "TAMIL");
    
    expect(context.language).toBe("TAMIL");
  });
  
  it("should clear session", () => {
    const context = manager.createSession("user123");
    const sessionId = context.sessionId;
    
    manager.clearSession(sessionId);
    
    // Getting context should return new one
    const newContext = manager.getOrCreateSession("user123");
    expect(newContext.sessionId).not.toBe(sessionId);
  });
  
  it("should track active sessions count", () => {
    expect(manager.getActiveSessionsCount()).toBe(0);
    
    manager.createSession("user1");
    expect(manager.getActiveSessionsCount()).toBe(1);
    
    manager.createSession("user2");
    expect(manager.getActiveSessionsCount()).toBe(2);
    
    const context = manager.createSession("user3");
    expect(manager.getActiveSessionsCount()).toBe(3);
    
    manager.clearSession(context.sessionId);
    expect(manager.getActiveSessionsCount()).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER CONTEXT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Customer Context", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should set and get active customer", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer).toEqual(mockCustomer1);
  });
  
  it("should return null when no active customer", () => {
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer).toBeNull();
  });
  
  it("should clear active customer", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    manager.clearActiveCustomer(sessionId);
    
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer).toBeNull();
  });
  
  it("should update active customer", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    manager.setActiveCustomer(sessionId, mockCustomer2);
    
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer).toEqual(mockCustomer2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BILL CONTEXT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Bill Context", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  const mockBill = {
    id: "bill123",
    customerId: "cust1",
    items: [],
    total: 500,
  };
  
  it("should set and get active bill", () => {
    manager.setActiveBill(sessionId, mockBill);
    
    const bill = manager.getActiveBill(sessionId);
    expect(bill).toEqual(mockBill);
  });
  
  it("should return null when no active bill", () => {
    const bill = manager.getActiveBill(sessionId);
    expect(bill).toBeNull();
  });
  
  it("should clear active bill", () => {
    manager.setActiveBill(sessionId, mockBill);
    manager.clearActiveBill(sessionId);
    
    const bill = manager.getActiveBill(sessionId);
    expect(bill).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CONTEXT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Product Context", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should add active product", () => {
    manager.addActiveProduct(sessionId, mockProduct1);
    
    const products = manager.getActiveProducts(sessionId);
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual(mockProduct1);
  });
  
  it("should add multiple products", () => {
    manager.addActiveProduct(sessionId, mockProduct1);
    manager.addActiveProduct(sessionId, mockProduct2);
    
    const products = manager.getActiveProducts(sessionId);
    expect(products).toHaveLength(2);
  });
  
  it("should not add duplicate products", () => {
    manager.addActiveProduct(sessionId, mockProduct1);
    manager.addActiveProduct(sessionId, mockProduct1);
    
    const products = manager.getActiveProducts(sessionId);
    expect(products).toHaveLength(1);
  });
  
  it("should return empty array when no products", () => {
    const products = manager.getActiveProducts(sessionId);
    expect(products).toEqual([]);
  });
  
  it("should clear active products", () => {
    manager.addActiveProduct(sessionId, mockProduct1);
    manager.addActiveProduct(sessionId, mockProduct2);
    manager.clearActiveProducts(sessionId);
    
    const products = manager.getActiveProducts(sessionId);
    expect(products).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE PREFERENCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Language Preference", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should set and get language", () => {
    manager.setLanguage(sessionId, "TAMIL");
    
    const language = manager.getLanguage(sessionId);
    expect(language).toBe("TAMIL");
  });
  
  it("should return ENGLISH as default language", () => {
    const language = manager.getLanguage(sessionId);
    expect(language).toBe("ENGLISH");
  });
  
  it("should update language", () => {
    manager.setLanguage(sessionId, "TAMIL");
    manager.setLanguage(sessionId, "HINDI");
    
    const language = manager.getLanguage(sessionId);
    expect(language).toBe("HINDI");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT TRACKING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Intent Tracking", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should set and get last intent", () => {
    manager.setLastIntent(sessionId, "ACCOUNT_OPEN" as IntentCategory);
    
    const intent = manager.getLastIntent(sessionId);
    expect(intent).toBe("ACCOUNT_OPEN");
  });
  
  it("should return null when no last intent", () => {
    const intent = manager.getLastIntent(sessionId);
    expect(intent).toBeNull();
  });
  
  it("should update last intent", () => {
    manager.setLastIntent(sessionId, "ACCOUNT_OPEN" as IntentCategory);
    manager.setLastIntent(sessionId, "BILLING_ADD_PURCHASE" as IntentCategory);
    
    const intent = manager.getLastIntent(sessionId);
    expect(intent).toBe("BILLING_ADD_PURCHASE");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION HISTORY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Conversation History", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should add user message", () => {
    manager.addMessage(sessionId, "user", "Open Avinash account");
    
    const history = manager.getHistory(sessionId);
    expect(history).toHaveLength(1);
    expect(history[0].role).toBe("user");
    expect(history[0].content).toBe("Open Avinash account");
  });
  
  it("should add assistant message", () => {
    manager.addMessage(sessionId, "assistant", "Avinash's account opened. Balance: ₹1,500");
    
    const history = manager.getHistory(sessionId);
    expect(history).toHaveLength(1);
    expect(history[0].role).toBe("assistant");
  });
  
  it("should add message with intent", () => {
    manager.addMessage(sessionId, "user", "Add 2kg Rice", "BILLING_ADD_PURCHASE" as IntentCategory);
    
    const history = manager.getHistory(sessionId);
    expect(history[0].intent).toBe("BILLING_ADD_PURCHASE");
  });
  
  it("should maintain conversation order", () => {
    manager.addMessage(sessionId, "user", "Hello");
    manager.addMessage(sessionId, "assistant", "Hi! How can I help?");
    manager.addMessage(sessionId, "user", "Open Avinash");
    
    const history = manager.getHistory(sessionId);
    expect(history).toHaveLength(3);
    expect(history[0].content).toBe("Hello");
    expect(history[1].content).toBe("Hi! How can I help?");
    expect(history[2].content).toBe("Open Avinash");
  });
  
  it("should limit history to 10 messages", () => {
    for (let i = 0; i < 15; i++) {
      manager.addMessage(sessionId, "user", `Message ${i}`);
    }
    
    const history = manager.getHistory(sessionId);
    expect(history).toHaveLength(10);
    expect(history[0].content).toBe("Message 5"); // Oldest kept
    expect(history[9].content).toBe("Message 14"); // Newest
  });
  
  it("should get limited history", () => {
    for (let i = 0; i < 8; i++) {
      manager.addMessage(sessionId, "user", `Message ${i}`);
    }
    
    const history = manager.getHistory(sessionId, 3);
    expect(history).toHaveLength(3);
    expect(history[0].content).toBe("Message 5");
    expect(history[2].content).toBe("Message 7");
  });
  
  it("should get last user message", () => {
    manager.addMessage(sessionId, "user", "First message");
    manager.addMessage(sessionId, "assistant", "Response");
    manager.addMessage(sessionId, "user", "Second message");
    
    const lastUser = manager.getLastUserMessage(sessionId);
    expect(lastUser?.content).toBe("Second message");
  });
  
  it("should get last assistant message", () => {
    manager.addMessage(sessionId, "assistant", "First response");
    manager.addMessage(sessionId, "user", "Question");
    manager.addMessage(sessionId, "assistant", "Second response");
    
    const lastAssistant = manager.getLastAssistantMessage(sessionId);
    expect(lastAssistant?.content).toBe("Second response");
  });
  
  it("should clear history", () => {
    manager.addMessage(sessionId, "user", "Message 1");
    manager.addMessage(sessionId, "user", "Message 2");
    manager.clearHistory(sessionId);
    
    const history = manager.getHistory(sessionId);
    expect(history).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PENDING ACTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Pending Actions", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should add pending action", () => {
    const actionId = manager.addPendingAction(
      sessionId,
      "ACCOUNT_OPEN" as IntentCategory,
      {} as any,
      "Multiple customers found",
      5
    );
    
    expect(actionId).toContain("action_");
    
    const actions = manager.getPendingActions(sessionId);
    expect(actions).toHaveLength(1);
    expect(actions[0].intent).toBe("ACCOUNT_OPEN");
    expect(actions[0].reason).toBe("Multiple customers found");
  });
  
  it("should get pending action by ID", () => {
    const actionId = manager.addPendingAction(
      sessionId,
      "ACCOUNT_OPEN" as IntentCategory,
      {} as any,
      "Confirmation needed"
    );
    
    const action = manager.getPendingAction(sessionId, actionId);
    expect(action).not.toBeNull();
    expect(action?.id).toBe(actionId);
  });
  
  it("should return null for non-existent action", () => {
    const action = manager.getPendingAction(sessionId, "invalid_id");
    expect(action).toBeNull();
  });
  
  it("should handle multiple pending actions", () => {
    manager.addPendingAction(sessionId, "ACCOUNT_OPEN" as IntentCategory, {} as any, "Reason 1");
    manager.addPendingAction(sessionId, "PRODUCT_SEARCH" as IntentCategory, {} as any, "Reason 2");
    
    const actions = manager.getPendingActions(sessionId);
    expect(actions).toHaveLength(2);
  });
  
  it("should remove pending action", () => {
    const actionId = manager.addPendingAction(
      sessionId,
      "ACCOUNT_OPEN" as IntentCategory,
      {} as any,
      "Test"
    );
    
    manager.removePendingAction(sessionId, actionId);
    
    const action = manager.getPendingAction(sessionId, actionId);
    expect(action).toBeNull();
  });
  
  it("should clear all pending actions", () => {
    manager.addPendingAction(sessionId, "ACCOUNT_OPEN" as IntentCategory, {} as any, "Action 1");
    manager.addPendingAction(sessionId, "PRODUCT_SEARCH" as IntentCategory, {} as any, "Action 2");
    
    manager.clearPendingActions(sessionId);
    
    const actions = manager.getPendingActions(sessionId);
    expect(actions).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT INFERENCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Context Inference", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should detect when customer context is needed", () => {
    const needsCustomer = manager.needsCustomerContext(
      sessionId,
      "ACCOUNT_BALANCE" as IntentCategory
    );
    
    expect(needsCustomer).toBe(true);
  });
  
  it("should detect when customer context is not needed", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    
    const needsCustomer = manager.needsCustomerContext(
      sessionId,
      "ACCOUNT_BALANCE" as IntentCategory
    );
    
    expect(needsCustomer).toBe(false);
  });
  
  it("should infer customer from active context", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    
    const customer = manager.canInferCustomerFromHistory(sessionId);
    expect(customer).toEqual(mockCustomer1);
  });
  
  it("should return null when cannot infer customer", () => {
    const customer = manager.canInferCustomerFromHistory(sessionId);
    expect(customer).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT SUMMARY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Context Summary", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should get context summary", () => {
    manager.setActiveCustomer(sessionId, mockCustomer1);
    manager.addActiveProduct(sessionId, mockProduct1);
    manager.addMessage(sessionId, "user", "Test message");
    manager.addPendingAction(sessionId, "ACCOUNT_OPEN" as IntentCategory, {} as any, "Test");
    
    const summary = manager.getContextSummary(sessionId);
    
    expect(summary.activeCustomer).toBe("Avinash Kumar");
    expect(summary.activeProducts).toBe(1);
    expect(summary.historySize).toBe(1);
    expect(summary.pendingActions).toBe(1);
    expect(summary.language).toBe("ENGLISH");
    expect(summary.sessionAge).toBeGreaterThanOrEqual(0);
  });
  
  it("should handle empty context", () => {
    const summary = manager.getContextSummary(sessionId);
    
    expect(summary.activeCustomer).toBeNull();
    expect(summary.activeBill).toBeNull();
    expect(summary.activeProducts).toBe(0);
    expect(summary.historySize).toBe(0);
    expect(summary.pendingActions).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("ContextManager - Complete Workflows", () => {
  let manager: ContextManager;
  let sessionId: string;
  
  beforeEach(() => {
    manager = new ContextManager();
    const context = manager.createSession("user123", "TAMIL");
    sessionId = context.sessionId;
  });
  
  afterEach(() => {
    manager.stopCleanupTask();
  });
  
  it("should handle complete billing workflow", () => {
    // User: "Open Avinash"
    manager.addMessage(sessionId, "user", "Open Avinash", "ACCOUNT_OPEN" as IntentCategory);
    manager.setActiveCustomer(sessionId, mockCustomer1);
    manager.setLastIntent(sessionId, "ACCOUNT_OPEN" as IntentCategory);
    manager.addMessage(sessionId, "assistant", "Avinash's account opened");
    
    // User: "Add 2kg Rice"
    manager.addMessage(sessionId, "user", "Add 2kg Rice", "BILLING_ADD_PURCHASE" as IntentCategory);
    manager.addActiveProduct(sessionId, mockProduct1);
    manager.setLastIntent(sessionId, "BILLING_ADD_PURCHASE" as IntentCategory);
    manager.addMessage(sessionId, "assistant", "Added 2kg Rice for ₹100");
    
    // User: "What's the balance?"
    manager.addMessage(sessionId, "user", "What's the balance?", "ACCOUNT_BALANCE" as IntentCategory);
    
    // Verify context
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer?.name).toBe("Avinash Kumar");
    
    const products = manager.getActiveProducts(sessionId);
    expect(products).toHaveLength(1);
    
    const history = manager.getHistory(sessionId);
    expect(history).toHaveLength(5);
    
    const language = manager.getLanguage(sessionId);
    expect(language).toBe("TAMIL");
  });
  
  it("should handle clarification workflow", () => {
    // User: "Open Kumar"
    manager.addMessage(sessionId, "user", "Open Kumar", "ACCOUNT_OPEN" as IntentCategory);
    
    // System: Multiple customers found
    const actionId = manager.addPendingAction(
      sessionId,
      "ACCOUNT_OPEN" as IntentCategory,
      {} as any,
      "Multiple customers named Kumar found"
    );
    manager.addMessage(
      sessionId,
      "assistant",
      "Found 2 customers named Kumar. Which one?"
    );
    
    // User: "The one from Chennai"
    manager.addMessage(sessionId, "user", "The one from Chennai");
    manager.setActiveCustomer(sessionId, mockCustomer1);
    manager.removePendingAction(sessionId, actionId);
    manager.addMessage(sessionId, "assistant", "Avinash Kumar's account opened");
    
    // Verify
    const customer = manager.getActiveCustomer(sessionId);
    expect(customer?.name).toBe("Avinash Kumar");
    
    const pendingActions = manager.getPendingActions(sessionId);
    expect(pendingActions).toHaveLength(0);
  });
});

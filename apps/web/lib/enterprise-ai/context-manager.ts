/**
 * Context Manager - AI Memory System
 * 
 * Maintains conversation state across multiple queries:
 * - Active customer context
 * - Active bill/transaction
 * - Conversation history (last 10 messages)
 * - Language preference
 * - Pending actions (awaiting confirmation)
 * - Session management (30-minute timeout)
 * 
 * This enables the AI to:
 * - Remember who you're talking about: "Open Avinash" → "Add 2kg Rice" (remembers Avinash)
 * - Avoid redundant questions: Once customer is set, don't ask again
 * - Maintain multi-turn conversations
 * - Handle clarification flows
 */

import type { Customer, Product } from "@/lib/api";
import type { Language } from "@/lib/i18n";
import type {
  ConversationContext,
  Message,
  PendingAction,
  IntentCategory,
  EntityMap,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_HISTORY_SIZE = 10;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start cleanup task for expired sessions
    this.startCleanupTask();
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Create new conversation session
   */
  public createSession(userId: string, language: Language = "ENGLISH"): ConversationContext {
    const sessionId = this.generateSessionId(userId);
    
    const context: ConversationContext = {
      sessionId,
      activeCustomer: null,
      activeBill: null,
      activeProducts: [],
      language,
      conversationHistory: [],
      lastIntent: null,
      pendingActions: [],
      startedAt: new Date(),
      lastActivityAt: new Date(),
    };
    
    this.contexts.set(sessionId, context);
    return context;
  }
  
  /**
   * Get existing session or create new one
   */
  public getOrCreateSession(userId: string, language?: Language): ConversationContext {
    const sessionId = this.generateSessionId(userId);
    
    let context = this.contexts.get(sessionId);
    
    // Create new session if not exists or expired
    if (!context || this.isSessionExpired(context)) {
      context = this.createSession(userId, language);
    } else {
      // Update last activity
      context.lastActivityAt = new Date();
    }
    
    return context;
  }
  
  /**
   * Check if session has expired
   */
  private isSessionExpired(context: ConversationContext): boolean {
    const now = Date.now();
    const lastActivity = context.lastActivityAt.getTime();
    return (now - lastActivity) > this.SESSION_TIMEOUT_MS;
  }
  
  /**
   * Clear session (logout or manual reset)
   */
  public clearSession(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
  
  /**
   * Generate session ID from user ID
   */
  private generateSessionId(userId: string): string {
    return `session_${userId}_${Date.now()}`;
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // CONTEXT UPDATES
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Set active customer (from "Open Avinash" command)
   */
  public setActiveCustomer(sessionId: string, customer: Customer): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.activeCustomer = customer;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get active customer
   */
  public getActiveCustomer(sessionId: string): Customer | null {
    const context = this.contexts.get(sessionId);
    return context?.activeCustomer || null;
  }
  
  /**
   * Clear active customer
   */
  public clearActiveCustomer(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.activeCustomer = null;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Set active bill (during transaction)
   */
  public setActiveBill(sessionId: string, bill: any): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.activeBill = bill;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get active bill
   */
  public getActiveBill(sessionId: string): any | null {
    const context = this.contexts.get(sessionId);
    return context?.activeBill || null;
  }
  
  /**
   * Clear active bill
   */
  public clearActiveBill(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.activeBill = null;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Add product to active products list
   */
  public addActiveProduct(sessionId: string, product: Product): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    // Avoid duplicates
    const exists = context.activeProducts.some(p => p.id === product.id);
    if (!exists) {
      context.activeProducts.push(product);
    }
    
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get active products
   */
  public getActiveProducts(sessionId: string): Product[] {
    const context = this.contexts.get(sessionId);
    return context?.activeProducts || [];
  }
  
  /**
   * Clear active products
   */
  public clearActiveProducts(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.activeProducts = [];
    context.lastActivityAt = new Date();
  }
  
  /**
   * Set user's preferred language
   */
  public setLanguage(sessionId: string, language: Language): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.language = language;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get user's preferred language
   */
  public getLanguage(sessionId: string): Language {
    const context = this.contexts.get(sessionId);
    return context?.language || "ENGLISH";
  }
  
  /**
   * Update last executed intent
   */
  public setLastIntent(sessionId: string, intent: IntentCategory): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.lastIntent = intent;
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get last executed intent
   */
  public getLastIntent(sessionId: string): IntentCategory | null {
    const context = this.contexts.get(sessionId);
    return context?.lastIntent || null;
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // CONVERSATION HISTORY
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Add message to conversation history
   */
  public addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    intent?: IntentCategory
  ): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    const message: Message = {
      role,
      content,
      timestamp: new Date(),
      intent,
    };
    
    context.conversationHistory.push(message);
    
    // Keep only last 10 messages
    if (context.conversationHistory.length > this.MAX_HISTORY_SIZE) {
      context.conversationHistory = context.conversationHistory.slice(-this.MAX_HISTORY_SIZE);
    }
    
    context.lastActivityAt = new Date();
  }
  
  /**
   * Get conversation history
   */
  public getHistory(sessionId: string, limit?: number): Message[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];
    
    if (limit) {
      return context.conversationHistory.slice(-limit);
    }
    
    return context.conversationHistory;
  }
  
  /**
   * Get last user message
   */
  public getLastUserMessage(sessionId: string): Message | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;
    
    const userMessages = context.conversationHistory.filter(m => m.role === "user");
    return userMessages[userMessages.length - 1] || null;
  }
  
  /**
   * Get last assistant message
   */
  public getLastAssistantMessage(sessionId: string): Message | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;
    
    const assistantMessages = context.conversationHistory.filter(m => m.role === "assistant");
    return assistantMessages[assistantMessages.length - 1] || null;
  }
  
  /**
   * Clear conversation history
   */
  public clearHistory(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.conversationHistory = [];
    context.lastActivityAt = new Date();
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // PENDING ACTIONS (Multi-turn Confirmation)
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Add pending action (awaiting user confirmation)
   * Example: "Found 2 customers named Kumar. Which one?"
   */
  public addPendingAction(
    sessionId: string,
    intent: IntentCategory,
    entities: EntityMap,
    reason: string,
    expiresInMinutes: number = 5
  ): string {
    const context = this.contexts.get(sessionId);
    if (!context) return "";
    
    const actionId = this.generateActionId();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    const action: PendingAction = {
      id: actionId,
      intent,
      entities,
      reason,
      expiresAt,
    };
    
    context.pendingActions.push(action);
    context.lastActivityAt = new Date();
    
    return actionId;
  }
  
  /**
   * Get pending action by ID
   */
  public getPendingAction(sessionId: string, actionId: string): PendingAction | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;
    
    const action = context.pendingActions.find(a => a.id === actionId);
    
    // Check if expired
    if (action && new Date() > action.expiresAt) {
      this.removePendingAction(sessionId, actionId);
      return null;
    }
    
    return action || null;
  }
  
  /**
   * Get all pending actions
   */
  public getPendingActions(sessionId: string): PendingAction[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];
    
    // Filter out expired actions
    const now = new Date();
    context.pendingActions = context.pendingActions.filter(a => a.expiresAt > now);
    
    return context.pendingActions;
  }
  
  /**
   * Remove pending action (after confirmation or expiry)
   */
  public removePendingAction(sessionId: string, actionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.pendingActions = context.pendingActions.filter(a => a.id !== actionId);
    context.lastActivityAt = new Date();
  }
  
  /**
   * Clear all pending actions
   */
  public clearPendingActions(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.pendingActions = [];
    context.lastActivityAt = new Date();
  }
  
  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // CONTEXT QUERIES (Smart context inference)
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Check if customer is needed but not set
   * Returns true if last intent requires customer but none is active
   */
  public needsCustomerContext(sessionId: string, intent: IntentCategory): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;
    
    const customerRequiredIntents = [
      "ACCOUNT_BALANCE",
      "ACCOUNT_HISTORY",
      "ACCOUNT_STATEMENT",
      "BILLING_ADD_PURCHASE",
      "BILLING_RECEIVE_PAYMENT",
      "BILLING_GENERATE_RECEIPT",
    ];
    
    return customerRequiredIntents.includes(intent) && !context.activeCustomer;
  }
  
  /**
   * Check if we can infer customer from recent conversation
   * Example: User said "Open Kumar" then "What's the balance?"
   */
  public canInferCustomerFromHistory(sessionId: string): Customer | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;
    
    // Check if we recently set a customer
    if (context.activeCustomer) {
      return context.activeCustomer;
    }
    
    // Look for recent ACCOUNT_OPEN intent
    const recentMessages = context.conversationHistory.slice(-5);
    const accountOpenMessage = recentMessages.find(m => m.intent === "ACCOUNT_OPEN");
    
    if (accountOpenMessage) {
      // Customer should still be active from that action
      return context.activeCustomer;
    }
    
    return null;
  }
  
  /**
   * Get context summary for logging/debugging
   */
  public getContextSummary(sessionId: string): {
    sessionId: string;
    activeCustomer: string | null;
    activeBill: string | null;
    activeProducts: number;
    language: Language;
    historySize: number;
    pendingActions: number;
    sessionAge: number; // minutes
  } {
    const context = this.contexts.get(sessionId);
    
    if (!context) {
      return {
        sessionId,
        activeCustomer: null,
        activeBill: null,
        activeProducts: 0,
        language: "ENGLISH",
        historySize: 0,
        pendingActions: 0,
        sessionAge: 0,
      };
    }
    
    const sessionAge = Math.floor((Date.now() - context.startedAt.getTime()) / (60 * 1000));
    
    return {
      sessionId: context.sessionId,
      activeCustomer: context.activeCustomer?.name || null,
      activeBill: context.activeBill ? "active" : null,
      activeProducts: context.activeProducts.length,
      language: context.language,
      historySize: context.conversationHistory.length,
      pendingActions: context.pendingActions.length,
      sessionAge,
    };
  }
  
  // ═════════════════════════════════════════════════════════════════════════════
  // CLEANUP TASKS
  // ═════════════════════════════════════════════════════════════════════════════
  
  /**
   * Start background cleanup task for expired sessions
   */
  private startCleanupTask(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Remove expired sessions from memory
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];
    
    for (const [sessionId, context] of this.contexts.entries()) {
      const lastActivity = context.lastActivityAt.getTime();
      if ((now - lastActivity) > this.SESSION_TIMEOUT_MS) {
        expiredSessions.push(sessionId);
      }
    }
    
    for (const sessionId of expiredSessions) {
      this.contexts.delete(sessionId);
    }
    
    if (expiredSessions.length > 0) {
      console.log(`[ContextManager] Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }
  
  /**
   * Stop cleanup task (for testing or shutdown)
   */
  public stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Get all active sessions count (for monitoring)
   */
  public getActiveSessionsCount(): number {
    return this.contexts.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const contextManager = new ContextManager();

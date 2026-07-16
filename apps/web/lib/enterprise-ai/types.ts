/**
 * Enterprise AI Agent - Core Type Definitions
 * 
 * This file contains all shared types and enums used across the Enterprise AI system.
 */

import type { Customer, Product } from "@/lib/api";
import type { Language } from "@/lib/i18n";

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT CATEGORIES (50+ Business Operations)
// ═══════════════════════════════════════════════════════════════════════════════

export enum IntentCategory {
  // ─── ACCOUNT OPERATIONS (10 intents) ────────────────────────────────────────
  ACCOUNT_OPEN = "ACCOUNT_OPEN",
  ACCOUNT_CREATE = "ACCOUNT_CREATE",
  ACCOUNT_SEARCH = "ACCOUNT_SEARCH",
  ACCOUNT_UPDATE = "ACCOUNT_UPDATE",
  ACCOUNT_DELETE = "ACCOUNT_DELETE",
  ACCOUNT_BALANCE = "ACCOUNT_BALANCE",
  ACCOUNT_HISTORY = "ACCOUNT_HISTORY",
  ACCOUNT_STATEMENT = "ACCOUNT_STATEMENT",
  ACCOUNT_FAMILY = "ACCOUNT_FAMILY",
  ACCOUNT_MERGE = "ACCOUNT_MERGE",
  
  // ─── PRODUCT OPERATIONS (12 intents) ────────────────────────────────────────
  PRODUCT_SEARCH = "PRODUCT_SEARCH",
  PRODUCT_PRICE = "PRODUCT_PRICE",
  PRODUCT_STOCK = "PRODUCT_STOCK",
  PRODUCT_ADD = "PRODUCT_ADD",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE",
  PRODUCT_HISTORY = "PRODUCT_HISTORY",
  PRODUCT_RESTOCK = "PRODUCT_RESTOCK",
  PRODUCT_LIST = "PRODUCT_LIST",
  PRODUCT_CATEGORY = "PRODUCT_CATEGORY",
  PRODUCT_BARCODE = "PRODUCT_BARCODE",
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  
  // ─── BILLING OPERATIONS (8 intents) ─────────────────────────────────────────
  BILLING_ADD_PURCHASE = "BILLING_ADD_PURCHASE",
  BILLING_RECEIVE_PAYMENT = "BILLING_RECEIVE_PAYMENT",
  BILLING_REVERSE_PAYMENT = "BILLING_REVERSE_PAYMENT",
  BILLING_GENERATE_RECEIPT = "BILLING_GENERATE_RECEIPT",
  BILLING_GENERATE_STATEMENT = "BILLING_GENERATE_STATEMENT",
  BILLING_UNDO_TRANSACTION = "BILLING_UNDO_TRANSACTION",
  BILLING_TRANSFER = "BILLING_TRANSFER",
  BILLING_SPLIT = "BILLING_SPLIT",
  
  // ─── BUSINESS INTELLIGENCE (15 intents) ─────────────────────────────────────
  BI_TODAY_SALES = "BI_TODAY_SALES",
  BI_TODAY_CREDIT = "BI_TODAY_CREDIT",
  BI_TODAY_PAYMENTS = "BI_TODAY_PAYMENTS",
  BI_TODAY_PROFIT = "BI_TODAY_PROFIT",
  BI_MONTHLY_SALES = "BI_MONTHLY_SALES",
  BI_MONTHLY_PROFIT = "BI_MONTHLY_PROFIT",
  BI_TOP_CUSTOMERS = "BI_TOP_CUSTOMERS",
  BI_TOP_PRODUCTS = "BI_TOP_PRODUCTS",
  BI_HIGHEST_PENDING = "BI_HIGHEST_PENDING",
  BI_LOW_STOCK = "BI_LOW_STOCK",
  BI_RESTOCK_SUGGEST = "BI_RESTOCK_SUGGEST",
  BI_CUSTOMER_ANALYTICS = "BI_CUSTOMER_ANALYTICS",
  BI_INVENTORY_ANALYTICS = "BI_INVENTORY_ANALYTICS",
  BI_REVENUE_TREND = "BI_REVENUE_TREND",
  BI_CREDIT_RISK = "BI_CREDIT_RISK",
  
  // ─── REPORTS (5 intents) ────────────────────────────────────────────────────
  REPORT_DAILY = "REPORT_DAILY",
  REPORT_MONTHLY = "REPORT_MONTHLY",
  REPORT_CUSTOMER = "REPORT_CUSTOMER",
  REPORT_INVENTORY = "REPORT_INVENTORY",
  REPORT_CUSTOM = "REPORT_CUSTOM",
  
  // ─── CHAT & GENERAL (5 intents) ─────────────────────────────────────────────
  CHAT_GREETING = "CHAT_GREETING",
  CHAT_HELP = "CHAT_HELP",
  CHAT_THANK = "CHAT_THANK",
  CHAT_FEEDBACK = "CHAT_FEEDBACK",
  GENERAL_QUESTION = "GENERAL_QUESTION",
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CustomerEntity {
  customer: Customer;
  confidence: number; // 0.0 to 1.0
  matchType: "EXACT" | "FUZZY" | "PHONE" | "PARTIAL";
  rawText: string;
}

export interface ProductEntity {
  product: Product;
  quantity: number;
  unit: "kg" | "g" | "L" | "ml" | "piece" | "packet" | "box" | "bundle";
  confidence: number; // 0.0 to 1.0
  matchType: "EXACT" | "FUZZY" | "REGIONAL" | "ALIAS" | "BRAND";
  rawText: string;
}

export interface AmountEntity {
  value: number;
  currency: "INR";
  rawText: string;
}

export interface QuantityEntity {
  value: number;
  unit: "kg" | "g" | "L" | "ml" | "piece" | "packet" | "box" | "bundle" | "dozen";
  rawText: string;
}

export interface DateEntity {
  date: Date;
  type: "ABSOLUTE" | "RELATIVE";
  rawText: string;
}

export interface TimeRangeEntity {
  start: Date;
  end: Date;
  type: "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";
  rawText: string;
}

export interface EntityMap {
  customers: CustomerEntity[];
  products: ProductEntity[];
  amounts: AmountEntity[];
  quantities: QuantityEntity[];
  dates: DateEntity[];
  timeRanges: TimeRangeEntity[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT CLASSIFICATION RESULT
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntentClassification {
  /** Primary intent detected */
  intent: IntentCategory;
  
  /** Confidence score (0.0 to 1.0) */
  confidence: number;
  
  /** Extracted entities */
  entities: EntityMap;
  
  /** Whether clarification is needed from user */
  requiresClarification: boolean;
  
  /** List of missing required entities */
  missingEntities: string[];
  
  /** Whether multiple intents detected in single query */
  multiIntent: boolean;
  
  /** Additional intents if multi-intent query */
  subIntents?: IntentCategory[];
  
  /** Original query text */
  originalQuery: string;
  
  /** Normalized query text */
  normalizedQuery: string;
  
  /** Language detected */
  language: Language;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION CONTEXT (AI MEMORY)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConversationContext {
  /** Unique session identifier */
  sessionId: string;
  
  /** Currently active customer */
  activeCustomer: Customer | null;
  
  /** Currently active bill */
  activeBill: any | null; // TODO: Define Bill type
  
  /** Products mentioned in current session */
  activeProducts: Product[];
  
  /** User's preferred language */
  language: Language;
  
  /** Conversation history (last 10 messages) */
  conversationHistory: Message[];
  
  /** Last executed intent */
  lastIntent: IntentCategory | null;
  
  /** Pending actions waiting for confirmation */
  pendingActions: PendingAction[];
  
  /** Session start timestamp */
  startedAt: Date;
  
  /** Last activity timestamp */
  lastActivityAt: Date;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: IntentCategory;
}

export interface PendingAction {
  id: string;
  intent: IntentCategory;
  entities: EntityMap;
  reason: string;
  expiresAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkflowStep {
  /** Step name for logging */
  name: string;
  
  /** Action to execute */
  action: () => Promise<StepResult>;
  
  /** Validation before execution */
  validate: () => Promise<boolean>;
  
  /** Rollback function if step fails */
  rollback: () => Promise<void>;
  
  /** Whether step is required for workflow success */
  required: boolean;
  
  /** Whether step can be retried on failure */
  retryable: boolean;
  
  /** Maximum retry attempts */
  maxRetries: number;
}

export interface StepResult {
  success: boolean;
  step: string;
  data?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface WorkflowResult {
  success: boolean;
  intent: IntentCategory;
  results: StepResult[];
  summary?: string;
  error?: string;
  completedSteps?: StepResult[];
  failedStep?: string;
  retryable?: boolean;
  total?: number;
  newBalance?: number;
  remainingStock?: number;
  billId?: string;
  transactionId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ResponseStatus = "SUCCESS" | "ERROR" | "CLARIFICATION_NEEDED" | "PARTIAL_SUCCESS";

export interface EnterpriseResponse {
  /** Response status */
  status: ResponseStatus;
  
  /** Primary intent executed */
  intent: IntentCategory;
  
  /** Extracted entities */
  entities?: {
    customer?: string;
    product?: string;
    quantity?: number;
    unit?: string;
    amount?: number;
  };
  
  /** Workflow execution steps */
  actions?: Array<{
    step: string;
    status: "✅" | "❌" | "⏳";
    duration?: number;
  }>;
  
  /** Execution result data */
  executionResult?: {
    total?: number;
    balance?: number;
    stock?: number;
    billId?: string;
    transactionId?: string;
  };
  
  /** User-facing message */
  message: string;
  
  /** Error details if failed */
  error?: string;
  
  /** Failed step name */
  failedStep?: string;
  
  /** Successfully completed steps */
  completedSteps?: StepResult[];
  
  /** Suggestions for user */
  suggestions?: string[] | Array<{ label: string; value: string }>;
  
  /** Whether action can be retried */
  retryable?: boolean;
  
  /** Verification result */
  verification?: VerificationResult;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VerificationCheck {
  name: string;
  passed: boolean;
  critical: boolean;
  message?: string;
}

export interface VerificationResult {
  passed: boolean;
  criticalFailure: boolean;
  checks: VerificationCheck[];
  warnings: VerificationCheck[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ErrorType =
  | "AMBIGUOUS_CUSTOMER"
  | "AMBIGUOUS_PRODUCT"
  | "CUSTOMER_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "OUT_OF_STOCK"
  | "INSUFFICIENT_BALANCE"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface WorkflowError extends Error {
  type: ErrorType;
  step?: string;
  query?: string;
  candidates?: any[];
  product?: string;
  operation?: () => Promise<any>;
}

export interface RecoveryResponse {
  type: "DISAMBIGUATION" | "SUGGESTION" | "ALTERNATIVE" | "RETRY" | "GUIDANCE";
  message: string;
  options?: Array<{ label: string; value: string }>;
  retryAction?: () => Promise<any>;
}

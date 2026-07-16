/**
 * Enterprise AI Agent - Main Entry Point
 * 
 * This is the primary interface for the Enterprise AI system.
 * All modules are exported through this file.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Type definitions
export type {
  IntentClassification,
  EntityMap,
  CustomerEntity,
  ProductEntity,
  AmountEntity,
  QuantityEntity,
  DateEntity,
  TimeRangeEntity,
  ConversationContext,
  Message,
  PendingAction,
  WorkflowStep,
  StepResult,
  WorkflowResult,
  EnterpriseResponse,
  ResponseStatus,
  VerificationCheck,
  VerificationResult,
  WorkflowError,
  RecoveryResponse,
  ErrorType,
} from "./types";

export { IntentCategory } from "./types";

// Universal Intent Router
export { UniversalIntentRouter, intentRouter } from "./intent-router";

// Entity Extraction Engine
export { EntityExtractor, entityExtractor } from "./entity-extractor";

// Product Keywords Database
export { PRODUCT_KEYWORDS, getAllKeywords, searchProductByKeyword } from "./product-keywords";

// Context Manager (AI Memory)
export { ContextManager, contextManager } from "./context-manager";

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION INFO
// ═══════════════════════════════════════════════════════════════════════════════

export const ENTERPRISE_AI_VERSION = "1.2.0"; // Module 3 complete
export const BUILD_DATE = new Date("2024-12-05");

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

export const FEATURES = {
  MULTI_INTENT: true,              // ✅ Module 1
  CONTEXT_MEMORY: true,             // ✅ Module 3
  ENTITY_EXTRACTION: true,          // ✅ Module 2
  WORKFLOW_ORCHESTRATION: false,    // ⏳ Module 4
  BUSINESS_QUERIES: false,          // ⏳ Module 5
  SELF_VERIFICATION: false,         // ⏳ Module 6
  ERROR_RECOVERY: false,            // ⏳ Module 7
  RESPONSE_GENERATION: false,       // ⏳ Module 8
  MULTILINGUAL: true,               // ✅ All modules
} as const;

# Enterprise AI Agent - Complete System Design

## Executive Summary

This document outlines the complete redesign of GramMart AI Assistant into an **Enterprise-Grade AI Agent** that:
- ✅ **NEVER remains silent** - Every query gets a response
- ✅ **Handles ALL business operations** - 50+ intent types
- ✅ **Executes complete workflows** - Multi-step operations
- ✅ **Answers using live MySQL data** - No hardcoded responses
- ✅ **Multilingual support** - 8+ languages
- ✅ **Context awareness** - Remembers conversation state
- ✅ **Self-verification** - Validates every action
- ✅ **Intelligent error recovery** - Asks clarifying questions

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                               │
│  Voice Command / Chat Message / Button Click / API Call     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 PREPROCESSING LAYER                          │
│  • Speech-to-Text (if voice)                                │
│  • Language Detection (auto)                                 │
│  • Text Normalization                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              UNIVERSAL INTENT ROUTER                         │
│  Classifies EVERY query into one of 50+ intents            │
│  NEVER returns "unknown" - always provides fallback         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               ENTITY EXTRACTION ENGINE                       │
│  • Customer names (fuzzy matching)                          │
│  • Product names (multilingual)                             │
│  • Quantities + Units (kg, L, piece, etc.)                  │
│  • Amounts (₹, Rs, rupees)                                  │
│  • Dates/Time ranges                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            CONTEXT MANAGER (AI Memory)                       │
│  • Active customer                                          │
│  • Active bill                                              │
│  • Conversation history                                     │
│  • Language preference                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           WORKFLOW ORCHESTRATION ENGINE                      │
│  • Multi-action planner                                     │
│  • Sequential execution                                     │
│  • Transaction management                                   │
│  • Rollback on failure                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             EXECUTION LAYER (Parallel)                       │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   MySQL      │  Business    │  WhatsApp    │   UI State   │
│   Queries    │  Logic       │  Notifier    │   Manager    │
└──────────────┴──────────────┴──────────────┴───────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              SELF-VERIFICATION LAYER                         │
│  Validates all actions before confirming                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             RESPONSE GENERATOR                               │
│  • Multilingual templates                                   │
│  • Structured response format                               │
│  • Error messages with suggestions                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT                                    │
│  Text Response + Action Results + UI Updates                │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Principle: NEVER BE SILENT

**Every request follows this decision tree:**

```
Query Received
    ↓
Can I understand the intent?
    ├─ YES → Extract entities
    │        ↓
    │        Are all required entities present?
    │        ├─ YES → Execute workflow
    │        │        ↓
    │        │        Did execution succeed?
    │        │        ├─ YES → Return success response
    │        │        └─ NO → Return error + suggestion
    │        └─ NO → Ask clarifying question
    │
    └─ NO → Analyze query type
             ↓
             Is it a greeting/chat?
             ├─ YES → Return friendly response
             └─ NO → "I didn't understand. Here's what I can help with..."
```

**GUARANTEE:** Every code path leads to a response. No silent failures.

---

## Module 1: Universal Intent Router

### File: `apps/web/lib/enterprise-ai/intent-router.ts`

### 50+ Intent Categories


```typescript
export enum IntentCategory {
  // ACCOUNT OPERATIONS (10 intents)
  ACCOUNT_OPEN = "ACCOUNT_OPEN",
  ACCOUNT_CREATE = "ACCOUNT_CREATE",
  ACCOUNT_SEARCH = "ACCOUNT_SEARCH",
  ACCOUNT_UPDATE = "ACCOUNT_UPDATE",
  ACCOUNT_DELETE = "ACCOUNT_DELETE",
  ACCOUNT_BALANCE = "ACCOUNT_BALANCE",
  ACCOUNT_HISTORY = "ACCOUNT_HISTORY",
  ACCOUNT_STATEMENT = "ACCOUNT_STATEMENT",
  FAMILY_ACCOUNT = "FAMILY_ACCOUNT",
  ACCOUNT_MERGE = "ACCOUNT_MERGE",
  
  // PRODUCT OPERATIONS (12 intents)
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
  
  // BILLING (8 intents)
  BILLING_ADD_PURCHASE = "BILLING_ADD_PURCHASE",
  BILLING_RECEIVE_PAYMENT = "BILLING_RECEIVE_PAYMENT",
  BILLING_REVERSE_PAYMENT = "BILLING_REVERSE_PAYMENT",
  BILLING_GENERATE_RECEIPT = "BILLING_GENERATE_RECEIPT",
  BILLING_GENERATE_STATEMENT = "BILLING_GENERATE_STATEMENT",
  BILLING_UNDO_TRANSACTION = "BILLING_UNDO_TRANSACTION",
  BILLING_TRANSFER = "BILLING_TRANSFER",
  BILLING_SPLIT = "BILLING_SPLIT",
  
  // BUSINESS INTELLIGENCE (15 intents)
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
  
  // REPORTS (5 intents)
  REPORT_DAILY = "REPORT_DAILY",
  REPORT_MONTHLY = "REPORT_MONTHLY",
  REPORT_CUSTOMER = "REPORT_CUSTOMER",
  REPORT_INVENTORY = "REPORT_INVENTORY",
  REPORT_CUSTOM = "REPORT_CUSTOM",
  
  // CHAT & GENERAL (5 intents)
  CHAT_GREETING = "CHAT_GREETING",
  CHAT_HELP = "CHAT_HELP",
  CHAT_THANK = "CHAT_THANK",
  CHAT_FEEDBACK = "CHAT_FEEDBACK",
  GENERAL_QUESTION = "GENERAL_QUESTION",
}

export interface IntentClassification {
  intent: IntentCategory;
  confidence: number; // 0.0 to 1.0
  entities: EntityMap;
  requiresClarification: boolean;
  missingEntities: string[];
  multiIntent: boolean;
  subIntents?: IntentCategory[];
}

export class UniversalIntentRouter {
  /**
   * CRITICAL: This function NEVER returns null
   * Every query gets classified, even if confidence is low
   */
  public classify(query: string, language: Language, context: ConversationContext): IntentClassification {
    // Step 1: Normalize input
    const normalized = this.normalizeQuery(query, language);
    
    // Step 2: Detect multiple intents
    const intents = this.detectMultipleIntents(normalized, language);
    
    // Step 3: Extract entities
    const entities = this.extractEntities(normalized, language, context);
    
    // Step 4: Calculate confidence
    const confidence = this.calculateConfidence(intents, entities);
    
    // Step 5: Determine if clarification needed
    const requiresClarification = this.needsClarification(intents, entities, confidence);
    
    // Step 6: Identify missing entities
    const missingEntities = this.getMissingEntities(intents[0], entities);
    
    return {
      intent: intents[0],
      confidence,
      entities,
      requiresClarification,
      missingEntities,
      multiIntent: intents.length > 1,
      subIntents: intents.slice(1)
    };
  }
  
  /**
   * Fallback: If confidence < 0.5, analyze query type
   */
  private fallbackClassification(query: string, language: Language): IntentClassification {
    // Check if greeting
    if (this.isGreeting(query, language)) {
      return { intent: IntentCategory.CHAT_GREETING, confidence: 0.9, ... };
    }
    
    // Check if help request
    if (this.isHelpRequest(query, language)) {
      return { intent: IntentCategory.CHAT_HELP, confidence: 0.9, ... };
    }
    
    // Default: General question
    return {
      intent: IntentCategory.GENERAL_QUESTION,
      confidence: 0.3,
      requiresClarification: true,
      missingEntities: ["intent"],
      ...
    };
  }
}
```

### Intent Detection Rules

**Multi-Intent Detection:**
```typescript
// Example: "Open Avinash and add Rice and Milk"
detectMultipleIntents(query) {
  const intents: IntentCategory[] = [];
  
  // Check for "open"/"account"
  if (hasKeywords(query, ["open", "account", "khata"])) {
    intents.push(IntentCategory.ACCOUNT_OPEN);
  }
  
  // Check for "add"/"credit"
  if (hasKeywords(query, ["add", "credit", "purchase"])) {
    intents.push(IntentCategory.BILLING_ADD_PURCHASE);
  }
  
  // Check for products mentioned
  const products = extractProducts(query);
  if (products.length > 1) {
    // Multiple products = multiple ADD_PURCHASE intents
    products.forEach(() => intents.push(IntentCategory.BILLING_ADD_PURCHASE));
  }
  
  return intents;
}
```

---

## Module 2: Entity Extraction Engine

### File: `apps/web/lib/enterprise-ai/entity-extractor.ts`

```typescript
export interface EntityMap {
  customers: Customer[];
  products: ProductEntity[];
  amounts: AmountEntity[];
  quantities: QuantityEntity[];
  dates: DateEntity[];
  timeRanges: TimeRangeEntity[];
}

export interface ProductEntity {
  product: Product;
  quantity: number;
  unit: string;
  confidence: number;
  matchType: "EXACT" | "FUZZY" | "REGIONAL" | "ALIAS";
}

export interface QuantityEntity {
  value: number;
  unit: "kg" | "g" | "L" | "ml" | "piece" | "packet" | "box" | "bundle";
  rawText: string;
}

export class EntityExtractor {
  /**
   * Extract customer names with fuzzy matching
   */
  public extractCustomers(
    query: string,
    allCustomers: Customer[],
    language: Language
  ): Customer[] {
    const matches: Array<{ customer: Customer; score: number }> = [];
    
    // Method 1: Exact name match
    for (const customer of allCustomers) {
      if (query.toLowerCase().includes(customer.name.toLowerCase())) {
        matches.push({ customer, score: 1.0 });
      }
    }
    
    // Method 2: First name match
    for (const customer of allCustomers) {
      const firstName = customer.name.split(/\s+/)[0];
      if (query.toLowerCase().includes(firstName.toLowerCase()) && firstName.length > 2) {
        matches.push({ customer, score: 0.9 });
      }
    }
    
    // Method 3: Fuzzy match (Levenshtein distance)
    for (const customer of allCustomers) {
      const distance = levenshteinDistance(query.toLowerCase(), customer.name.toLowerCase());
      if (distance <= 2) { // Allow 2 character differences
        matches.push({ customer, score: 0.8 - (distance * 0.1) });
      }
    }
    
    // Method 4: Phone number match
    const phoneMatch = query.match(/\d{10}/);
    if (phoneMatch) {
      const customer = allCustomers.find(c => c.phone === phoneMatch[0]);
      if (customer) matches.push({ customer, score: 1.0 });
    }
    
    // Sort by score and remove duplicates
    return this.deduplicateCustomers(matches);
  }
  
  /**
   * Extract product names with multilingual support
   */
  public extractProducts(
    query: string,
    allProducts: Product[],
    language: Language
  ): ProductEntity[] {
    const matches: ProductEntity[] = [];
    
    // Use enhanced product matcher from previous analysis
    // Port 60+ product keywords from FloatingMic
    
    return matches;
  }
  
  /**
   * Extract quantities with unit conversion
   */
  public extractQuantities(query: string, language: Language): QuantityEntity[] {
    const quantities: QuantityEntity[] = [];
    
    // Pattern: "2 kg", "500 grams", "3 litre", "5 packets"
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram)/gi,
      /(\d+(?:\.\d+)?)\s*(g|gram|grams)/gi,
      /(\d+(?:\.\d+)?)\s*(l|litre|liter|litres|liters)/gi,
      /(\d+(?:\.\d+)?)\s*(ml|millilitre|milliliter)/gi,
      /(\d+(?:\.\d+)?)\s*(piece|pieces|pc|pcs)/gi,
      /(\d+(?:\.\d+)?)\s*(packet|packets|pack)/gi,
      /(\d+(?:\.\d+)?)\s*(box|boxes)/gi,
    ];
    
    for (const pattern of patterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        quantities.push({
          value: parseFloat(match[1]),
          unit: this.normalizeUnit(match[2]),
          rawText: match[0]
        });
      }
    }
    
    // Handle number words: "one", "two", "ஒரு", "दो"
    quantities.push(...this.extractNumberWords(query, language));
    
    return quantities;
  }
}
```

---

## Module 3: Workflow Orchestration Engine

### File: `apps/web/lib/enterprise-ai/workflow-engine.ts`

```typescript
export interface WorkflowStep {
  name: string;
  action: () => Promise<StepResult>;
  validate: () => Promise<boolean>;
  rollback: () => Promise<void>;
  required: boolean;
  retryable: boolean;
  maxRetries: number;
}

export interface WorkflowPlan {
  intent: IntentCategory;
  steps: WorkflowStep[];
  estimatedDuration: number;
  requiresConfirmation: boolean;
}

export class WorkflowOrchestrationEngine {
  /**
   * Main execution method
   * Executes ALL steps sequentially
   * Never stops midway
   */
  public async execute(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<WorkflowResult> {
    // Step 1: Build workflow plan
    const plan = this.buildWorkflowPlan(classification);
    
    // Step 2: Validate prerequisites
    const validation = await this.validatePrerequisites(plan, context);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        suggestion: validation.suggestion
      };
    }
    
    // Step 3: Execute steps with transaction management
    const results: StepResult[] = [];
    
    try {
      await this.beginTransaction();
      
      for (const step of plan.steps) {
        const result = await this.executeStepWithRetry(step);
        results.push(result);
        
        if (!result.success && step.required) {
          throw new WorkflowError(`Required step failed: ${step.name}`, step, results);
        }
      }
      
      await this.commitTransaction();
      
      return {
        success: true,
        results,
        summary: this.generateSummary(results)
      };
      
    } catch (error) {
      await this.rollbackTransaction(results);
      
      return {
        success: false,
        error: error.message,
        completedSteps: results.filter(r => r.success),
        failedStep: error.step,
        suggestion: this.getSuggestion(error)
      };
    }
  }
  
  /**
   * Build complete workflow for each intent
   */
  private buildWorkflowPlan(classification: IntentClassification): WorkflowPlan {
    switch (classification.intent) {
      case IntentCategory.BILLING_ADD_PURCHASE:
        return this.buildAddPurchaseWorkflow(classification.entities);
        
      case IntentCategory.BILLING_RECEIVE_PAYMENT:
        return this.buildReceivePaymentWorkflow(classification.entities);
        
      // ... 50+ intent handlers
    }
  }
  
  /**
   * Example: ADD_PURCHASE workflow (15 steps)
   */
  private buildAddPurchaseWorkflow(entities: EntityMap): WorkflowPlan {
    return {
      intent: IntentCategory.BILLING_ADD_PURCHASE,
      steps: [
        {
          name: "Validate Customer",
          action: () => this.validateCustomer(entities.customers[0]),
          validate: () => Promise.resolve(!!entities.customers[0]),
          rollback: () => Promise.resolve(),
          required: true,
          retryable: false,
          maxRetries: 0
        },
        {
          name: "Validate Product",
          action: () => this.validateProduct(entities.products[0]),
          validate: () => Promise.resolve(!!entities.products[0]),
          rollback: () => Promise.resolve(),
          required: true,
          retryable: false,
          maxRetries: 0
        },
        {
          name: "Fetch Live Price",
          action: () => this.fetchProductPrice(entities.products[0].product.id),
          validate: () => Promise.resolve(true),
          rollback: () => Promise.resolve(),
          required: true,
          retryable: true,
          maxRetries: 3
        },
        {
          name: "Validate Stock",
          action: () => this.validateStock(entities.products[0]),
          validate: () => Promise.resolve(true),
          rollback: () => Promise.resolve(),
          required: true,
          retryable: false,
          maxRetries: 0
        },
        {
          name: "Calculate Total",
          action: () => this.calculateTotal(entities.products[0], entities.quantities[0]),
          validate: () => Promise.resolve(true),
          rollback: () => Promise.resolve(),
          required: true,
          retryable: false,
          maxRetries: 0
        },
        {
          name: "Create Bill",
          action: () => this.createBill(entities),
          validate: () => Promise.resolve(true),
          rollback: () => this.deleteBill(),
          required: true,
          retryable: true,
          maxRetries: 3
        },
        {
          name: "Update Inventory",
          action: () => this.updateInventory(entities.products[0]),
          validate: () => Promise.resolve(true),
          rollback: () => this.revertInventory(),
          required: true,
          retryable: true,
          maxRetries: 3
        },
        {
          name: "Update Customer Balance",
          action: () => this.updateCustomerBalance(entities.customers[0]),
          validate: () => Promise.resolve(true),
          rollback: () => this.revertCustomerBalance(),
          required: true,
          retryable: true,
          maxRetries: 3
        },
        {
          name: "Save Transaction",
          action: () => this.saveTransaction(entities),
          validate: () => Promise.resolve(true),
          rollback: () => this.deleteTransaction(),
          required: true,
          retryable: true,
          maxRetries: 3
        },
        {
          name: "Send WhatsApp Notification",
          action: () => this.sendWhatsAppNotification(entities),
          validate: () => Promise.resolve(true),
          rollback: () => Promise.resolve(), // Cannot rollback notification
          required: false, // Not required for transaction success
          retryable: true,
          maxRetries: 2
        },
        {
          name: "Refresh UI State",
          action: () => this.refreshUIState(),
          validate: () => Promise.resolve(true),
          rollback: () => Promise.resolve(),
          required: false,
          retryable: false,
          maxRetries: 0
        }
      ],
      estimatedDuration: 2000, // 2 seconds
      requiresConfirmation: false
    };
  }
}
```

---

## Module 4: Business Query Engine

### File: `apps/web/lib/enterprise-ai/business-query-engine.ts`


```typescript
export class BusinessQueryEngine {
  /**
   * CRITICAL: ALL queries use live MySQL data
   * NO hardcoded responses
   * NO demo data
   */
  public async executeQuery(
    intent: IntentCategory,
    entities: EntityMap,
    context: ConversationContext
  ): Promise<QueryResult> {
    switch (intent) {
      case IntentCategory.BI_TODAY_SALES:
        return await this.queryTodaySales();
        
      case IntentCategory.BI_HIGHEST_PENDING:
        return await this.queryHighestPendingBalance();
        
      case IntentCategory.BI_TOP_PRODUCTS:
        return await this.queryTopProducts(context.timeRange);
        
      case IntentCategory.PRODUCT_PRICE:
        return await this.queryProductPrice(entities.products[0]);
        
      // ... 40+ query handlers
    }
  }
  
  /**
   * Example: "Who owes the most money?"
   */
  private async queryHighestPendingBalance(): Promise<QueryResult> {
    const sql = `
      SELECT 
        name,
        outstanding_balance,
        phone,
        last_transaction_date
      FROM customers
      WHERE outstanding_balance > 0
      ORDER BY outstanding_balance DESC
      LIMIT 10
    `;
    
    const results = await this.executeSQL(sql);
    
    return {
      success: true,
      data: results,
      summary: `${results[0].name} owes the most: ₹${results[0].outstanding_balance}`,
      visualization: this.generateChart(results, "bar")
    };
  }
  
  /**
   * Example: "Price of 4 litre milk"
   */
  private async queryProductPrice(
    product: ProductEntity,
    quantity?: number,
    unit?: string
  ): Promise<QueryResult> {
    // Fetch fresh price from MySQL
    const sql = `
      SELECT 
        name,
        selling_price,
        unit,
        mrp,
        stock_quantity
      FROM products
      WHERE id = ?
    `;
    
    const result = await this.executeSQL(sql, [product.product.id]);
    const basePrice = parseFloat(result[0].selling_price);
    const productUnit = result[0].unit;
    
    // Handle quantity conversion
    let finalPrice = basePrice;
    if (quantity) {
      // Convert units if needed
      const multiplier = this.convertUnits(quantity, unit, productUnit);
      finalPrice = basePrice * multiplier;
    }
    
    return {
      success: true,
      data: {
        product: result[0].name,
        unitPrice: basePrice,
        unit: productUnit,
        quantity: quantity || 1,
        total: finalPrice,
        stockAvailable: parseInt(result[0].stock_quantity)
      },
      summary: `${result[0].name} price is ₹${basePrice}/${productUnit}. ` +
               (quantity ? `For ${quantity}${unit}, total is ₹${finalPrice.toFixed(2)}.` : ""),
      actionable: quantity ? "Would you like to add this to a customer account?" : null
    };
  }
  
  /**
   * Example: "Today's sales"
   */
  private async queryTodaySales(): Promise<QueryResult> {
    const today = new Date().toISOString().split('T')[0];
    
    const sql = `
      SELECT 
        SUM(total_amount) as total_sales,
        SUM(CASE WHEN credit_bill = 1 THEN total_amount ELSE 0 END) as credit_sales,
        SUM(CASE WHEN credit_bill = 0 THEN total_amount ELSE 0 END) as cash_sales,
        COUNT(*) as total_bills
      FROM bills
      WHERE DATE(created_at) = ?
    `;
    
    const result = await this.executeSQL(sql, [today]);
    
    return {
      success: true,
      data: result[0],
      summary: 
        `📊 Today's Sales:\n` +
        `Total: ₹${result[0].total_sales}\n` +
        `Credit: ₹${result[0].credit_sales}\n` +
        `Cash: ₹${result[0].cash_sales}\n` +
        `Bills: ${result[0].total_bills}`,
      visualization: this.generateChart(result[0], "donut")
    };
  }
}
```

---

## Module 5: Context Manager (AI Memory)

### File: `apps/web/lib/enterprise-ai/context-manager.ts`

```typescript
export interface ConversationContext {
  sessionId: string;
  activeCustomer: Customer | null;
  activeBill: Bill | null;
  activeProducts: Product[];
  language: Language;
  conversationHistory: Message[];
  lastIntent: IntentCategory | null;
  pendingActions: PendingAction[];
  timestamp: Date;
}

export class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  
  /**
   * Remember context across multiple commands
   */
  public updateContext(
    sessionId: string,
    updates: Partial<ConversationContext>
  ): ConversationContext {
    const existing = this.contexts.get(sessionId) || this.createNewContext(sessionId);
    
    const updated = {
      ...existing,
      ...updates,
      timestamp: new Date()
    };
    
    this.contexts.set(sessionId, updated);
    return updated;
  }
  
  /**
   * Use context to resolve ambiguous entities
   */
  public resolveWithContext(
    entities: EntityMap,
    context: ConversationContext
  ): EntityMap {
    // If no customer specified but context has active customer
    if (entities.customers.length === 0 && context.activeCustomer) {
      entities.customers = [context.activeCustomer];
    }
    
    // If quantity not specified, use last quantity
    if (entities.quantities.length === 0 && context.conversationHistory.length > 0) {
      const lastQuantity = this.findLastQuantity(context.conversationHistory);
      if (lastQuantity) {
        entities.quantities = [lastQuantity];
      }
    }
    
    return entities;
  }
  
  /**
   * Example usage:
   * User: "Open Avinash account"  → context.activeCustomer = Avinash
   * User: "Add rice"               → Uses activeCustomer (Avinash)
   * User: "Add milk"               → Uses activeCustomer (Avinash)
   * User: "Receive 500"            → Uses activeCustomer (Avinash)
   */
}
```

---

## Module 6: Self-Verification Layer

### File: `apps/web/lib/enterprise-ai/self-verification.ts`

```typescript
export class SelfVerification {
  /**
   * Verify before returning response
   */
  public async verify(
    workflow: WorkflowResult,
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];
    
    // Check 1: Did we identify the customer correctly?
    if (classification.entities.customers.length > 0) {
      checks.push(await this.verifyCustomerIdentification(
        classification.entities.customers[0],
        workflow
      ));
    }
    
    // Check 2: Did we identify the product correctly?
    if (classification.entities.products.length > 0) {
      checks.push(await this.verifyProductIdentification(
        classification.entities.products[0],
        workflow
      ));
    }
    
    // Check 3: Did we fetch live MySQL data?
    checks.push(await this.verifyLiveDataFetch(workflow));
    
    // Check 4: Did we calculate correctly?
    if (workflow.calculations) {
      checks.push(await this.verifyCalculations(workflow.calculations));
    }
    
    // Check 5: Did we update the database?
    if (workflow.databaseOperations) {
      checks.push(await this.verifyDatabaseUpdates(workflow.databaseOperations));
    }
    
    // Check 6: Did we send WhatsApp?
    if (workflow.notifications) {
      checks.push(await this.verifyNotifications(workflow.notifications));
    }
    
    // Check 7: Did we refresh the UI?
    checks.push(await this.verifyUIUpdate(workflow));
    
    const allPassed = checks.every(c => c.passed);
    const criticalFailed = checks.some(c => !c.passed && c.critical);
    
    return {
      passed: allPassed,
      criticalFailure: criticalFailed,
      checks,
      warnings: checks.filter(c => !c.passed && !c.critical)
    };
  }
}
```

---

## Module 7: Response Generator

### File: `apps/web/lib/enterprise-ai/response-generator.ts`

```typescript
export class ResponseGenerator {
  /**
   * Generate structured response
   */
  public generate(
    workflow: WorkflowResult,
    classification: IntentClassification,
    verification: VerificationResult,
    language: Language
  ): Response {
    if (!workflow.success) {
      return this.generateErrorResponse(workflow, classification, language);
    }
    
    if (classification.requiresClarification) {
      return this.generateClarificationRequest(classification, language);
    }
    
    return this.generateSuccessResponse(workflow, classification, verification, language);
  }
  
  /**
   * Success response template
   */
  private generateSuccessResponse(
    workflow: WorkflowResult,
    classification: IntentClassification,
    verification: VerificationResult,
    language: Language
  ): Response {
    const template = this.getTemplate(classification.intent, language);
    
    return {
      status: "SUCCESS",
      intent: classification.intent,
      entities: {
        customer: classification.entities.customers[0]?.name,
        product: classification.entities.products[0]?.product.name,
        quantity: classification.entities.quantities[0]?.value,
        unit: classification.entities.quantities[0]?.unit,
        amount: classification.entities.amounts[0]?.value
      },
      actions: workflow.results.map(r => ({
        step: r.step,
        status: r.success ? "✅" : "❌",
        duration: r.duration
      })),
      executionResult: {
        total: workflow.total,
        balance: workflow.newBalance,
        stock: workflow.remainingStock,
        billId: workflow.billId,
        transactionId: workflow.transactionId
      },
      message: template.format({
        customerName: classification.entities.customers[0]?.name,
        productName: classification.entities.products[0]?.product.name,
        quantity: classification.entities.quantities[0]?.value,
        total: workflow.total,
        balance: workflow.newBalance
      }),
      verification: verification,
      suggestions: this.generateSuggestions(workflow, classification)
    };
  }
  
  /**
   * Error response with suggestions
   */
  private generateErrorResponse(
    workflow: WorkflowResult,
    classification: IntentClassification,
    language: Language
  ): Response {
    return {
      status: "ERROR",
      intent: classification.intent,
      error: workflow.error,
      failedStep: workflow.failedStep,
      completedSteps: workflow.completedSteps,
      message: this.getErrorMessage(workflow.error, language),
      suggestions: this.getErrorSuggestions(workflow.error, language),
      retryable: workflow.retryable
    };
  }
  
  /**
   * Clarification request (never silent!)
   */
  private generateClarificationRequest(
    classification: IntentClassification,
    language: Language
  ): Response {
    const missing = classification.missingEntities;
    
    if (missing.includes("customer")) {
      return {
        status: "CLARIFICATION_NEEDED",
        message: this.translate("Which customer account?", language),
        suggestions: this.getRecentCustomers(5)
      };
    }
    
    if (missing.includes("product")) {
      return {
        status: "CLARIFICATION_NEEDED",
        message: this.translate("Which product?", language),
        suggestions: this.getPopularProducts(5)
      };
    }
    
    if (missing.includes("quantity")) {
      return {
        status: "CLARIFICATION_NEEDED",
        message: this.translate("How much quantity?", language),
        suggestions: ["1 kg", "2 kg", "1 litre", "1 packet"]
      };
    }
    
    // Fallback: Always provide guidance
    return {
      status: "CLARIFICATION_NEEDED",
      message: this.translate("I didn't understand completely. Here's what I can help with:", language),
      suggestions: this.getCommonCommands(language)
    };
  }
}
```

---

## Module 8: Error Recovery System

### File: `apps/web/lib/enterprise-ai/error-recovery.ts`

```typescript
export class ErrorRecovery {
  /**
   * Intelligent error handling
   */
  public handleError(
    error: WorkflowError,
    classification: IntentClassification,
    context: ConversationContext,
    language: Language
  ): RecoveryResponse {
    // Case 1: Multiple customers found
    if (error.type === "AMBIGUOUS_CUSTOMER") {
      return {
        type: "DISAMBIGUATION",
        message: this.translate(
          `I found ${error.candidates.length} customers named "${error.query}". Which one?`,
          language
        ),
        options: error.candidates.map(c => ({
          label: `${c.name} - ${c.phone}`,
          value: c.id
        }))
      };
    }
    
    // Case 2: Product not found with suggestions
    if (error.type === "PRODUCT_NOT_FOUND") {
      const similar = this.findSimilarProducts(error.query, 3);
      return {
        type: "SUGGESTION",
        message: this.translate(
          `I couldn't find "${error.query}". Did you mean:`,
          language
        ),
        options: similar.map(p => ({
          label: p.name,
          value: p.id
        }))
      };
    }
    
    // Case 3: Out of stock
    if (error.type === "OUT_OF_STOCK") {
      return {
        type: "ALTERNATIVE",
        message: this.translate(
          `${error.product} is out of stock. Available alternatives:`,
          language
        ),
        options: this.findAlternatives(error.product)
      };
    }
    
    // Case 4: Network/MySQL error
    if (error.type === "DATABASE_ERROR") {
      return {
        type: "RETRY",
        message: this.translate(
          "Database connection failed. Retrying...",
          language
        ),
        retryAction: () => this.retryWithBackoff(error.operation, 3)
      };
    }
    
    // Default: Always provide next steps
    return {
      type: "GUIDANCE",
      message: this.translate(
        `Something went wrong: ${error.message}. Here's what you can try:`,
        language
      ),
      options: this.getRecoveryOptions(error, language)
    };
  }
}
```

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
**Deliverables:**
- ✅ Universal Intent Router (50+ intents)
- ✅ Entity Extraction Engine
- ✅ Context Manager
- ✅ Test suite (200+ tests)

### Phase 2: Execution (Week 3-4)
**Deliverables:**
- ✅ Workflow Orchestration Engine
- ✅ Business Query Engine
- ✅ Transaction management
- ✅ Integration tests

### Phase 3: Intelligence (Week 5-6)
**Deliverables:**
- ✅ Self-Verification Layer
- ✅ Error Recovery System
- ✅ Response Generator
- ✅ Multilingual templates

### Phase 4: Integration (Week 7)
**Deliverables:**
- ✅ Frontend integration
- ✅ Backend API updates
- ✅ End-to-end testing
- ✅ Performance optimization

### Phase 5: Deployment (Week 8)
**Deliverables:**
- ✅ Feature flag rollout
- ✅ Production monitoring
- ✅ User documentation
- ✅ Training materials

---

## Success Criteria

### Zero Silent Failures
✅ Every query receives a response  
✅ Response time < 2 seconds  
✅ Error rate < 1%  

### Complete Workflow Execution
✅ Multi-intent success: 98%+  
✅ All workflow steps execute  
✅ Transaction rollback on failure  

### Data Accuracy
✅ 100% live MySQL data (no cache)  
✅ Price calculation: 100% accurate  
✅ Product recognition: 95%+ accuracy  

### User Satisfaction
✅ Task completion rate: 95%+  
✅ Support tickets: -80%  
✅ User rating: 9/10+  

---

**Ready to begin implementation?**

This is a complete enterprise-grade redesign. Please confirm to proceed.

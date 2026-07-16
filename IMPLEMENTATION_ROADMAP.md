# AI Workflow Engine - Implementation Roadmap

## 📋 Executive Summary

This document provides a complete step-by-step implementation plan to transform the GramMart AI assistant from a simple chatbot into an intelligent workflow engine.

**Total Effort:** 5 weeks (1 engineer, full-time)  
**Modules:** 5 core modules + integration  
**Testing:** Continuous testing after each module  

---

## 🎯 Implementation Options

### Option A: Full Implementation (Recommended)
- **Duration:** 5 weeks
- **Approach:** Sequential module development
- **Testing:** Unit tests + integration tests per module
- **Deployment:** Single deployment after all modules complete
- **Risk:** Medium (breaking changes managed via feature flags)

### Option B: Proof of Concept
- **Duration:** 1 week
- **Scope:** Module 1 (Multi-Intent Parser) only
- **Testing:** 10-20 command patterns
- **Deployment:** Behind feature flag for testing
- **Risk:** Low (isolated module, easy to revert)

### Option C: Iterative with User Feedback
- **Duration:** 5-7 weeks (includes review cycles)
- **Approach:** Deploy one module at a time
- **Testing:** Real user testing after each module
- **Deployment:** Rolling deployments
- **Risk:** Low (gradual changes, user validation)

---

## 📦 Module Breakdown

### Module 1: Multi-Intent Parser 🔴 CRITICAL
**Files to Create:**
- `apps/web/lib/intent-parser.ts` (new)
- `apps/web/lib/intent-parser.test.ts` (new)

**Files to Modify:**
- `apps/web/components/floating-mic.tsx` (integrate parser)
- `apps/web/app/page.tsx` (update command handler)

**Core Functions:**
```typescript
export function parseMultiIntent(text: string, language: Language): Intent[]
export function extractEntities(text: string): EntityMap
export function orderIntents(intents: Intent[]): Intent[]
```

**Estimated Lines of Code:** 300-400 lines  
**Testing:** 25 test cases covering edge cases  
**Duration:** 3-5 days  

---

### Module 2: Workflow Orchestrator 🔴 CRITICAL
**Files to Create:**
- `apps/web/lib/workflow-engine.ts` (new)
- `apps/web/lib/workflow-definitions.ts` (new)
- `apps/web/lib/workflow-engine.test.ts` (new)

**Files to Modify:**
- `apps/web/app/page.tsx` (replace executeDirectCommand)

**Core Classes:**
```typescript
class WorkflowEngine { execute(), buildWorkflow(), rollback() }
class WorkflowStep { execute(), validate(), undo() }
```

**Estimated Lines of Code:** 500-600 lines  
**Testing:** 15 workflow scenarios  
**Duration:** 5-7 days  

---

### Module 3: Enhanced Product Matcher 🔴 CRITICAL
**Files to Create:**
- `apps/web/lib/product-matcher.ts` (new)
- `apps/web/lib/product-keywords.ts` (new, port from floating-mic)
- `apps/web/lib/product-matcher.test.ts` (new)

**Files to Modify:**
- `apps/web/app/page.tsx` (replace resolveProductFromVoice)

**Core Functions:**
```typescript
export function matchProduct(query, products, language): ProductMatch
export function fuzzyMatch(query, productName): number
export function getProductAliases(product, language): string[]
```

**Estimated Lines of Code:** 400-500 lines  
**Testing:** 50 product recognition tests  
**Duration:** 4-5 days  

---

### Module 4: Live Price Calculator 🟡 HIGH
**Files to Create:**
- `apps/web/lib/price-calculator.ts` (new)

**Files to Modify:**
- `apps/web/lib/api.ts` (add calculateTransactionTotal)
- Backend: `apps/api/src/.../ProductController.java` (add GET by ID)

**Core Functions:**
```typescript
export async function calculateTransactionTotal(productId, quantity)
export async function validateStock(productId, quantity)
export async function fetchLivePrice(productId)
```

**Estimated Lines of Code:** 200-250 lines (frontend + backend)  
**Testing:** 10 calculation scenarios  
**Duration:** 3-4 days  

---

### Module 5: Business Query Engine 🟡 HIGH
**Files to Create:**
- `apps/web/lib/business-queries.ts` (new)
- `apps/web/lib/query-classifier.ts` (new)

**Files to Modify:**
- `apps/web/app/api/ai/chat/route.ts` (integrate query engine)

**Core Functions:**
```typescript
export function classifyQuery(query: string): QueryIntent
export async function executeBusinessQuery(intent: QueryIntent, context)
export async function queryCustomersByBalance(order, limit)
export async function queryDailySales(date)
```

**Estimated Lines of Code:** 400-500 lines  
**Testing:** 20 query types  
**Duration:** 4-5 days  

---

## 📅 Week-by-Week Timeline

### Week 1: Multi-Intent Parser + Setup
**Days 1-2: Project Setup**
- Create feature branch: `feature/ai-workflow-engine`
- Set up feature flags for gradual rollout
- Create test fixtures and mock data
- Document API contracts

**Days 3-5: Multi-Intent Parser**
- Implement `parseMultiIntent()` function
- Add entity extraction logic
- Port intent keywords from FloatingMic
- Write 25 unit tests
- Integration with FloatingMic component

**Deliverable:** Multi-intent parsing working end-to-end

---

### Week 2: Workflow Orchestrator
**Days 1-3: Core Engine**
- Implement `WorkflowEngine` class
- Create workflow step definitions
- Add transaction management
- Error handling and rollback logic

**Days 4-5: Integration**
- Replace `executeDirectCommand` with orchestrator
- Test 5 workflow scenarios
- Performance benchmarking

**Deliverable:** Workflow engine executing multi-step operations

---

### Week 3: Enhanced Product Matcher
**Days 1-2: Product Keywords**
- Port 60+ product keywords from FloatingMic
- Add regional language support
- Create product alias database

**Days 3-5: Matching Algorithms**
- Implement fuzzy matching (Levenshtein)
- Add phonetic matching
- Regional name resolution
- Write 50 product recognition tests
- Integration with workflow engine

**Deliverable:** 95%+ product recognition accuracy

---

### Week 4: Live Price Calculator + Backend API
**Days 1-2: Backend API**
- Add `GET /products/{id}` endpoint in Spring Boot
- Add stock validation logic
- Write API tests

**Days 3-4: Frontend Integration**
- Implement `calculateTransactionTotal()`
- Replace all stale price usage
- Add stock validation before purchase

**Day 5: Testing**
- Price calculation accuracy tests
- Integration tests with MySQL

**Deliverable:** 100% accurate price calculations

---

### Week 5: Business Query Engine + Final Integration
**Days 1-3: Query Engine**
- Implement query classifier
- Create 20+ query functions
- MySQL query optimization
- Write query tests

**Days 4-5: Final Integration**
- Integrate all 5 modules
- End-to-end testing
- Performance optimization
- Documentation update

**Deliverable:** Complete AI Workflow Engine ready for production

---

## ✅ Testing Strategy

### Unit Testing (Per Module)
- **Coverage Target:** 80%+
- **Tools:** Jest, React Testing Library
- **Test Files:** `*.test.ts` alongside source files
- **Run:** `npm run test` before each commit

### Integration Testing (After Each Module)
- **Scenarios:** 10-15 per module
- **Tools:** Playwright for E2E
- **Environment:** Local dev environment
- **Run:** Automated via GitHub Actions

### User Acceptance Testing (After Complete)
- **Test Users:** 3-5 shop owners
- **Duration:** 1 week
- **Feedback:** Google Form + direct calls
- **Metrics:** Task completion rate, error rate, satisfaction score

---

## 🚦 Deployment Strategy

### Phase 1: Feature Flag Rollout (Week 5)
```typescript
// Feature flag in .env
ENABLE_WORKFLOW_ENGINE=false // Default OFF

// Code usage
if (process.env.ENABLE_WORKFLOW_ENGINE === 'true') {
  // Use new workflow engine
} else {
  // Use old executeDirectCommand
}
```

### Phase 2: Beta Testing (Week 6)
- Enable for 10% of users
- Monitor error rates, performance
- Collect user feedback

### Phase 3: Gradual Rollout (Week 7)
- 25% of users (Day 1-2)
- 50% of users (Day 3-4)
- 100% of users (Day 5-7)
- Remove feature flag after 1 week of stability

### Phase 4: Monitoring (Ongoing)
- Error tracking: Sentry
- Performance monitoring: New Relic
- User analytics: Mixpanel
- Daily health checks

---

## 📊 Success Metrics

### Technical Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Multi-intent success rate | 0% | 95% | Automated tests |
| Product recognition accuracy | 60% | 95% | Test suite |
| Price calculation accuracy | 70% | 100% | Validation checks |
| Workflow completion rate | 40% | 98% | Transaction logs |
| Error rate | 20% | <2% | Error tracking |
| Response time | 500ms | <1000ms | Performance monitoring |

### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| User satisfaction | 9/10 | Post-release survey |
| Task completion time | -50% | Time tracking |
| Support tickets | -70% | Ticket volume |
| Feature adoption | 80%+ | Usage analytics |

---

## 🛡️ Risk Management

### Risk 1: Breaking Changes
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Feature flags for gradual rollout
- Comprehensive test coverage
- Rollback plan ready

### Risk 2: Performance Degradation
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- Performance benchmarks before/after
- Caching strategy (Redis)
- Database query optimization
- Load testing before production

### Risk 3: Inaccurate Product Matching
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- Confidence threshold (>90%)
- Fallback to user selection
- Learning from corrections
- Regional testing with actual shopkeepers

### Risk 4: MySQL Connection Failures
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- Fallback to cached data
- Retry logic (3 attempts)
- Connection pooling
- Health check endpoints

---

## 📝 Documentation Requirements

### Developer Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Architecture diagrams (Mermaid)
- [ ] Code comments (JSDoc)
- [ ] Setup guide (README.md)

### User Documentation
- [ ] Feature announcement
- [ ] Video tutorial (2-3 minutes)
- [ ] FAQ document
- [ ] Troubleshooting guide

---

## 🎯 Decision Point

**Which implementation option do you prefer?**

**A. Full Implementation (5 weeks)**
✅ Complete transformation
✅ All features at once
⚠️ Longer wait time

**B. Proof of Concept (1 week)**
✅ Quick validation
✅ Low risk
⚠️ Only multi-intent parsing

**C. Iterative (5-7 weeks)**
✅ User feedback per module
✅ Gradual improvements
⚠️ More coordination overhead

**Please reply with A, B, or C to proceed with implementation.**

---

## 📦 Deliverables Summary

After complete implementation, you will receive:

### Code Deliverables
1. ✅ 5 new library modules (fully tested)
2. ✅ Enhanced FloatingMic component
3. ✅ Updated page.tsx with workflow engine
4. ✅ New backend API endpoints
5. ✅ Comprehensive test suite (100+ tests)

### Documentation
1. ✅ API documentation
2. ✅ Architecture diagrams
3. ✅ User guide
4. ✅ Developer setup guide

### Quality Assurance
1. ✅ 80%+ code coverage
2. ✅ All tests passing
3. ✅ Performance benchmarks
4. ✅ Security audit

---

**Ready to begin? Awaiting your decision (A, B, or C).**

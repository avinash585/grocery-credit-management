# 🤖 GramMart AI Assistant - Test Plan & Verification

**Last Updated:** 2026-07-12  
**Status:** Ready for Testing  
**Deployment:** Commit `d47bd04`

---

## 📋 Overview

This document outlines comprehensive tests to verify that the GramMart AI Assistant:
1. ✅ Responds correctly in all 8 languages
2. ✅ Recognizes products accurately (50+ items with regional aliases)
3. ✅ Generates correct action blocks for operations
4. ✅ Provides informational responses without actions for queries
5. ✅ Detects language automatically
6. ✅ Handles mixed-language (Tanglish/Hinglish) inputs

---

## 🔧 Test Environment Setup

### Local Testing
```bash
# Terminal 1: Start backend
cd apps/api
mvn spring-boot:run

# Terminal 2: Start frontend
cd apps/web
npm run dev
```

### Production Testing
```powershell
# Set environment variables
$env:API_BASE_URL = "https://your-backend.railway.app/api"
$env:FRONTEND_URL = "https://grammart.vercel.app"

# Run automated tests
.\test-ai-assistant.ps1
```

---

## 🧪 Test Categories

### 1. Language Detection Tests

| Test ID | Input | Expected Detection | Pass/Fail |
|---------|-------|-------------------|-----------|
| LD-01 | "அரிசி விலை என்ன?" | TAMIL | ⬜ |
| LD-02 | "चावल की कीमत क्या है?" | HINDI | ⬜ |
| LD-03 | "What is rice price?" | ENGLISH | ⬜ |
| LD-04 | "Kumar account-la 2 kg arisi add pannunga" | TANGLISH | ⬜ |
| LD-05 | "Kumar account mein rice add karo" | HINGLISH | ⬜ |
| LD-06 | "బియ్యం ధర ఎంత?" | TELUGU | ⬜ |
| LD-07 | "ಅಕ್ಕಿ ಬೆಲೆ ಎಷ್ಟು?" | KANNADA | ⬜ |
| LD-08 | "അരി വില എത്രയാണ്?" | MALAYALAM | ⬜ |

---

### 2. Product Recognition Tests

#### 2.1 Rice Products (All Languages)

| Test ID | Language | Input | Expected Product | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| PR-01 | Tamil | "அரிசி விலை" | Rice | ⬜ |
| PR-02 | Hindi | "चावल की कीमत" | Rice | ⬜ |
| PR-03 | Telugu | "బియ్యం రేటు" | Rice | ⬜ |
| PR-04 | Kannada | "ಅಕ್ಕಿ ಬೆಲೆ" | Rice | ⬜ |
| PR-05 | Malayalam | "അരി വില" | Rice | ⬜ |
| PR-06 | Tanglish | "arisi rate" | Rice | ⬜ |
| PR-07 | Hinglish | "chawal price" | Rice | ⬜ |
| PR-08 | English | "basmati rice" | Premium Basmati Rice | ⬜ |

#### 2.2 Sugar Products

| Test ID | Language | Input | Expected Product | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| PR-10 | Tamil | "சர்க்கரை" | Sugar | ⬜ |
| PR-11 | Hindi | "चीनी" | Sugar | ⬜ |
| PR-12 | Telugu | "చక్కెర" | Sugar | ⬜ |
| PR-13 | Kannada | "ಸಕ್ಕರೆ" | Sugar | ⬜ |
| PR-14 | Malayalam | "പഞ്ചസാര" | Sugar | ⬜ |
| PR-15 | Tanglish | "sakkara" | Sugar | ⬜ |

#### 2.3 Oil Products

| Test ID | Language | Input | Expected Product | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| PR-20 | Tamil | "எண்ணெய்" | Oil (Generic) | ⬜ |
| PR-21 | Hindi | "तेल" | Oil (Generic) | ⬜ |
| PR-22 | English | "groundnut oil" | Groundnut Oil | ⬜ |
| PR-23 | English | "sunflower oil" | Sunflower Oil | ⬜ |

#### 2.4 Dal/Pulses Products

| Test ID | Language | Input | Expected Product | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| PR-30 | Tamil | "துவரம் பருப்பு" | Toor Dal | ⬜ |
| PR-31 | Hindi | "अरहर दाल" | Toor Dal | ⬜ |
| PR-32 | English | "moong dal" | Moong Dal | ⬜ |
| PR-33 | Hindi | "चना दाल" | Chana Dal | ⬜ |

#### 2.5 Milk Products

| Test ID | Language | Input | Expected Product | Pass/Fail |
|---------|----------|-------|-----------------|-----------|
| PR-40 | Tamil | "பால்" | Milk | ⬜ |
| PR-41 | Hindi | "दूध" | Milk | ⬜ |
| PR-42 | Telugu | "పాలు" | Milk | ⬜ |
| PR-43 | Tanglish | "paal" | Milk | ⬜ |

---

### 3. Action Generation Tests

#### 3.1 Product Query (NO Action Block Expected)

| Test ID | Input | Expected Response | Action Block? | Pass/Fail |
|---------|-------|-------------------|---------------|-----------|
| AG-01 | "What is rice price?" | "Rice price is Rs.50/kg" | ❌ NO | ⬜ |
| AG-02 | "அரிசி விலை என்ன?" | Tamil response with price | ❌ NO | ⬜ |
| AG-03 | "Is sugar available?" | Stock availability info | ❌ NO | ⬜ |
| AG-04 | "How much is oil?" | Price information | ❌ NO | ⬜ |

#### 3.2 Credit Sale (Action Block Expected)

| Test ID | Input | Expected Action | Pass/Fail |
|---------|-------|----------------|-----------|
| AG-10 | "Add 2 kg rice to Kumar account" | `{intent: ADD_PURCHASE, customer: Kumar, product: Rice, qty: 2kg}` | ⬜ |
| AG-11 | "குமார் கணக்குல 1 கிலோ சர்க்கரை போடு" | Tamil ADD_PURCHASE action | ⬜ |
| AG-12 | "Kumar account-la 2 kg arisi add pannunga" | Tanglish ADD_PURCHASE action | ⬜ |
| AG-13 | "Kumar account mein rice add karo" | Hinglish ADD_PURCHASE action | ⬜ |

#### 3.3 Payment Recording (Action Block Expected)

| Test ID | Input | Expected Action | Pass/Fail |
|---------|-------|----------------|-----------|
| AG-20 | "Kumar paid 500 rupees" | `{intent: RECEIVE_PAYMENT, customer: Kumar, amount: 500}` | ⬜ |
| AG-21 | "குமார் 500 ரூபாய் கொடுத்தார்" | Tamil RECEIVE_PAYMENT action | ⬜ |
| AG-22 | "Kumar ne 500 diye" | Hinglish RECEIVE_PAYMENT action | ⬜ |

#### 3.4 Account Opening (Action Block Expected)

| Test ID | Input | Expected Action | Pass/Fail |
|---------|-------|----------------|-----------|
| AG-30 | "Open Kumar account" | `{intent: OPEN_CUSTOMER, customer: Kumar}` | ⬜ |
| AG-31 | "குமார் கணக்கு திற" | Tamil OPEN_CUSTOMER action | ⬜ |
| AG-32 | "Kumar ka account khole" | Hindi OPEN_CUSTOMER action | ⬜ |

#### 3.5 Balance Check (NO Action Block)

| Test ID | Input | Expected Response | Action Block? | Pass/Fail |
|---------|-------|-------------------|---------------|-----------|
| AG-40 | "What is Kumar balance?" | Balance information | ❌ NO | ⬜ |
| AG-41 | "குமார் எவ்வளவு கடன் வைத்துள்ளார்?" | Tamil balance info | ❌ NO | ⬜ |
| AG-42 | "Kumar kitna baaki hai?" | Hindi balance info | ❌ NO | ⬜ |

---

### 4. Business Logic Tests

#### 4.1 Credit Risk Warning

| Test ID | Scenario | Expected Behavior | Pass/Fail |
|---------|----------|------------------|-----------|
| BL-01 | Customer balance > Rs.400, new credit requested | AI warns about high balance before action | ⬜ |
| BL-02 | Customer balance < Rs.400, new credit requested | AI adds credit without warning | ⬜ |

#### 4.2 Seasonal Recommendations

| Test ID | Query | Expected Suggestion | Pass/Fail |
|---------|-------|-------------------|-----------|
| BL-10 | "What should I stock?" | Mentions seasonal items (festivals, etc.) | ⬜ |
| BL-11 | General shop advice | Suggests dal, rice, oil as staples | ⬜ |

---

### 5. Edge Case Tests

| Test ID | Input | Expected Behavior | Pass/Fail |
|---------|-------|------------------|-----------|
| EC-01 | Misspelled product: "ric" | Fuzzy match to "Rice" | ⬜ |
| EC-02 | Unknown customer: "Add rice to XYZ" | Ask for clarification or create new customer | ⬜ |
| EC-03 | Ambiguous: "Add rice" (no customer) | Ask which customer | ⬜ |
| EC-04 | Very long query (200+ words) | Handles gracefully, extracts intent | ⬜ |
| EC-05 | Empty/gibberish input | Polite fallback response | ⬜ |

---

## 🎯 Manual Testing Procedure

### Step 1: Voice Command Test
1. Open GramMart AI in browser
2. Click the floating microphone button
3. Speak: "Kumar account-la 2 kg arisi add pannunga"
4. Verify:
   - ✅ Language detected as TANGLISH
   - ✅ Parsed as ADD_PURCHASE intent
   - ✅ Customer: Kumar
   - ✅ Product: Rice (from "arisi")
   - ✅ Quantity: 2 kg
   - ✅ UI navigates to Kumar's account
   - ✅ 2kg rice is added as credit

### Step 2: AI Chat Test (Product Query)
1. Open a customer account (e.g., Kumar)
2. Click "Ask Assistant" button
3. Type: "அரிசி விலை என்ன?" (What is rice price in Tamil)
4. Verify:
   - ✅ AI responds in Tamil
   - ✅ Provides rice price from live catalog
   - ✅ NO action block in response (informational only)
   - ✅ No credit sale is created

### Step 3: AI Chat Test (Action Command)
1. In AI chat, type: "2 கிலோ சர்க்கரை போடு" (Add 2 kg sugar)
2. Verify:
   - ✅ AI responds in Tamil
   - ✅ Action block present in response
   - ✅ Frontend parses action and adds 2kg sugar
   - ✅ Customer balance updates
   - ✅ Transaction logged in database

### Step 4: Mixed Language Test
1. Type: "Kumar account-la sugar add pannunga. How much outstanding?"
2. Verify:
   - ✅ Handles mixed Tanglish
   - ✅ Executes action for sugar addition
   - ✅ Answers balance question
   - ✅ Maintains conversation context

---

## 🚀 Automated Testing

Run the PowerShell test script:

```powershell
# Local testing
.\test-ai-assistant.ps1

# Production testing
$env:API_BASE_URL = "https://your-backend.railway.app/api"
$env:FRONTEND_URL = "https://grammart.vercel.app"
.\test-ai-assistant.ps1
```

The script tests:
- ✅ Backend health check
- ✅ Voice command parsing
- ✅ Tamil product query
- ✅ Hindi product query
- ✅ English action with action block
- ✅ Hinglish mixed language

---

## 📊 Success Criteria

### Must Pass (Critical)
1. ✅ All 8 languages detected correctly (LD-01 to LD-08)
2. ✅ Core products recognized in all languages (Rice, Sugar, Oil, Dal, Milk)
3. ✅ Product queries return information WITHOUT action blocks (AG-01 to AG-04)
4. ✅ Credit commands generate correct action blocks (AG-10 to AG-13)
5. ✅ Backend health check passes
6. ✅ No TypeScript errors in Vercel build

### Should Pass (Important)
1. ✅ Credit risk warning for balance > Rs.400
2. ✅ Payment recording works in all languages
3. ✅ Account opening works in all languages
4. ✅ Fuzzy product matching for typos
5. ✅ Mixed language (Tanglish/Hinglish) handled correctly

### Nice to Have (Enhancement)
1. ✅ Seasonal recommendations
2. ✅ Conversational memory (context retention)
3. ✅ Ambiguous input clarification
4. ✅ WhatsApp notifications triggered after actions

---

## 🐛 Known Issues & Workarounds

### 1. Hardcoded `demo-shop`
- **File:** `SpeechIntelligenceService.java:550`
- **Impact:** Multi-tenant voice logs not working
- **Workaround:** Single-shop deployments unaffected
- **Fix:** Extract shopId from SecurityContext

### 2. No Tanglish/Hinglish Knowledge Packs
- **Impact:** Falls back to pure Tamil/Hindi
- **Workaround:** Code-switching detection works without packs
- **Fix:** Create `knowledge/tanglish/` and `knowledge/hinglish/` JSON files

### 3. Next.js AI Route Not Fully Upgraded
- **File:** `apps/web/app/api/ai/chat/route.ts`
- **Impact:** Frontend AI less capable than backend
- **Workaround:** Works for basic queries
- **Fix:** Align with backend `AiAssistantService` implementation

---

## 📝 Test Results Log

**Date:** _____________  
**Tester:** _____________  
**Environment:** □ Local  □ Staging  □ Production

### Quick Results
- Language Detection: ____ / 8 passed
- Product Recognition: ____ / 20 passed
- Action Generation: ____ / 15 passed
- Business Logic: ____ / 5 passed
- Edge Cases: ____ / 5 passed

### Critical Failures (if any):
```
[Space for notes]
```

### Recommendations:
```
[Space for notes]
```

---

## 🔗 Related Documentation

- **Upgrade Guide:** `MULTILINGUAL_AI_UPGRADE.md`
- **Deployment Status:** `DEPLOYMENT_STATUS.md`
- **Knowledge Transfer:** `KNOWLEDGE_TRANSFER.md`
- **API Documentation:** `API.md`

---

**Test Plan Version:** 1.0  
**Last Reviewed:** 2026-07-12  
**Next Review:** After production deployment verification


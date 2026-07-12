# 🧪 GramMart AI Assistant - Comprehensive Test Plan

**Date:** 2026-07-12  
**Status:** Testing multilingual AI assistant functionality  
**Scope:** Verify language detection, product recognition, action execution, and live data integration

---

## 🎯 Test Objectives

1. ✅ **Language Detection** - Auto-detect 8 languages (Tamil, Hindi, Telugu, Kannada, Malayalam, English, Tanglish, Hinglish)
2. ✅ **Product Recognition** - Recognize 50+ regional product aliases
3. ✅ **Action Execution** - Emit correct action blocks for operations
4. ✅ **Live Data Integration** - Query real customer balances and product catalog from MySQL
5. ✅ **Response Quality** - Natural language responses in the same language as user input
6. ✅ **Safety** - Product queries should NOT create credit sales

---

## 📋 Test Scenarios

### Test Category 1: Language Detection & Response

#### Test 1.1: Pure Tamil
**Input:**
```
"அரிசி விலை என்ன?"
(What is the rice price?)
```

**Expected Behavior:**
- ✅ Detects language: TAMIL
- ✅ Responds in Tamil script
- ✅ Fetches rice price from MySQL product catalog
- ✅ NO action block (informational query)
- ✅ Response format: "அரிசி விலை Rs.45/kg"

**Backend Endpoint:** `POST /api/ai/chat`

---

#### Test 1.2: Tanglish (Tamil + English)
**Input:**
```
"Kumar account-la 2 kg arisi add pannunga"
(Add 2 kg rice to Kumar's account)
```

**Expected Behavior:**
- ✅ Detects language: TANGLISH
- ✅ Responds in Tanglish
- ✅ Recognizes "arisi" = Rice
- ✅ Emits action block:
```json
{
  "intent": "ADD_PURCHASE",
  "customerName": "Kumar",
  "productAlias": "Rice",
  "quantity": "2 kg"
}
```
- ✅ Response: "Kumar account-la 2 kg arisi add pannitaen. Total Rs.90."

---

#### Test 1.3: Hindi
**Input:**
```
"कुमार का खाता खोलो"
(Open Kumar's account)
```

**Expected Behavior:**
- ✅ Detects language: HINDI
- ✅ Responds in Hindi (Devanagari script)
- ✅ Emits action block:
```json
{
  "intent": "OPEN_CUSTOMER",
  "customerName": "Kumar"
}
```
- ✅ Response: "कुमार का खाता खोल दिया गया।"

---

#### Test 1.4: Hinglish (Hindi + English)
**Input:**
```
"Kumar ke account mein 500 rupees payment aaya"
(Kumar paid 500 rupees)
```

**Expected Behavior:**
- ✅ Detects language: HINGLISH
- ✅ Responds in Hinglish
- ✅ Emits action block:
```json
{
  "intent": "RECEIVE_PAYMENT",
  "customerName": "Kumar",
  "amount": 500
}
```
- ✅ Response: "Kumar ka 500 rupees payment record ho gaya. Baaki Rs.20 hai."

---

#### Test 1.5: English
**Input:**
```
"What is the price of sugar?"
```

**Expected Behavior:**
- ✅ Detects language: ENGLISH
- ✅ Responds in English
- ✅ Fetches sugar price from catalog
- ✅ NO action block (informational)
- ✅ Response: "Sugar price is Rs.40/kg."

---

### Test Category 2: Product Recognition (Regional Aliases)

#### Test 2.1: Tamil Product Names
**Input:** "சர்க்கரை விலை?"
**Expected:** Recognizes சர்க்கரை (sakkarai) = Sugar → Returns sugar price

**Input:** "பால் எவ்வளவு?"
**Expected:** Recognizes பால் (paal) = Milk → Returns milk price

**Input:** "எண்ணெய் இருக்கா?"
**Expected:** Recognizes எண்ணெய் (ennai) = Oil → Returns oil stock info

---

#### Test 2.2: Hindi Product Names
**Input:** "दाल की कीमत?"
**Expected:** Recognizes दाल (dal) = Dal → Returns dal varieties & prices

**Input:** "चावल कितना है?"
**Expected:** Recognizes चावल (chawal) = Rice → Returns rice price

**Input:** "तेल का रेट?"
**Expected:** Recognizes तेल (tel) = Oil → Returns oil price

---

#### Test 2.3: Telugu Product Names
**Input:** "బియ్యం ధర ఎంత?"
**Expected:** Recognizes బియ్యం = Rice → Returns rice price

**Input:** "నూనె ఉందా?"
**Expected:** Recognizes నూనె = Oil → Returns oil availability

---

#### Test 2.4: Kannada Product Names
**Input:** "ಅಕ್ಕಿ ಬೆಲೆ?"
**Expected:** Recognizes ಅಕ್ಕಿ = Rice → Returns rice price

**Input:** "ಸಕ್ಕರೆ ಎಷ್ಟು?"
**Expected:** Recognizes ಸಕ್ಕರೆ = Sugar → Returns sugar price

---

#### Test 2.5: Malayalam Product Names
**Input:** "അരി വില എത്ര?"
**Expected:** Recognizes അരി = Rice → Returns rice price

**Input:** "ഉപ്പ് വേണം"
**Expected:** Recognizes ഉപ്പ് = Salt → Could trigger purchase or price query

---

#### Test 2.6: Mixed Language Product Names
**Input:** "Rice price enna?" (English + Tamil)
**Expected:** Recognizes both "Rice" and "enna" (what) → Returns price

**Input:** "2 kg chawal add karo" (English + Hindi)
**Expected:** Recognizes "chawal" = Rice → Triggers ADD_PURCHASE

---

### Test Category 3: Action Block Generation

#### Test 3.1: Open Customer Account
**Triggers:**
- "Kumar account thirakka" (Tamil)
- "कुमार का खाता खोलो" (Hindi)
- "Open Kumar account" (English)

**Expected Action Block:**
```json
{
  "intent": "OPEN_CUSTOMER",
  "customerName": "Kumar"
}
```

---

#### Test 3.2: Add Credit Purchase
**Triggers:**
- "Kumar-la 2 kg arisi add pannunga" (Tanglish)
- "कुमार को 2 किलो चावल दे दो" (Hindi)
- "Add 2 kg rice to Kumar account" (English)

**Expected Action Block:**
```json
{
  "intent": "ADD_PURCHASE",
  "customerName": "Kumar",
  "productAlias": "Rice",
  "quantity": "2 kg"
}
```

---

#### Test 3.3: Receive Payment
**Triggers:**
- "Kumar 500 rupees kuduthar" (Tamil)
- "कुमार ने 500 रुपये दिए" (Hindi)
- "Kumar paid 500" (English)

**Expected Action Block:**
```json
{
  "intent": "RECEIVE_PAYMENT",
  "customerName": "Kumar",
  "amount": 500
}
```

---

#### Test 3.4: Send Reminder
**Triggers:**
- "Kumar-kku reminder anuppu" (Tamil)
- "कुमार को रिमाइंडर भेजो" (Hindi)
- "Send reminder to Kumar" (English)

**Expected Action Block:**
```json
{
  "intent": "SEND_REMINDER",
  "customerName": "Kumar"
}
```

---

#### Test 3.5: Balance Query (NO action block)
**Triggers:**
- "Kumar balance enna?" (Tanglish)
- "कुमार का बैलेंस क्या है?" (Hindi)
- "What is Kumar's balance?" (English)

**Expected:**
- ✅ Informational response with balance
- ❌ NO action block (query only, not a transaction)

---

#### Test 3.6: Product Price Query (NO action block)
**Triggers:**
- "அரிசி விலை?" (Tamil)
- "चावल की कीमत?" (Hindi)
- "Rice price?" (English)

**Expected:**
- ✅ Returns price from catalog
- ❌ NO action block (query only, not a credit sale)
- ⚠️ CRITICAL: Must NOT create credit entry for product queries

---

### Test Category 4: Live Data Integration

#### Test 4.1: Customer Balance Query
**Setup:**
- Create customer "Kumar" with Rs.520 outstanding balance

**Test Input:**
```
"Kumar balance enna?"
```

**Expected:**
- Queries MySQL `customers` table
- Returns: "Kumar Rs.520 outstanding irukku"
- If balance > Rs.400, should warn: "High balance, suggest reminder"

---

#### Test 4.2: Product Catalog Query
**Setup:**
- Products in catalog:
  - Rice (அரிசி): Rs.45/kg, 100 kg stock
  - Sugar (சர்க்கரை): Rs.40/kg, 50 kg stock

**Test Input:**
```
"அரிசி எவ்வளவு இருக்கு?"
```

**Expected:**
- Queries MySQL `products` table
- Returns: "அரிசி Rs.45/kg விலை, 100 kg கடையில் கிடைக்கிறது"

---

#### Test 4.3: Multiple Customers Summary
**Test Input:**
```
"Who owes money?"
```

**Expected:**
- Queries all customers from MySQL
- Returns sorted list:
  - "Kumar: Rs.520 pending (highest)"
  - "Lakshmi: Rs.150 pending"
  - "Avinash: Rs.0 (cleared)"

---

### Test Category 5: Safety & Business Logic

#### Test 5.1: Credit Risk Warning
**Setup:**
- Customer "Kumar" has Rs.450 outstanding

**Test Input:**
```
"Kumar-la 2 kg rice add pannunga"
```

**Expected:**
- ✅ Emits ADD_PURCHASE action
- ⚠️ BUT also warns: "Kumar already owes Rs.450. Consider collecting payment first."

---

#### Test 5.2: Product Query Safety
**Test Input:**
```
"Rice price?"
```

**Expected:**
- ✅ Returns: "Rice is Rs.45/kg"
- ❌ MUST NOT emit action block
- ❌ MUST NOT create credit entry
- 🛡️ Safety check: Verify NO database INSERT occurred

---

#### Test 5.3: Ambiguous Intent Clarification
**Test Input:**
```
"Kumar rice" (incomplete command)
```

**Expected:**
- ❌ Should NOT guess
- ✅ Should ask: "Do you want to check rice price, or add rice to Kumar's account?"
- ⏸️ Wait for user clarification

---

## 🧰 Manual Testing Steps

### Step 1: Start Backend
```bash
cd apps/api
mvn spring-boot:run
```

**Verify:**
- ✅ Server starts on http://localhost:8080
- ✅ Health check: `curl http://localhost:8080/api/actuator/health`
- ✅ Expected: `{"status":"UP"}`

---

### Step 2: Test Backend API Directly

#### Test: Tamil Product Query
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "அரிசி விலை என்ன?",
    "language": "AUTO",
    "customers": [],
    "products": [
      {"name": "Rice", "sku": "RICE-001", "sellingPrice": "45.00", "nameTa": "அரிசி"}
    ]
  }'
```

**Expected Response:**
```json
{
  "answer": "அரிசி விலை Rs.45/kg",
  "detectedLanguage": "TAMIL",
  "live": true
}
```

---

#### Test: Tanglish Credit Sale
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Kumar account-la 2 kg arisi add pannunga",
    "language": "AUTO",
    "customerName": "Kumar",
    "outstandingBalance": "520",
    "customers": [
      {"name": "Kumar", "outstandingBalance": "520"}
    ],
    "products": [
      {"name": "Rice", "sku": "RICE-001", "sellingPrice": "45.00", "nameTa": "அரிசி"}
    ]
  }'
```

**Expected Response:**
```json
{
  "answer": "Kumar account-la 2 kg arisi add pannitaen. Total Rs.90. Outstanding Rs.610.\n\n```action\n{ \"intent\": \"ADD_PURCHASE\", \"customerName\": \"Kumar\", \"productAlias\": \"Rice\", \"quantity\": \"2 kg\" }\n```",
  "detectedLanguage": "TANGLISH",
  "live": true
}
```

**Verification:**
- ✅ Response in Tanglish
- ✅ Contains action block
- ✅ Correct product recognition (arisi → Rice)
- ✅ Correct customer name
- ✅ Correct quantity

---

### Step 3: Test Frontend Integration

#### 3.1: Start Frontend
```bash
cd apps/web
npm run dev
```

**Verify:**
- ✅ App loads on http://localhost:3000
- ✅ No console errors
- ✅ AI chat interface visible

---

#### 3.2: Test Voice Command
1. Click floating microphone button
2. Speak: "Kumar account-la 2 kg arisi add pannunga"
3. **Verify:**
   - ✅ Speech-to-text transcription appears
   - ✅ Language detected: TANGLISH
   - ✅ AI responds in Tanglish
   - ✅ Action executes: Kumar's account opens, 2 kg Rice added
   - ✅ Outstanding balance updates

---

#### 3.3: Test AI Chat
1. Type in chat: "அரிசி விலை?"
2. **Verify:**
   - ✅ AI detects Tamil
   - ✅ Responds in Tamil
   - ✅ Returns rice price from catalog
   - ✅ NO action block emitted (safe query)

---

#### 3.4: Test Action Execution
1. Type: "Open Kumar account"
2. **Verify:**
   - ✅ AI emits OPEN_CUSTOMER action
   - ✅ Frontend parses action block
   - ✅ Kumar's account opens automatically
   - ✅ UI switches to customer view

---

## 📊 Test Results Template

| Test ID | Category | Input | Expected | Actual | Status | Notes |
|---------|----------|-------|----------|--------|--------|-------|
| 1.1 | Language | "அரிசி விலை என்ன?" | Tamil response with price | | ⏳ | |
| 1.2 | Language | "Kumar account-la 2 kg arisi add pannunga" | Tanglish + action block | | ⏳ | |
| 2.1 | Product | "சர்க்கரை விலை?" | Recognizes சர்க்கரை = Sugar | | ⏳ | |
| 3.1 | Action | "Kumar account thirakka" | OPEN_CUSTOMER action | | ⏳ | |
| 5.2 | Safety | "Rice price?" | NO action block | | ⏳ | CRITICAL |

---

## ✅ Pass Criteria

The AI Assistant passes all tests if:

1. ✅ **8/8 languages detected correctly** (Tamil, Hindi, Telugu, Kannada, Malayalam, English, Tanglish, Hinglish)
2. ✅ **50+ product aliases recognized** (rice, sugar, oil, dal, milk, salt, etc.)
3. ✅ **6 action types emit correctly** (OPEN_CUSTOMER, ADD_PURCHASE, RECEIVE_PAYMENT, SEND_REMINDER, SHOW_REPORT, ASK_BALANCE)
4. ✅ **Live MySQL data used** (customer balances, product catalog)
5. ✅ **Product queries are SAFE** (no credit created for "price?" queries)
6. ✅ **Credit risk warnings work** (warns if balance > Rs.400)
7. ✅ **Response language matches input** (user speaks Tamil → AI responds Tamil)

---

## 🚨 Known Issues to Watch

1. **Hardcoded shopId** - Voice logging uses "demo-shop" instead of real shopId
2. **No Tanglish/Hinglish knowledge packs** - Falls back to closest language
3. **Next.js AI route** - Less capable than backend (needs upgrade)
4. **Large page.tsx** - 3,351 lines, could cause maintenance issues

---

## 📝 Test Execution Log

**Tester:** [Your Name]  
**Date:** 2026-07-12  
**Environment:** Local development (localhost)  
**Backend Version:** Commit `2c3048f`  
**Frontend Version:** Commit `2c3048f`  
**Database:** MySQL 8.0 with demo data

### Execution Notes:
```
[TIMESTAMP] Starting backend server...
[TIMESTAMP] Backend health check: OK
[TIMESTAMP] Starting frontend...
[TIMESTAMP] Frontend loaded: OK
[TIMESTAMP] Running Test 1.1...
[TIMESTAMP] Test 1.1 result: [PASS/FAIL]
...
```

---

**End of Test Plan**

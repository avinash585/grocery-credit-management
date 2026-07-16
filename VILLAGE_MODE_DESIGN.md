# Village Mode - Complete Design Specification

## Overview

**Village Mode** is a simplified, voice-first UI experience specifically designed for rural grocery shops and small retailers with minimal education or computer experience.

**Core Promise:** Every shop operation achievable in **1-2 taps** or by **speaking naturally**.

---

## Design Principles

### 1. Simplicity First
- Remove all complexity
- Show only essential actions
- No technical jargon
- Clear visual hierarchy

### 2. Voice-First Interaction
- Microphone always visible
- Natural language commands
- Voice confirmations
- Audio feedback

### 3. Picture-Based Navigation
- Product images, not text lists
- Icon-based actions
- Visual indicators
- Minimal reading required

### 4. High Accessibility
- Large touch targets (min 60px)
- High contrast colors
- Large readable fonts (18px+)
- Simple language

---

## Home Screen Design

### Layout

```
┌────────────────────────────────────────────────────────┐
│  🌾 GramMart AI                          🔔 🌐 🔊    │
│  🙏 Vanakkam, Abi!                                    │
│  Good Morning • Today is profitable 📈                │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   TODAY'S SUMMARY                     │
│                                                       │
│   💰 Sales          📒 Credit        💳 Payments    │
│   ₹12,540          ₹8,200            ₹4,200         │
│                                                       │
│   👥 Customers     📦 Low Stock      🔔 Reminders    │
│   45 served        3 items           5 pending       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  QUICK ACTIONS                        │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   🟢         │  │   💰         │                 │
│  │              │  │              │                 │
│  │ Give Credit  │  │   Receive    │                 │
│  │              │  │   Payment    │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   👤         │  │   🛒         │                 │
│  │              │  │              │                 │
│  │  Customers   │  │   Products   │                 │
│  │              │  │              │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   📊         │  │   📦         │                 │
│  │              │  │              │                 │
│  │   Reports    │  │  Inventory   │                 │
│  │              │  │              │                 │
│  └──────────────┘  └──────────────┘                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│           🎤 TAP TO SPEAK TO AI                      │
│                                                       │
│  Try saying:                                         │
│  • "Open Kumar account"                              │
│  • "Add 2 kg Rice"                                   │
│  • "Who owes money?"                                 │
└──────────────────────────────────────────────────────┘
```

### Design Specifications

**Touch Targets:**
- Minimum size: 80px × 80px
- Spacing: 16px between buttons
- Corner radius: 12px

**Colors:**
- Green (#10B981): Give Credit
- Blue (#3B82F6): Receive Payment
- Purple (#8B5CF6): Customers
- Orange (#F59E0B): Products
- Red (#EF4444): Reports
- Teal (#14B8A6): Inventory

**Typography:**
- Headings: 24px Bold
- Buttons: 20px Semibold
- Body: 18px Regular
- Numbers: 28px Bold

---

## Color-Coded Action System

### Consistent Color Scheme

| Color | Action | Screens | Buttons |
|-------|--------|---------|---------|
| 🟢 **Green** | Give Credit / Add Purchase | Credit screen, Product selection | "Add to Account" |
| 💙 **Blue** | Receive Payment / Collect Money | Payment screen, Customer accounts | "Record Payment" |
| 💜 **Purple** | Customer Management | Customer list, Search | "View Customer" |
| 🟠 **Orange** | Product Management | Product catalog, Search | "View Product" |
| 🔴 **Red** | Pending/Alerts | Overdue payments, Low stock | "Send Reminder" |
| 🟡 **Yellow** | Reports/Analytics | Dashboard, Charts | "View Report" |
| ⚫ **Gray** | Settings/Help | Settings screen, Help | "More Options" |

**Rule:** Once a color is assigned to an action, it NEVER changes across the app.

---

## Voice-First Experience

### Floating Microphone

**Always visible:** Bottom-right corner, 72px × 72px circular button

**States:**
- Idle: 🎤 White with green border
- Listening: 🎤 Pulsing red animation
- Processing: ⏳ Spinner
- Success: ✅ Green checkmark (500ms)
- Error: ❌ Red X (500ms)

### Voice Commands Coverage

**Account Operations:**
```
✓ "Open Kumar account"
✓ "Show Lakshmi balance"
✓ "Create new customer"
```

**Billing:**
```
✓ "Add 2 kg Rice to Kumar"
✓ "Kumar paid 500 rupees"
✓ "Generate bill"
```

**Products:**
```
✓ "Price of Milk"
✓ "Is Sugar available"
✓ "Show all products"
```

**Reports:**
```
✓ "Today's sales"
✓ "Who owes money"
✓ "Low stock items"
```

**Multilingual:**
```
✓ "குமார் கணக்கு திற" (Tamil)
✓ "कुमार को चावल दें" (Hindi)
✓ "kumar account తెరువు" (Telugu)
```

### Voice Feedback

**After every action:**
- Play confirmation sound (ding.mp3)
- Speak result in user's language
- Show visual confirmation

**Examples:**
```
User: "Add Rice to Kumar"
AI: 🔊 "Added 1 kg Rice to Kumar's account. Total ₹45."
Screen: ✅ Shows success animation
```

---

## Picture-Based Product Catalog

### Grid Layout

```
┌────────────────────────────────────────┐
│  🔍 Search Products... 🎤             │
└────────────────────────────────────────┘

┌───────────┐ ┌───────────┐ ┌───────────┐
│  [IMAGE]  │ │  [IMAGE]  │ │  [IMAGE]  │
│           │ │           │ │           │
│   Rice    │ │  Sugar    │ │   Milk    │
│  அரிசி    │ │ சர்க்கரை  │ │   பால்    │
│  ₹45/kg   │ │  ₹47/kg   │ │  ₹25/500ml│
│  🟢 150 kg │ │  🟢 50 kg  │ │  🔴 5 pcs  │
└───────────┘ └───────────┘ └───────────┘

┌───────────┐ ┌───────────┐ ┌───────────┐
│  [IMAGE]  │ │  [IMAGE]  │ │  [IMAGE]  │
│   Dal     │ │   Oil     │ │  Biscuits │
│  பருப்பு   │ │ எண்ணெய்   │ │ பிஸ்கட்   │
│  ₹120/kg  │ │  ₹189/L   │ │  ₹10/pack │
│  🟡 10 kg  │ │  🟢 20 L   │ │  🟢 100   │
└───────────┘ └───────────┘ └───────────┘
```

### Product Card Design

**Each card shows:**
1. **Product Image** (120px × 120px)
2. **English Name** (18px Bold)
3. **Regional Name** (16px Regular)
4. **Price** (22px Bold) with unit
5. **Stock Indicator**:
   - 🟢 Green: Stock > 20
   - 🟡 Yellow: Stock 5-20
   - 🔴 Red: Stock < 5

**Tap Action:** Opens product details with large "Add to Cart" button

---

## Assisted Workflow: Give Credit

### Step-by-Step Guidance

```
STEP 1: SELECT CUSTOMER
┌──────────────────────────────────────┐
│  Step 1 of 4: Choose Customer       │
│  ═══════════════════════             │
└──────────────────────────────────────┘

[Customer search or voice: "Open Kumar"]

                ↓

STEP 2: SELECT PRODUCT
┌──────────────────────────────────────┐
│  Step 2 of 4: Choose Product        │
│  ════════════════════════════        │
└──────────────────────────────────────┘

[Product grid or voice: "Add Rice"]

                ↓

STEP 3: ENTER QUANTITY
┌──────────────────────────────────────┐
│  Step 3 of 4: How Much?             │
│  ══════════════════════════════      │
└──────────────────────────────────────┘

[Number pad: 2 kg] or voice: "2 kg"

                ↓

STEP 4: CONFIRM
┌──────────────────────────────────────┐
│  Step 4 of 4: Review & Confirm      │
│  ════════════════════════════════════│
└──────────────────────────────────────┘

Customer: Kumar Stores
Product: Ponni Rice 2 kg
Price: ₹45 × 2 = ₹90

[🟢 CONFIRM]  [Cancel]

                ↓

SUCCESS
✅ Credit Added Successfully!
🔔 WhatsApp receipt sent to Kumar
```

### Progress Indicator

**Always show current step:**
- Visual: Progress bar (25%, 50%, 75%, 100%)
- Text: "Step 2 of 4"
- Icons: ① ② ③ ④ with current highlighted

---

## Help Mode

### Context-Sensitive Help

**Every screen has:**
- "?" button in top-right corner
- Tap to hear explanation in user's language

**Example:**

**Screen:** Product Catalog  
**Help:**  
🔊 "இந்த திரையில் பொருட்களை தேர்வு செய்யலாம். படத்தை தொட்டு தேர்வு செய்யவும்."  
_("On this screen you can select products. Tap the image to select.")_

### Video Tutorials

**Built-in tutorials:**
- How to give credit (2 min)
- How to receive payment (1.5 min)
- How to check reports (1 min)
- How to use voice commands (2 min)

**Regional languages:** Tamil, Hindi, Telugu, Kannada, Malayalam

---

## Offline Mode

### Offline Indicator

```
┌────────────────────────────────────────┐
│  🔴 Offline Mode                      │
│  Your data is being saved locally.    │
│  Will sync when internet returns.     │
└────────────────────────────────────────┘
```

### Offline Capabilities

**Works without internet:**
✅ Give credit
✅ Receive payment
✅ View customer list
✅ View product catalog
✅ Search customers/products
✅ View reports (cached data)

**Requires internet:**
❌ WhatsApp notifications (queued)
❌ Live price updates
❌ Customer creation (queued)
❌ Data backup

### Sync Status

**Show sync progress:**
```
🔄 Syncing... (5 of 12 transactions)
✅ Synced (All data backed up)
⚠️ Sync pending (8 transactions waiting)
```

---

## Accessibility Features

### 1. Large Font Mode

**Toggle:** Settings > Accessibility > Large Fonts

**Changes:**
- Body text: 18px → 22px
- Buttons: 20px → 24px
- Numbers: 28px → 32px
- Headings: 24px → 30px

### 2. High Contrast Mode

**Toggle:** Settings > Accessibility > High Contrast

**Changes:**
- Background: White → #000000
- Text: Gray → #FFFFFF
- Buttons: Brighter colors with thick borders

### 3. Voice Guidance

**Toggle:** Settings > Accessibility > Voice Guidance

**Features:**
- Reads every button label when tapped
- Confirms every action verbally
- Announces screen changes
- Speaks error messages

### 4. Touch Assistance

**Features:**
- Larger touch targets (100px minimum)
- Haptic feedback on touch
- Long-press help on any button
- Accidental touch prevention (double-tap to confirm)

---

## Smart Reminders

### Daily Reminders

**Morning (9 AM):**
```
🌞 Good Morning!
📊 Yesterday's sales: ₹15,200
💡 3 customers have pending payments
```

**Afternoon (2 PM):**
```
☀️ Good Afternoon!
📦 Rice stock is running low
💡 Consider reordering today
```

**Evening (6 PM):**
```
🌇 Good Evening!
💰 Today's collections: ₹5,400
💡 2 customers have overdue payments
```

### Action Reminders

**Based on data:**
```
🔔 Lakshmi's payment is 15 days overdue
   👉 Send reminder now?

🔔 You haven't backed up data today
   👉 Backup now?

🔔 3 products below minimum stock
   👉 View restock list?
```

---

## Implementation Files

### New Components

```
apps/web/components/village-mode/
├── VillageHomeScreen.tsx         (Main dashboard)
├── LargeActionButton.tsx         (Big colorful buttons)
├── ProductGrid.tsx               (Picture-based catalog)
├── StepIndicator.tsx             (Progress bar)
├── VoiceFeedback.tsx             (Audio player)
├── OfflineIndicator.tsx          (Sync status)
├── HelpButton.tsx                (Context help)
└── SmartReminder.tsx             (Notification)
```

### Utilities

```
apps/web/lib/village-mode/
├── text-to-speech.ts             (Voice synthesis)
├── offline-queue.ts              (Sync management)
├── accessibility.ts              (A11y helpers)
└── reminders.ts                  (Notification logic)
```

---

## Success Metrics

**Target Metrics:**
- First-time setup: < 5 minutes
- Average task completion: < 30 seconds
- User satisfaction: 9/10+
- Error rate: < 2%
- Voice command accuracy: 95%+

---

## Next Steps

1. Create Village Mode UI components
2. Implement voice synthesis
3. Build offline sync system
4. Add accessibility features
5. Create video tutorials
6. User testing with 10 rural shop owners

**Estimated Effort:** 4-5 weeks

---

Ready to implement Village Mode?

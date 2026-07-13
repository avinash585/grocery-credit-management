# Complete AI Assistant Test Plan

**Test Date**: After Vercel deployment completes  
**Purpose**: Verify AI assistant fetches data and shows responses for all voice commands  
**Expected Behavior**: AI should show what it's doing, NOT just "Ready"

---

## Pre-Test Checklist

- [ ] Vercel deployment completed successfully
- [ ] Web app loaded in browser
- [ ] Logged in to GramMart (or in demo mode)
- [ ] Microphone permissions granted
- [ ] At least 3 demo customers visible (Avinash A, Kumar Stores, Lakshmi)
- [ ] Product catalog has Rice, Sugar, Oil, Dal, etc.

---

## Test Suite 1: Basic Voice Commands

### Test 1.1: Open Customer Account
**Voice Command**: "open Avinash account"

**Expected AI Response**:
```
✓ AI shows: "Opening Avinash's account..." or similar
✓ Account panel opens showing Avinash A
✓ Balance displayed (Rs.0.00 or current balance)
✓ Status updated with confirmation
```

**What Would Be WRONG**:
```
✗ AI just shows "Ready"
✗ No account opens
✗ No response from AI
```

---

### Test 1.2: Check Customer Balance
**Voice Command**: "what is Lakshmi's balance"

**Expected AI Response**:
```
✓ AI shows: "Lakshmi's balance: Rs.XX.XX pending"
✓ Opens Lakshmi's account
✓ Shows actual balance from data
```

**What Would Be WRONG**:
```
✗ Shows "Ready" instead of balance
✗ Generic response without actual amount
```

---

## Test Suite 2: Compound Commands (The Main Issue)

### Test 2.1: Open Account + Add Product
**Voice Command**: "open Avinash account and add 1 kilogram of sugar"

**Expected AI Response** (THIS IS THE KEY TEST):
```
✓ AI shows: "Adding 1kg sugar to Avinash's account..."
✓ Account opens for Avinash A
✓ Product "Sugar" is identified from catalog
✓ Price shown: Rs.47.00 (or current price)
✓ Credit bill created
✓ Status: "✅ 1 sugar added to Avinash's account! (₹47.00)"
✓ Balance increases by Rs.47.00
```

**What Would Be WRONG (OLD BEHAVIOR)**:
```
✗ AI shows "Ready" or "Done" with no details
✗ Command executes but no AI explanation
✗ No indication of what product or customer
```

---

### Test 2.2: Open Account + Add Different Product
**Voice Command**: "open Kumar account and add 2 kg of rice"

**Expected AI Response**:
```
✓ AI explains: "Adding 2kg rice to Kumar Stores' account..."
✓ Account: Kumar Stores
✓ Product: Rice @ Rs.45.00/kg (or current price)
✓ Total: Rs.90.00 (2 × 45)
✓ Confirmation with actual amounts
```

---

## Test Suite 3: Payment Commands

### Test 3.1: Record Payment
**Voice Command**: "Kumar paid 500 rupees"

**Expected AI Response**:
```
✓ AI shows: "Recording ₹500 payment from Kumar..."
✓ Finds Kumar Stores in customer list
✓ Payment recorded
✓ Balance reduces by Rs.500
✓ Confirmation: "✅ ₹500 payment received from Kumar Stores!"
```

---

### Test 3.2: Payment for Current Customer
**Prerequisites**: Have Avinash account open

**Voice Command**: "received payment of 100 rupees"

**Expected AI Response**:
```
✓ AI shows: "Recording ₹100 payment from Avinash..."
✓ Uses currently open customer
✓ Payment recorded
✓ Confirmation shown
```

---

## Test Suite 4: Product Queries (Information Only)

### Test 4.1: Price Check
**Voice Command**: "what is the price of rice"

**Expected AI Response**:
```
✓ AI shows: "Rice price is **Rs.45.00**. I have not added it to any customer account."
✓ NO account opened
✓ NO product added
✓ Information only response
```

**Important**: Should NOT create a credit sale

---

### Test 4.2: Product Availability
**Voice Command**: "do you have cooking oil"

**Expected AI Response**:
```
✓ AI shows product information
✓ Lists available oil types (Groundnut, Sunflower, etc.)
✓ Shows prices
✓ No action taken
```

---

## Test Suite 5: Reversal Commands

### Test 5.1: Undo Transaction
**Prerequisites**: Just added a product to a customer

**Voice Command**: "undo last transaction"

**Expected AI Response**:
```
✓ AI shows: "Undoing last transaction for [Customer]..."
✓ Currently shows info message about backend integration
✓ In future: Will actually reverse the transaction
```

---

### Test 5.2: Reverse Payment
**Voice Command**: "reverse the payment"

**Expected AI Response**:
```
✓ AI shows: "Reversing payment for [Customer]..."
✓ Currently shows info message
✓ In future: Will actually reverse payment
```

---

### Test 5.3: Remove Specific Product
**Voice Command**: "remove sugar from Avinash account"

**Expected AI Response**:
```
✓ AI shows: "Removing sugar from Avinash..."
✓ Identifies customer: Avinash
✓ Identifies product: sugar
✓ Currently shows info message
```

---

## Test Suite 6: Business Questions

### Test 6.1: Customer Debts
**Voice Command**: "who owes me money"

**Expected AI Response**:
```
✓ AI analyzes all customers
✓ Lists customers with pending balance
✓ Shows amounts
✓ May suggest sending reminders
```

---

### Test 6.2: Restock Suggestions
**Voice Command**: "what should I restock today"

**Expected AI Response**:
```
✓ AI analyzes product catalog
✓ Suggests 2-3 specific items
✓ Reasons based on season, demand, stock levels
✓ Example: "Stock up on Sunflower Oil, wedding season is starting"
```

---

## Test Suite 7: Error Handling

### Test 7.1: Customer Not Found
**Voice Command**: "open Rajesh account"

**Expected AI Response**:
```
✓ AI shows: "❌ Customer 'Rajesh' not found. Please check the name."
✓ OR suggests similar customer names
✓ Helpful error message
```

---

### Test 7.2: Product Not Found
**Voice Command**: "add laptop to Avinash account"

**Expected AI Response**:
```
✓ AI shows: "❌ Product 'laptop' not found in catalog"
✓ May suggest creating custom product
✓ Or suggest similar products
```

---

### Test 7.3: Unclear Command
**Voice Command**: "something something sugar"

**Expected AI Response**:
```
✓ AI shows: "I understood you mentioned sugar, but I'm not sure what action you want. Did you want to check the price, add it to an account, or something else?"
✓ Asks for clarification
✓ Doesn't guess incorrectly
```

---

## Test Suite 8: Edge Cases

### Test 8.1: Multiple Products in One Command
**Voice Command**: "add 1kg rice and 2kg sugar to Avinash account"

**Expected AI Response**:
```
✓ AI processes first product (rice)
✓ Shows what it's doing
✓ May need second command for sugar
✓ Or creates cart with both items
```

---

### Test 8.2: Voice Recognition Issues
**Voice Command**: (unclear speech) "open... uh... Avi... nash"

**Expected AI Response**:
```
✓ AI tries to match "Avinash" 
✓ Shows best match
✓ Or asks for confirmation: "Did you mean Avinash A?"
```

---

## Success Criteria

### PASS Criteria
- [ ] AI shows meaningful responses (not just "Ready" or "Done")
- [ ] AI fetches and displays actual customer names
- [ ] AI fetches and displays actual product names and prices
- [ ] AI shows what action it's taking BEFORE execution
- [ ] AI confirms what action was completed AFTER execution
- [ ] Compound commands work smoothly
- [ ] Data-driven responses (uses actual balances, prices)

### FAIL Criteria
- [ ] AI shows "Ready" for action commands
- [ ] AI doesn't explain what it's doing
- [ ] Commands execute silently without feedback
- [ ] Generic responses without specific data
- [ ] Customer/product names not recognized

---

## Critical Test (Must Pass)

**THE MAIN TEST FROM USER'S REPORT**:

**Voice Command**: "open Avinash account and add 1kg of sugar"

**Must See**:
1. AI explains: "Adding 1kg sugar to Avinash's account..."
2. Shows customer name: "Avinash A"
3. Shows product: "Sugar"
4. Shows price: "Rs.47.00" (or current price)
5. Shows confirmation: "✅ 1 sugar added to Avinash's account! (₹47.00)"
6. Balance updates correctly

**Must NOT See**:
- "Ready" as the only response
- Silent execution without explanation
- Generic messages without data

---

## Where to Look for AI Responses

### Desktop Layout
- **Right Sidebar**: AIAssistant component with chat bubbles
- Look for the section with robot icon 🤖
- Shows question bubbles and answer bubbles

### Mobile Layout
- **Bottom Section**: AI assistant appears below main content
- Scroll to see AI responses

### Status Bar
- Top or bottom of screen
- Shows execution status and confirmations

---

## Troubleshooting

### If AI Still Shows "Ready"

1. **Check Vercel Deployment**:
   - Go to Vercel dashboard
   - Verify deployment of commit `9956e1e` completed
   - Check build logs for errors

2. **Clear Cache**:
   ```
   - Press Ctrl+Shift+Delete (Windows)
   - Clear cached images and files
   - Close and reopen browser
   ```

3. **Try Incognito/Private Mode**:
   - Eliminates cache issues
   - Fresh session

4. **Check Console**:
   - Press F12
   - Look for JavaScript errors
   - Check Network tab for API calls to `/api/ai/chat`

5. **Verify API Key**:
   - Ensure `GEMINI_API_KEY` is set in Vercel environment variables
   - AI needs API key to generate responses

---

## Reporting Issues

If tests fail, please provide:

1. **Exact voice command** you used
2. **What you saw** (screenshot if possible)
3. **What you expected** to see
4. **Browser console errors** (F12 → Console tab)
5. **Which test number** from this document

Example:
```
Test: 2.1 (Open Account + Add Product)
Command: "open Avinash account and add 1kg sugar"
Saw: "Ready"
Expected: AI explanation of action
Console: [paste any errors]
```

---

## Next Steps After Testing

### If All Tests Pass ✅
- Mark issue as resolved
- Document any observations
- Start using the feature normally

### If Tests Fail ❌
- Document which tests failed
- Provide error details
- I'll investigate and fix

---

**Test Plan Created**: July 13, 2026  
**Version**: 1.0  
**Related Fix**: Commit 9956e1e  
**Documentation**: AI_ASSISTANT_DATA_FETCHING_FIX.md

**Ready to test after Vercel deployment completes!** 🚀

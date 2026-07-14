# AI Assistant Troubleshooting Guide

**Date**: July 13, 2026  
**For Issues**: Actions not executing, Business queries not working

---

## ✅ Fixed Issues

### 1. Business Query Buttons Not Clickable
**Problem**: "Who owes the most money?" and "What should I restock today?" were just text, not buttons

**Fix**: Made them clickable with hover effects
- Now when you hover: Background turns lighter green
- When you click: AI processes the question
- Keyboard accessible: Press Enter or Space

**How to Test**:
1. Look at the AI Assistant panel (right sidebar)
2. See two green bubbles with questions
3. Hover over them - they should highlight
4. Click one - AI should respond with actual data

---

### 2. Action Execution Debugging
**Problem**: "It doesn't add the amount" - AI says it's doing something but nothing happens

**Fix**: Added comprehensive logging to see exactly what's happening
- Every action now logs to console
- Can see if action is detected
- Can see if action executes successfully
- Can see any errors

**How to Debug**:
1. Open browser console (Press F12)
2. Go to Console tab
3. Say command: "open Avinash account and add 1kg sugar"
4. Watch for these logs:

```
🎯 AI action detected: {intent: "ADD_PURCHASE", customerName: "Avinash", ...}
⏳ Adding 1 sugar → Avinash's account…
✅ AI action executed successfully
✅ 1 sugar added to Avinash's account! (₹47.00)
```

---

## 🔍 Debugging Steps

### Step 1: Check If Action Is Detected

**Open Console** (F12) and look for:

✅ **GOOD**:
```
🎯 AI action detected: {intent: "ADD_PURCHASE", ...}
```

❌ **BAD** (Action not detected):
```
🔄 No action block from AI, trying fallback parsing
ℹ️ No fallback action detected
```

**If action NOT detected**:
- AI didn't generate action block
- Check if command was clear enough
- Try: "add 1kg sugar to Avinash account" (very explicit)

---

### Step 2: Check If Action Executes

**Look for**:

✅ **GOOD**:
```
✅ AI action executed successfully
✅ 1 sugar added to Avinash's account! (₹47.00)
```

❌ **BAD** (Execution failed):
```
❌ Failed to execute AI action: Error: ...
```

**If execution FAILED**:
- Check error message details
- Might be backend API issue
- Might be demo mode vs live mode issue
- Check if customer/product exists

---

### Step 3: Check Customer Balance Update

**After action executes**:

1. Look at customer's outstanding balance
2. Should increase by product price
3. Example: Was Rs.0.00 → Now Rs.47.00 (after adding 1kg sugar)

**If balance NOT updated**:
- Check console for errors
- Check if `applyResolvedCustomerBalance` function ran
- May need to refresh customer list

---

## 🧪 Test Cases

### Test 1: Click Business Query Button
**Action**: Click "Who owes the most money?"

**Expected Console Logs**:
```
(no specific logs for this, just AI response)
```

**Expected Result**:
```
📊 Top customers with pending balance:
- **Kumar Stores**: **Rs.420.00**
- **Lakshmi**: **Rs.250.00**
```

**If NOT Working**:
- Button might not be clickable
- Check if hover effect appears
- Try clicking again
- Check if onClick is attached

---

### Test 2: Add Product Command
**Action**: Say "open Avinash account and add 1kg of sugar"

**Expected Console Logs**:
```
1. 🎯 AI action detected: {intent: "ADD_PURCHASE", customerName: "Avinash", productAlias: "sugar", quantity: "1"}
2. ⏳ Adding 1 sugar → Avinash's account…
3. ✅ AI action executed successfully
4. ✅ 1 sugar added to Avinash's account! (₹47.00)
```

**Expected Balance Change**:
- Before: Rs.0.00
- After: Rs.47.00

**If NOT Working**:
- Check console logs for which step failed
- If step 1 failed: AI didn't detect action
- If step 2 failed: Command started but didn't complete
- If step 3 failed: See error message

---

### Test 3: Restock Query
**Action**: Click "What should I restock today?"

**Expected Response**:
```
📦 Restocking suggestions based on your catalog:

1. **Sugar** - Rs.47/kg (high demand during festival season)
2. **Sunflower Oil** - Rs.189/L (wedding season demand)
3. **Toor Dal** - Rs.123/kg (daily staple, always moves fast)
```

**If NOT Working**:
- Check if button is clickable
- Look for network request to /api/ai/chat
- Check if AI has product data

---

## ❌ Common Errors and Solutions

### Error 1: "Customer not found"

**Console**:
```
❌ Customer "Avinash" not found. Please check the name.
```

**Solution**:
- Check spelling of customer name
- Check if customer exists in directory
- Try using exact name: "Avinash A" instead of "Avinash"

---

### Error 2: "Product not found"

**Console**:
```
❌ Product "suger" not found in catalog.
```

**Solution**:
- Check spelling: "sugar" not "suger"
- Check if product exists in catalog
- Try full product name: "Sugar" or SKU: "SUG-001"

---

### Error 3: Action detected but not executed

**Console**:
```
🎯 AI action detected: {...}
❌ Failed to execute AI action: TypeError: ...
```

**Solution**:
- Check error details in console
- Might be JavaScript error
- Might be missing data
- Try simpler command first

---

### Error 4: No action block from AI

**Console**:
```
🔄 No action block from AI, trying fallback parsing
ℹ️ No fallback action detected
```

**Solution**:
- AI didn't understand command as actionable
- Make command more explicit
- Use action verbs: "add", "put", "record", "receive"
- Example: "add 1kg sugar to Avinash" (clear action verb)

---

### Error 5: Backend API error

**Console**:
```
❌ Failed to execute AI action: Error: Failed to fetch
```

**Solution**:
- Backend might be down
- Check if API endpoint is accessible
- App should fall back to demo mode
- Check network tab (F12 → Network) for failed requests

---

## 📋 Quick Checklist

Before reporting an issue, check:

- [ ] Opened browser console (F12)
- [ ] Tried clicking business query button
- [ ] Saw hover effect on button
- [ ] Checked console logs for action detection
- [ ] Checked console logs for execution
- [ ] Checked if balance updated
- [ ] Tried simpler command
- [ ] Cleared cache and tried again
- [ ] Tried in incognito mode
- [ ] Checked network tab for API calls

---

## 🐛 Reporting Issues

If still not working, provide:

### 1. What You Did
```
Example: Clicked "Who owes the most money?" button
```

### 2. What You Expected
```
Example: Should show list of customers with balances
```

### 3. What Happened
```
Example: Nothing happened, button didn't respond
```

### 4. Console Logs
```
Copy all logs from console (F12 → Console)
Look for:
- 🎯 Action detected logs
- ✅ Success logs
- ❌ Error logs
- ⚠️ Warning logs
```

### 5. Network Requests
```
F12 → Network → Look for /api/ai/chat
- Status: 200? 500? Failed?
- Response: What did AI return?
- Request: What was sent?
```

### 6. Screenshot
- Include full browser window
- Show AI assistant panel
- Show console if errors visible

---

## 🔧 Advanced Debugging

### Check AI Response Raw Data

1. F12 → Network tab
2. Say a command
3. Look for request to `/api/ai/chat`
4. Click on it
5. Go to "Response" tab
6. See what AI actually returned

**Should see**:
```json
{
  "answer": "Adding 1kg sugar to **Avinash's** account...\n```action\n{\"intent\":\"ADD_PURCHASE\",\"customerName\":\"Avinash\",\"productAlias\":\"sugar\",\"quantity\":\"1\"}\n```",
  "live": true
}
```

**Check for**:
- Does response have ```action block?
- Is JSON valid inside action block?
- Is intent correct?

---

### Check If onRunCommand Receives Action

Add temporary log in console:

1. Open DevTools console
2. Paste this:
```javascript
window.originalOnRunCommand = true;
```

3. Check if `onRunCommand` function is called
4. See parameters passed to it

---

### Check Customer State

After command, check if customer state updated:

1. Open React DevTools (if installed)
2. Find RuralRetailOS component
3. Look at `customers` state
4. Check if selected customer balance changed

---

## 📚 Log Symbols Reference

| Symbol | Meaning | Severity |
|--------|---------|----------|
| 🎯 | Action detected | Info |
| ✅ | Success | Good |
| ❌ | Error | Bad |
| ⚠️ | Warning | Caution |
| 🔄 | Fallback attempt | Info |
| ℹ️ | Information | Info |
| 📦 | Product action | Info |
| 💰 | Payment action | Info |
| 👤 | Customer action | Info |

---

## 🚀 Next Steps

### If Clicking Works But No Action
- **Issue**: Buttons clickable but AI doesn't execute
- **Check**: Console logs for execution errors
- **Solution**: Look at error message, might be backend issue

### If Clicking Doesn't Work
- **Issue**: Buttons not responding to clicks
- **Check**: Hover effect appears?
- **Solution**: Clear cache, refresh page, try again

### If Everything Works
- ✅ Great! Use the app normally
- 📊 Business queries should respond
- 📦 Actions should execute
- 💰 Balances should update

---

**Created**: July 13, 2026  
**Updated**: After fix 937722e  
**Status**: Ready for testing

**Need more help?** Check console logs and report them!

# ⚡ Quick Reference Card - GramMart AI

**For: Testing Premium UI**  
**Date: December 2024**

---

## 🚀 ONE COMMAND TO START

```bash
cd apps/web && npm run dev
```

Then open: **http://localhost:3000/premium**

---

## 🎨 What You'll See

### **🏠 Dashboard (Default View)**
- Greeting: "🌞 Good Morning, Abi Stores"
- 4 Metrics: Sales, Credit, Payments, Pending
- AI Insights: Green gradient section
- Quick Suggestions: Clickable chips

### **🛒 Billing (Click "Billing" in sidebar)**
- Left Panel: Select customer
- Center: Product grid
- Right: Cart summary
- Actions: Credit (yellow) / Cash (green)

### **✨ AI Assistant (Click green button bottom-right)**
- Floating panel
- Voice/Chat toggle
- Quick suggestions
- Message history

---

## 🎯 Test These Features

- [ ] Click sidebar items → page changes
- [ ] Hover cards → lift effect
- [ ] Click AI button → panel opens
- [ ] Select customer in billing
- [ ] Click products to add
- [ ] View cart total
- [ ] Try language selector
- [ ] Collapse/expand sidebar

---

## 🎨 Design Tokens

| Element | Value |
|---------|-------|
| Background | #F8F6F1 (warm cream) |
| Sidebar | #103D2C (dark green) |
| Primary | #1B5E20 (forest green) |
| Accent | #D97706 (amber) |
| Radius | 22px (rounded) |
| Font | Poppins |

---

## 📁 Key Files

```
apps/web/components/premium/
├── dashboard/ai-command-center.tsx
├── billing/premium-billing.tsx
├── layout/premium-sidebar.tsx
├── layout/premium-header.tsx
└── ai/floating-ai-assistant.tsx
```

---

## 🐛 If Something Breaks

1. **Restart server:** Ctrl+C, then `npm run dev`
2. **Clear cache:** Ctrl+Shift+R in browser
3. **Check console:** F12 → Console tab
4. **Verify URL:** http://localhost:3000/premium

---

## ✅ Success Checklist

Your UI is working if you see:
- [x] Cream background (not white!)
- [x] Dark green sidebar
- [x] Rounded corners everywhere
- [x] Smooth animations
- [x] Poppins font
- [x] Greeting with emoji
- [x] Floating green AI button

---

## 📊 Status

| Component | Status |
|-----------|--------|
| Dashboard | ✅ Done |
| Billing | ✅ Done |
| Sidebar | ✅ Done |
| Header | ✅ Done |
| AI Assistant | ✅ Done |
| Customers | ⏳ Next |
| Products | ⏳ Next |

---

## 🎯 Your Task

1. **Run:** `cd apps/web && npm run dev`
2. **Visit:** http://localhost:3000/premium
3. **Explore:** Click everything!
4. **Report:** What works? What doesn't?

---

## 💬 Feedback Template

After testing, tell me:

1. **Visual:** Looks good? (Yes/No/Almost)
2. **Performance:** Smooth? (Yes/No)
3. **Features:** What's missing?
4. **Bugs:** List any issues
5. **Next:** What to build next?

---

## 🎉 You're Ready!

**Command:** `cd apps/web && npm run dev`  
**URL:** http://localhost:3000/premium  
**Enjoy!** 🚀✨

---

**Need Help?** Read `WHAT_TO_DO_NOW.md` for detailed guide.

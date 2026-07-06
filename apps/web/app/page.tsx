"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CircleCheck,
  Coins,
  CreditCard,
  IndianRupee,
  Languages,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Mic,
  PackageSearch,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Volume2,
  type LucideIcon,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  WifiOff
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FloatingMic } from "@/components/floating-mic";
import {
  Customer,
  Product,
  chatWithAi,
  createCreditBill,
  createCustomer,
  getToken,
  login,
  receivePayment,
  registerShop,
  searchCustomers,
  searchProducts,
  parseVoiceCommand
} from "@/lib/api";
import { Language, t } from "@/lib/i18n";
import { readQueue, useNetworkStatus, syncOfflineQueue } from "@/lib/offline";

const queryClient = new QueryClient();
type Task = "credit" | "payment" | "products" | "ai";
type View = "admin" | "customers" | "billing" | "products" | "ai";

const starterCustomers: Customer[] = [
  { id: "demo-avina", name: "Avinash A", phone: "9876543210", preferredLanguage: "ENGLISH", outstandingBalance: "0.00" },
  { id: "demo-kumar", name: "Kumar Stores", phone: "9000011111", preferredLanguage: "ENGLISH", outstandingBalance: "0.00" },
  { id: "demo-lakshmi", name: "Lakshmi", phone: "9000022222", preferredLanguage: "TAMIL", outstandingBalance: "0.00" }
];

const starterProducts: Product[] = [
  { id: "demo-rice", sku: "RICE-001", name: "Sona Masoori Rice", sellingPrice: "58.00" },
  { id: "demo-sugar", sku: "SUGAR-001", name: "Sugar 1 kg", sellingPrice: "46.00" },
  { id: "demo-oil", sku: "OIL-001", name: "Sunflower Oil 1 L", sellingPrice: "135.00" },
  { id: "demo-dal", sku: "DAL-001", name: "Toor Dal 1 kg", sellingPrice: "128.00" }
];

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <RuralRetailOS />
    </QueryClientProvider>
  );
}

function RuralRetailOS() {
  const [language, setLanguage] = useState<Language>("ENGLISH");
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
  const [demoMode, setDemoMode] = useState(() => !Boolean(getToken()));
  const [view, setView] = useState<View>("admin");
  const [customers, setCustomers] = useState<Customer[]>(starterCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>(starterProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTask, setActiveTask] = useState<Task>("credit");
  const [voiceQuantity, setVoiceQuantity] = useState("1");
  const [voiceAmount, setVoiceAmount] = useState("");
  const [todaySalesVal, setTodaySalesVal] = useState(0);
  const [todayCreditVal, setTodayCreditVal] = useState(0);
  const [todayPaymentsVal, setTodayPaymentsVal] = useState(0);
  const [pendingVoiceCommand, setPendingVoiceCommand] = useState<{
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  } | null>(null);
  const [aiQueryOverride, setAiQueryOverride] = useState("");
  const [merchantUpiId, setMerchantUpiId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("grammart:merchant-upi-id") ?? "grammart@ybl";
    }
    return "grammart@ybl";
  });

  const handleUpdateUpiId = (id: string) => {
    setMerchantUpiId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("grammart:merchant-upi-id", id);
    }
  };
  const online = useNetworkStatus();
  const copy = useMemo(() => t(language), [language]);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      readQueue()
        .then(q => setQueueSize(q.length))
        .catch(() => setQueueSize(0));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("offline-queue-changed", updateCount);
    }
    updateCount();
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline-queue-changed", updateCount);
      }
    };
  }, []);

  useEffect(() => {
    if (online) {
      syncOfflineQueue()
        .then((results) => {
          if (results && results.length > 0) {
            setStatus(`Offline queue synced successfully: ${results.length} action(s) uploaded.`);
            if (!demoMode && getToken()) {
              searchCustomers("")
                .then((res) => {
                  if (res) setCustomers(res);
                })
                .catch((e) => console.error("Refresh directory failed:", e));
            }
          }
        })
        .catch((err) => {
          setStatus(`Failed to upload offline queue: ${err.message}`);
        });
    }
  }, [online, demoMode]);

  function requireSession() {
    if (!getToken() && !demoMode) {
      setHasToken(false);
      setStatus("Connect your shop first, or use demo admin mode from the Admin panel.");
      return false;
    }
    return true;
  }

  function requireCustomer() {
    if (!selectedCustomer) {
      setStatus("Open or create a customer account first.");
      return false;
    }
    return true;
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Connecting shop...");
    try {
      const data = new FormData(event.currentTarget);
      const phone = String(data.get("phone") ?? "").trim();
      const password = String(data.get("password") ?? "");
      const shopName = String(data.get("shopName") ?? "").trim();
      if (shopName) {
        await registerShop({
          shopName,
          ownerName: String(data.get("ownerName") ?? "Owner").trim() || "Owner",
          phone,
          password,
          preferredLanguage: language
        });
        setStatus("Shop connected. You can open a customer account now.");
      } else {
        await login(phone, password);
        setStatus("Logged in. Customer accounts are ready.");
      }
      setHasToken(true);
      setDemoMode(false);
      setView("customers");
    } catch (error) {
      setDemoMode(true);
      setHasToken(true);
      setView("admin");
      setStatus(error instanceof Error ? `${error.message} Demo admin workspace is open now.` : "Demo admin workspace is open now.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCustomerSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Finding customers...");
    const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
    if (demoMode) {
      const result = starterCustomers.filter((customer) => `${customer.name} ${customer.phone ?? ""}`.toLowerCase().includes(query));
      setCustomers(result.length ? result : starterCustomers);
      setStatus(result.length ? `${result.length} demo customer account(s) found.` : "Showing all demo customer accounts.");
      setBusy(false);
      return;
    }
    try {
      const result = (await searchCustomers(query)) ?? [];
      setCustomers(result);
      setStatus(result.length ? `${result.length} customer account(s) found` : "No customer found. Create one below.");
    } catch (error) {
      const result = starterCustomers.filter((customer) => `${customer.name} ${customer.phone ?? ""}`.toLowerCase().includes(query));
      setCustomers(result.length ? result : starterCustomers);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Showing demo customer directory.` : "Showing demo customer directory.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Creating customer account...");
    const data = new FormData(event.currentTarget);
    if (demoMode) {
      const customer: Customer = {
        id: `local-${Date.now()}`,
        name: String(data.get("name") ?? "Walk-in customer").trim() || "Walk-in customer",
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language,
        outstandingBalance: "0.00"
      };
      setSelectedCustomer(customer);
      setCustomers((existing) => [customer, ...existing]);
      setView("billing");
      setStatus(`${customer.name}'s account is open in demo workspace.`);
      setBusy(false);
      return;
    }
    try {
      const customer = await createCustomer({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language
      });
      if (customer) {
        setSelectedCustomer(customer);
        setCustomers((existing) => [customer, ...existing.filter((item) => item.id !== customer.id)]);
        setStatus(`${customer.name}'s account is open.`);
        setView("billing");
      }
    } catch (error) {
      const data = new FormData(event.currentTarget);
      const customer: Customer = {
        id: `local-${Date.now()}`,
        name: String(data.get("name") ?? "Walk-in customer").trim() || "Walk-in customer",
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language,
        outstandingBalance: "0.00"
      };
      setDemoMode(true);
      setSelectedCustomer(customer);
      setCustomers((existing) => [customer, ...existing]);
      setView("billing");
      setStatus(error instanceof Error ? `${error.message} Customer opened in demo workspace.` : "Customer opened in demo workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function submitProductSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Searching catalog...");
    const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
    if (demoMode) {
      const result = starterProducts.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(query));
      setProducts(result.length ? result : starterProducts);
      setActiveTask("products");
      setStatus(result.length ? `${result.length} demo product(s) found.` : "Showing all demo products.");
      setBusy(false);
      return;
    }
    try {
      const result = (await searchProducts(query)) ?? [];
      setProducts(result);
      setActiveTask("credit");
      setStatus(result.length ? "Tap a product to add it to this account." : "No product found.");
    } catch (error) {
      const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
      const result = starterProducts.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(query));
      setProducts(result.length ? result : starterProducts);
      setDemoMode(true);
      setActiveTask("products");
      setStatus(error instanceof Error ? `${error.message} Showing demo product catalog.` : "Showing demo product catalog.");
    } finally {
      setBusy(false);
    }
  }

  async function executeSaveCredit(product: Product, quantity: string) {
    if (!requireSession() || !requireCustomer()) return;
    setBusy(true);
    setStatus("Saving credit sale...");
    if (demoMode) {
      const qty = Number(quantity);
      const total = Number(product.sellingPrice) * (Number.isFinite(qty) ? qty : 1);
      updateCustomerBalance(total);
      setTodayCreditVal(prev => prev + total);
      setTodaySalesVal(prev => prev + total);
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setStatus(`Demo credit sale saved: Rs.${total.toFixed(2)}.`);
      setBusy(false);
      return;
    }
    try {
      const bill = await createCreditBill({
        customerId: selectedCustomer!.id,
        creditBill: true,
        items: [{ productId: product.id, quantity }]
      });
      const total = Number(bill?.totalAmount ?? "0");
      updateCustomerBalance(total);
      setStatus(`Credit sale saved: Rs.${total}`);
      setTodayCreditVal(prev => prev + total);
      setTodaySalesVal(prev => prev + total);
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
    } catch (error) {
      const qty = Number(quantity);
      const total = Number(product.sellingPrice) * (Number.isFinite(qty) ? qty : 1);
      updateCustomerBalance(total);
      setTodayCreditVal(prev => prev + total);
      setTodaySalesVal(prev => prev + total);
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Demo credit sale saved: Rs.${total.toFixed(2)}.` : `Demo credit sale saved: Rs.${total.toFixed(2)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitCreditBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) {
      setStatus("Search and select a product first.");
      setActiveTask("products");
      return;
    }
    const data = new FormData(event.currentTarget);
    const quantity = String(data.get("quantity") ?? "1");
    await executeSaveCredit(selectedProduct, quantity);
  }

  async function executeSavePayment(amount: number) {
    if (!requireSession() || !requireCustomer()) return;
    setBusy(true);
    setStatus("Recording payment...");
    if (demoMode) {
      updateCustomerBalance(-Math.max(0, amount));
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
      setStatus(`Demo payment recorded: Rs.${amount.toFixed(2)}.`);
      setBusy(false);
      return;
    }
    try {
      const payment = await receivePayment({ customerId: selectedCustomer!.id, amount: String(amount), note: "Counter payment" });
      if (payment) {
        setSelectedCustomer((current) => {
          if (!current || current.id !== payment.customerId) return current;
          const updated = { ...current, outstandingBalance: payment.outstandingBalance };
          setCustomers((existing) => existing.map((c) => c.id === updated.id ? updated : c));
          return updated;
        });
        setStatus(`Payment saved. Balance: Rs.${payment.outstandingBalance}`);
      } else {
        updateCustomerBalance(-Math.max(0, amount));
        setStatus(`Payment saved and queued. Dues reduced by: Rs.${amount.toFixed(2)}.`);
      }
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
    } catch (error) {
      updateCustomerBalance(-Math.max(0, amount));
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Demo payment recorded: Rs.${amount.toFixed(2)}.` : `Demo payment recorded: Rs.${amount.toFixed(2)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(String(new FormData(event.currentTarget).get("amount") ?? "0"));
    await executeSavePayment(amount);
  }

  function openCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setView("billing");
    setStatus(`${customer.name}'s account is open. Use Credit sale, Payment, Products, or AI.`);
  }

  function updateCustomerBalance(delta: number) {
    setSelectedCustomer((current) => {
      if (!current) {
        return current;
      }
      const nextBalance = Math.max(0, Number(current.outstandingBalance ?? "0") + delta).toFixed(2);
      const updated = { ...current, outstandingBalance: nextBalance };
      setCustomers((existing) => existing.map((customer) => customer.id === updated.id ? updated : customer));
      return updated;
    });
  }

  function handleVoiceCommand(cmd: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) {
    if (!cmd || !cmd.intent) return;
    const intent = cmd.intent.toUpperCase();

    if (intent === "OPEN_CUSTOMER" || intent === "ASK_BALANCE" || intent === "SEND_REMINDER") {
      if (cmd.customerName) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));
        if (matched) {
          openCustomer(matched);
          if (intent === "ASK_BALANCE") {
            setActiveTask("ai");
            setStatus(`${matched.name}'s balance is Rs.${matched.outstandingBalance}.`);
          } else if (intent === "SEND_REMINDER") {
            setStatus(`SMS reminder prepared for ${matched.name}.`);
          }
        } else {
          setStatus(`No customer found matching "${cmd.customerName}".`);
        }
      } else if (selectedCustomer) {
        if (intent === "ASK_BALANCE") {
          setActiveTask("ai");
          setStatus(`${selectedCustomer.name}'s balance is Rs.${selectedCustomer.outstandingBalance}.`);
        } else if (intent === "SEND_REMINDER") {
          setStatus(`SMS reminder prepared for ${selectedCustomer.name}.`);
        }
      } else {
        setStatus("Which customer account should I open?");
        setView("customers");
      }
    } else if (intent === "ADD_PURCHASE") {
      let currentCust = selectedCustomer;
      if (cmd.customerName && (!selectedCustomer || selectedCustomer.name.toLowerCase() !== cmd.customerName.toLowerCase())) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) {
        setStatus("Open or search a customer account first to record a credit sale.");
        setView("customers");
        return;
      }
      setView("billing");
      setActiveTask("credit");
      
      let matchedProd = selectedProduct;
      if (cmd.productAlias) {
        const alias = cmd.productAlias.toLowerCase().trim();
        const matchedProduct = products.find(p => p.name.toLowerCase().includes(alias) || p.sku.toLowerCase().includes(alias));
        if (matchedProduct) {
          setSelectedProduct(matchedProduct);
          matchedProd = matchedProduct;
        }
      }
      
      let qty = "1";
      if (cmd.quantity) {
        const match = cmd.quantity.match(/\d+(\.\d+)?/);
        qty = match ? match[0] : "1";
        setVoiceQuantity(qty);
      } else {
        setVoiceQuantity("1");
      }
      
      setPendingVoiceCommand({
        intent: "ADD_PURCHASE",
        customerName: currentCust.name,
        productAlias: matchedProd ? matchedProd.name : (cmd.productAlias || "Product"),
        quantity: qty
      });
      setStatus(`Confirm voice action: credit sale of ${matchedProd ? matchedProd.name : "product"} for ${currentCust.name}?`);
      
    } else if (intent === "RECEIVE_PAYMENT") {
      let currentCust = selectedCustomer;
      if (cmd.customerName && (!selectedCustomer || selectedCustomer.name.toLowerCase() !== cmd.customerName.toLowerCase())) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) {
        setStatus("Open or search a customer account first to record a payment.");
        setView("customers");
        return;
      }
      setView("billing");
      setActiveTask("payment");
      
      let amt = "0";
      if (cmd.amount) {
        amt = String(cmd.amount);
        setVoiceAmount(amt);
      } else {
        setVoiceAmount("");
      }
      
      setPendingVoiceCommand({
        intent: "RECEIVE_PAYMENT",
        customerName: currentCust.name,
        amount: amt
      });
      setStatus(`Confirm voice action: record payment of Rs.${amt} from ${currentCust.name}?`);
      
    } else if (intent === "SHOW_REPORT") {
      setView("ai");
      setActiveTask("ai");
      setStatus("Opening reports and AI insights.");
    } else if (intent === "CONFIRM") {
      if (pendingVoiceCommand) {
        if (pendingVoiceCommand.intent === "ADD_PURCHASE") {
          if (selectedProduct) {
            executeSaveCredit(selectedProduct, voiceQuantity);
          } else {
            setStatus("No product selected to save.");
          }
        } else if (pendingVoiceCommand.intent === "RECEIVE_PAYMENT") {
          executeSavePayment(Number(voiceAmount || 0));
        }
      } else {
        const activeForm = document.querySelector("form");
        if (activeForm) {
          setStatus("Confirming action...");
          activeForm.requestSubmit();
        } else {
          setStatus("No active transaction form to confirm.");
        }
      }
    } else if (intent === "CANCEL") {
      setSelectedProduct(null);
      setVoiceAmount("");
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setStatus("Action cancelled.");
    } else if (intent === "UNDO") {
      setStatus("Undo action not supported in this version.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f1] pb-28 text-ink">
      <section className="border-b border-leaf-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-md bg-leaf-600 text-white shadow-soft">
              <Store className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf-700">{copy.appName}</p>
              <h1 className="text-2xl font-black sm:text-3xl">{copy.productName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-11 items-center gap-2 rounded-md border border-leaf-100 bg-leaf-50 px-3 text-sm font-bold text-leaf-900">
              <Languages className="h-4 w-4" aria-hidden />
              <select className="bg-transparent outline-none" value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Language">
                <option value="ENGLISH">English</option>
                <option value="TAMIL">தமிழ்</option>
                <option value="HINDI">हिन्दी</option>
                <option value="TELUGU">తెలుగు</option>
                <option value="KANNADA">ಕನ್ನಡ</option>
                <option value="MALAYALAM">മലയാളം</option>
              </select>
            </label>
            <StatusPill icon={online ? ShieldCheck : WifiOff} label={online ? copy.online : copy.offline} />
            <StatusPill icon={MessageCircle} label={`${queueSize} ${copy.offlineQueue}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-5">
        <div className="grid gap-2 rounded-md bg-white p-2 shadow-sm sm:grid-cols-5">
          <NavButton icon={LayoutDashboard} label={copy.admin} active={view === "admin"} onClick={() => setView("admin")} />
          <NavButton icon={UsersRound} label={copy.customers} active={view === "customers"} onClick={() => setView("customers")} />
          <NavButton icon={ReceiptText} label={copy.billing} active={view === "billing"} onClick={() => setView("billing")} />
          <NavButton icon={PackageSearch} label={copy.products} active={view === "products"} onClick={() => { setView("products"); setActiveTask("products"); }} />
          <NavButton icon={Bot} label={copy.ai} active={view === "ai"} onClick={() => { setView("ai"); setActiveTask("ai"); }} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-4">
        <SummaryTile icon={IndianRupee} label={copy.todaySales} value={`Rs.${todaySalesVal.toLocaleString()}`} tone="bg-leaf-600 text-white" />
        <SummaryTile icon={CreditCard} label={copy.todayCredit} value={`Rs.${todayCreditVal.toLocaleString()}`} tone="bg-[#fff3c7] text-[#644b00]" />
        <SummaryTile icon={WalletCards} label={copy.todayPayments} value={`Rs.${todayPaymentsVal.toLocaleString()}`} tone="bg-[#e8f1ff] text-[#1f5f9f]" />
        <SummaryTile icon={UsersRound} label={copy.pendingBalance} value={`Rs.${customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} tone="bg-[#ffe9e3] text-chilli" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 lg:grid-cols-[0.9fr_1.4fr_0.8fr]">
        <aside className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-white p-4 shadow-soft">
            <h2 className="text-xl font-black">{copy.connectShop}</h2>
            <p className="mt-1 text-sm font-semibold text-ink/60">{copy.connectShopHint}</p>
            <form onSubmit={submitAuth} className="mt-3 space-y-3">
              <Input name="phone" label={copy.phone} />
              <Input name="password" label={copy.password} type="password" />
              <Input name="shopName" label={copy.shopName} required={false} />
              <Input name="ownerName" label={copy.ownerName} required={false} />
              <button disabled={busy} className="min-h-12 w-full rounded-md bg-ink px-4 font-black text-white disabled:opacity-60">{hasToken ? copy.connected : copy.loginRegister}</button>
              <button type="button" onClick={() => { setDemoMode(true); setHasToken(true); setView("admin"); setStatus("Demo admin access enabled. All portal buttons are available for testing."); }} className="min-h-12 w-full rounded-md bg-leaf-50 px-4 font-black text-leaf-700">
                {copy.openAdminDemo}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{copy.customers}</h2>
              <UserRoundCheck className="h-6 w-6 text-leaf-700" aria-hidden />
            </div>
            <form onSubmit={submitCustomerSearch} className="mt-3 flex min-h-12 items-center rounded-md border border-leaf-100 bg-leaf-50 px-3">
              <Search className="h-5 w-5 text-leaf-700" aria-hidden />
              <input name="query" className="ml-2 w-full bg-transparent text-base font-semibold outline-none" placeholder={copy.searchCustomer} />
            </form>
            <form onSubmit={submitCreateCustomer} className="mt-3 grid gap-2">
              <Input name="name" label={copy.newCustomerName} />
              <Input name="phone" label={copy.phone} required={false} />
              <button disabled={busy} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 font-black text-white disabled:opacity-60">
                <Plus className="h-5 w-5" aria-hidden /> {copy.createAndOpen}
              </button>
            </form>
          </motion.div>
        </aside>

        <section className="space-y-4">
          <CustomerWorkspace
            busy={busy}
            view={view}
            demoMode={demoMode}
            hasToken={hasToken}
            customer={selectedCustomer}
            customers={customers}
            activeTask={activeTask}
            products={products}
            selectedProduct={selectedProduct}
            status={status}
            transcript={transcript}
            onOpenCustomer={openCustomer}
            onTask={setActiveTask}
            onView={setView}
            onProductSearch={submitProductSearch}
            onProductSelect={(product) => {
              setSelectedProduct(product);
              setActiveTask("credit");
              if (selectedCustomer) {
                setView("billing");
              }
              setStatus(`${product.name} selected for ${selectedCustomer?.name ?? "customer"}.`);
            }}
            onCreditSubmit={submitCreditBill}
            onPaymentSubmit={submitPayment}
            copy={copy}
            voiceQuantity={voiceQuantity}
            setVoiceQuantity={setVoiceQuantity}
            voiceAmount={voiceAmount}
            setVoiceAmount={setVoiceAmount}
            pendingVoiceCommand={pendingVoiceCommand}
            onConfirmVoice={() => {
              if (pendingVoiceCommand) {
                if (pendingVoiceCommand.intent === "ADD_PURCHASE" && selectedProduct) {
                  executeSaveCredit(selectedProduct, voiceQuantity);
                } else if (pendingVoiceCommand.intent === "RECEIVE_PAYMENT") {
                  executeSavePayment(Number(voiceAmount || 0));
                }
              }
            }}
            onCancelVoice={() => {
              setPendingVoiceCommand(null);
              setSelectedProduct(null);
              setVoiceAmount("");
              setVoiceQuantity("1");
              setStatus("Voice action cancelled.");
            }}
            merchantUpiId={merchantUpiId}
            onChangeUpiId={handleUpdateUpiId}
            language={language}
          />
        </section>

        <aside className="space-y-4">
          <AIAssistant
            status={status}
            setStatus={setStatus}
            copy={copy}
            language={language}
            customer={selectedCustomer}
            transcript={transcript}
            customers={customers}
            products={products}
            aiQueryOverride={aiQueryOverride}
            setAiQueryOverride={setAiQueryOverride}
          />
          <VoiceCard
            transcript={transcript}
            onChangeTranscript={setTranscript}
            copy={copy}
            onSendToAi={() => {
              if (transcript.trim()) {
                setAiQueryOverride(transcript.trim());
                setView("ai");
                setActiveTask("ai");
                setStatus(`Sending question to AI: "${transcript.trim()}"`);
              }
            }}
            onRunCommand={async () => {
              if (transcript.trim()) {
                setBusy(true);
                setStatus("Parsing transaction command...");
                try {
                  const cmd = await parseVoiceCommand(transcript.trim(), language);
                  if (cmd) {
                    handleVoiceCommand(cmd);
                  } else {
                    setStatus("Could not parse command. Try using format like: 'Kumar Stores payment 500 rupees'.");
                  }
                } catch (error) {
                  setStatus("Failed to parse command. Check server connection.");
                } finally {
                  setBusy(false);
                }
              }
            }}
          />
        </aside>
      </section>

      <FloatingMic language={language} copy={copy} onTranscript={(value) => {
        setTranscript(value);
        if (value) {
          setStatus(value);
        }
      }} onCommandParsed={handleVoiceCommand} />
    </main>
  );
}

function CustomerWorkspace(props: {
  busy: boolean;
  view: View;
  demoMode: boolean;
  hasToken: boolean;
  customer: Customer | null;
  customers: Customer[];
  activeTask: Task;
  products: Product[];
  selectedProduct: Product | null;
  status: string;
  transcript: string;
  onOpenCustomer: (customer: Customer) => void;
  onTask: (task: Task) => void;
  onView: (view: View) => void;
  onProductSearch: (event: FormEvent<HTMLFormElement>) => void;
  onProductSelect: (product: Product) => void;
  onCreditSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPaymentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  copy: ReturnType<typeof t>;
  voiceQuantity: string;
  setVoiceQuantity: (val: string) => void;
  voiceAmount: string;
  setVoiceAmount: (val: string) => void;
  pendingVoiceCommand: { intent: string; customerName?: string; productAlias?: string; amount?: string; quantity?: string } | null;
  onConfirmVoice: () => void;
  onCancelVoice: () => void;
  merchantUpiId: string;
  onChangeUpiId: (id: string) => void;
  language: Language;
}) {
  const { customer, customers, activeTask, onTask, view } = props;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[640px] rounded-md bg-white p-4 shadow-soft">
      {view === "admin" ? (
        <AdminPanel customers={customers} status={props.status} demoMode={props.demoMode} hasToken={props.hasToken} onView={props.onView} copy={props.copy} merchantUpiId={props.merchantUpiId} onChangeUpiId={props.onChangeUpiId} />
      ) : view === "customers" ? (
        <CustomerDirectory customers={customers} onOpenCustomer={props.onOpenCustomer} copy={props.copy} />
      ) : view === "products" ? (
        <ProductSearchPanel products={props.products} onSearch={props.onProductSearch} onSelect={props.onProductSelect} busy={props.busy} copy={props.copy} />
      ) : view === "ai" && !customer ? (
        <AdminInsights customers={customers} products={props.products} language={props.language} transcript={props.transcript} copy={props.copy} />
      ) : !customer ? (
        <div className="flex min-h-[560px] flex-col justify-between rounded-md bg-leaf-50 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{props.copy.customerAccountFirst}</p>
            <h2 className="mt-2 text-3xl font-black">{props.copy.openCustomerToStart}</h2>
            <p className="mt-3 max-w-xl text-lg font-semibold text-ink/65">{props.copy.openCustomerHint}</p>
          </div>
          <div className="grid gap-3">
            {customers.slice(0, 5).map((item) => <CustomerCard key={item.id} customer={item} onClick={() => props.onOpenCustomer(item)} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-ink p-5 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-white/65">{props.copy.customerAccount}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-4xl font-black">{customer.name}</h2>
                <p className="mt-1 text-lg text-white/75">{customer.phone || props.copy.noPhone}</p>
              </div>
              <div className="rounded-md bg-white/10 p-3 text-right">
                <p className="text-sm font-bold text-white/65">{props.copy.outstanding}</p>
                <p className="text-3xl font-black">Rs.{customer.outstandingBalance ?? "0"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <ActionButton icon={CreditCard} label={props.copy.addPurchase} active={activeTask === "credit"} onClick={() => onTask("credit")} />
            <ActionButton icon={IndianRupee} label={props.copy.receivePayment} active={activeTask === "payment"} onClick={() => onTask("payment")} />
            <ActionButton icon={PackageSearch} label={props.copy.products} active={activeTask === "products"} onClick={() => onTask("products")} />
            <ActionButton icon={Bot} label={props.copy.askAssistant} active={activeTask === "ai"} onClick={() => onTask("ai")} />
          </div>

          {props.pendingVoiceCommand && (
            <VoiceCommandVerificationCard
              command={props.pendingVoiceCommand}
              onConfirm={props.onConfirmVoice}
              onCancel={props.onCancelVoice}
              copy={props.copy}
            />
          )}

          <div className="rounded-md border border-leaf-100 bg-[#fbfcf8] p-4">
            {activeTask === "products" && <ProductSearchPanel products={props.products} onSearch={props.onProductSearch} onSelect={props.onProductSelect} busy={props.busy} copy={props.copy} />}
            {activeTask === "credit" && <CreditPanel product={props.selectedProduct} onSubmit={props.onCreditSubmit} onFindProduct={() => { props.onView("products"); onTask("products"); }} busy={props.busy} copy={props.copy} value={props.voiceQuantity} onChange={props.setVoiceQuantity} />}
            {activeTask === "payment" && (
              <PaymentPanel
                onSubmit={props.onPaymentSubmit}
                busy={props.busy}
                copy={props.copy}
                value={props.voiceAmount}
                onChange={props.setVoiceAmount}
                customerName={customer.name}
                outstandingBalance={customer.outstandingBalance ?? "0"}
                merchantUpiId={props.merchantUpiId}
              />
            )}
            {(view === "ai" || activeTask === "ai") && <InlineAI customer={customer} transcript={props.transcript} copy={props.copy} />}
          </div>

          <div className="rounded-md bg-leaf-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{props.copy.liveStatus}</p>
            <p className="mt-1 text-lg font-bold" role="status">{props.busy ? props.copy.listening : props.status === "Ready" ? props.copy.ready : props.status}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AdminPanel({
  customers,
  status,
  demoMode,
  hasToken,
  onView,
  copy,
  merchantUpiId,
  onChangeUpiId
}: {
  customers: Customer[];
  status: string;
  demoMode: boolean;
  hasToken: boolean;
  onView: (view: View) => void;
  copy: ReturnType<typeof t>;
  merchantUpiId: string;
  onChangeUpiId: (id: string) => void;
}) {
  const pending = customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0);
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-ink p-5 text-white">
        <p className="text-sm font-black uppercase tracking-wide text-white/60">{copy.adminAccess}</p>
        <h2 className="mt-2 text-4xl font-black">{copy.shopControlCenter}</h2>
        <p className="mt-2 text-lg font-semibold text-white/70">{demoMode ? copy.demoAdminActive : hasToken ? copy.backendSessionActive : copy.connectOrDemo}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label={copy.customerCount} value={String(customers.length)} />
        <AdminMetric label={copy.pendingCredit} value={`Rs.${pending.toFixed(0)}`} />
        <AdminMetric label={copy.system} value={demoMode ? copy.demo : hasToken ? copy.connected : copy.locked} />
      </div>

      <div className="rounded-md border border-leaf-100 bg-[#fbfcf8] p-4">
        <h3 className="text-lg font-black text-leaf-900">UPI Payment Settings</h3>
        <p className="text-sm text-ink/75 font-semibold mt-1">Configure the shop's UPI ID (VPA) to receive credit settlements directly.</p>
        <div className="mt-3">
          <label className="block text-xs font-black uppercase tracking-wider text-ink/65">Merchant UPI ID</label>
          <input
            type="text"
            value={merchantUpiId}
            onChange={(e) => onChangeUpiId(e.target.value)}
            placeholder="e.g. shopname@upi"
            className="mt-1 min-h-11 w-full rounded-md border border-leaf-100 bg-white px-3 font-bold text-ink outline-none focus:border-leaf-600"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminAction icon={UsersRound} title={copy.viewCustomerDetails} text={copy.viewCustomerDetailsHint} onClick={() => onView("customers")} />
        <AdminAction icon={ReceiptText} title={copy.startBilling} text={copy.startBillingHint} onClick={() => onView("billing")} />
        <AdminAction icon={PackageSearch} title={copy.productCatalog} text={copy.productCatalogHint} onClick={() => onView("products")} />
        <AdminAction icon={BarChart3} title={copy.reports} text={status} onClick={() => onView("ai")} />
      </div>
    </div>
  );
}

function CustomerDirectory({ customers, onOpenCustomer, copy }: { customers: Customer[]; onOpenCustomer: (customer: Customer) => void; copy: ReturnType<typeof t> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-md bg-leaf-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.customerDetails}</p>
          <h2 className="text-3xl font-black">{copy.customerDirectory}</h2>
        </div>
        <p className="rounded-md bg-white px-3 py-2 font-black text-leaf-700">{customers.length} {copy.accounts}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {customers.map((customer) => <CustomerCard key={customer.id} customer={customer} onClick={() => onOpenCustomer(customer)} />)}
      </div>
    </div>
  );
}

function AdminInsights({
  customers,
  products,
  language,
  transcript,
  copy
}: {
  customers: Customer[];
  products: Product[];
  language: Language;
  transcript: string;
  copy: ReturnType<typeof t>;
}) {
  const totalPending = customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0);
  const topCustomer = [...customers].sort((a, b) => Number(b.outstandingBalance ?? "0") - Number(a.outstandingBalance ?? "0"))[0];

  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAlerts() {
      try {
        const response = await chatWithAi({
          message: "Analyze the current product catalog and customer listings. Suggest exactly 3 brief, predictive inventory restocking alerts or sales tips for the shopkeeper. Keep each point under 12 words. Make them specific (e.g., 'Stock up on Sunflower Oil, weddings are starting' or 'Restock Sugar, credit sales are high').",
          language,
          customers,
          products
        });
        if (active && response?.answer) {
          const points = response.answer
            .split(/\n+/)
            .map(p => p.replace(/^[-*•\d.\s]+/, "").trim())
            .filter(Boolean)
            .slice(0, 3);
          setAlerts(points.length > 0 ? points : [
            "Restock Sugar: credit requests are rising",
            "Order Sunflower Oil: wedding season demand expected",
            "Detergent stock is low: check Lakshmi account dues"
          ]);
        }
      } catch {
        if (active) {
          setAlerts([
            "Restock Sugar: credit requests are rising",
            "Order Sunflower Oil: wedding season demand expected",
            "Detergent stock is low: check Lakshmi account dues"
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAlerts();
    return () => { active = false; };
  }, [customers, products, language]);

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-ink p-5 text-white">
        <p className="text-sm font-black uppercase tracking-wide text-white/60">{copy.aiInsights}</p>
        <h2 className="mt-2 text-4xl font-black">{copy.shopAssistant}</h2>
        <p className="mt-2 text-lg font-semibold text-white/70">{copy.aiInsightsHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-leaf-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Total Outstanding Credit</p>
          <p className="mt-1 text-3xl font-black">Rs.{totalPending.toFixed(2)}</p>
        </div>
        <div className="rounded-md bg-leaf-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Highest Pending Balance</p>
          {topCustomer && Number(topCustomer.outstandingBalance) > 0 ? (
            <div>
              <p className="mt-1 text-xl font-black leading-none">{topCustomer.name}</p>
              <p className="mt-1 text-base font-bold text-ink/70">Rs.{topCustomer.outstandingBalance}</p>
            </div>
          ) : (
            <p className="mt-1 text-lg font-bold text-ink/65">{copy.noCustomerBalances}</p>
          )}
        </div>
      </div>

      <div className="rounded-md border-2 border-leaf-600 bg-[#f7fbf2] p-5 shadow-soft">
        <h3 className="flex items-center gap-2 text-xl font-black text-leaf-900">
          <Sparkles className="h-5 w-5 text-leaf-600 animate-pulse" aria-hidden />
          AI Smart Replenishment Alerts
        </h3>

        {loading ? (
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-4 w-11/12 rounded bg-leaf-100"></div>
            <div className="h-4 w-10/12 rounded bg-leaf-100"></div>
            <div className="h-4 w-9/12 rounded bg-leaf-100"></div>
          </div>
        ) : (
          <ul className="mt-3 space-y-2 text-base font-bold text-ink/80 list-inside list-disc">
            {alerts.map((alert, idx) => (
              <li key={idx} className="leading-snug">
                {alert}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md bg-leaf-50 p-4">
        <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Live Status</p>
        <p className="mt-1 text-lg font-bold">{transcript ? `Voice: ${transcript}` : copy.waitingForVoice}</p>
      </div>
    </div>
  );
}

function ProductSearchPanel({ products, onSearch, onSelect, busy, copy }: { products: Product[]; onSearch: (event: FormEvent<HTMLFormElement>) => void; onSelect: (product: Product) => void; busy: boolean; copy: ReturnType<typeof t> }) {
  return (
    <div>
      <h3 className="text-2xl font-black">{copy.productSearch}</h3>
      <form onSubmit={onSearch} className="mt-3 flex min-h-14 items-center rounded-md border border-leaf-100 bg-white px-3">
        <Search className="h-5 w-5 text-leaf-700" aria-hidden />
        <input name="query" className="ml-2 w-full bg-transparent text-lg font-bold outline-none" placeholder={copy.productSearchPlaceholder} />
        <button disabled={busy} className="rounded-md bg-leaf-600 px-4 py-2 font-black text-white disabled:opacity-60">{copy.search}</button>
      </form>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {products.map((product) => (
          <button key={product.id} type="button" onClick={() => onSelect(product)} className="rounded-md border border-leaf-100 bg-white p-3 text-left shadow-sm hover:border-leaf-600">
            <p className="font-black">{product.name}</p>
            <p className="text-sm font-bold text-ink/60">Rs.{product.sellingPrice}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CreditPanel({ product, onSubmit, onFindProduct, busy, copy, value, onChange }: { product: Product | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onFindProduct: () => void; busy: boolean; copy: ReturnType<typeof t>; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <h3 className="text-2xl font-black">{copy.addPurchase}</h3>
      <div className="mt-3 rounded-md bg-white p-3">
        <p className="text-sm font-bold text-ink/60">{copy.selectedProduct}</p>
        <p className="text-xl font-black">{product ? product.name : copy.noProductSelected}</p>
        <button type="button" onClick={onFindProduct} className="mt-2 rounded-md bg-leaf-50 px-3 py-2 font-black text-leaf-700">{copy.findProduct}</button>
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Input name="quantity" label={copy.quantity} value={value} onChange={(e) => onChange(e.target.value)} />
        <button disabled={busy} className="min-h-14 rounded-md bg-leaf-600 px-5 font-black text-white disabled:opacity-60">{copy.saveCredit}</button>
      </form>
    </div>
  );
}

function PaymentPanel({
  onSubmit,
  busy,
  copy,
  value,
  onChange,
  customerName,
  outstandingBalance,
  merchantUpiId
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  copy: ReturnType<typeof t>;
  value: string;
  onChange: (val: string) => void;
  customerName: string;
  outstandingBalance: string;
  merchantUpiId: string;
}) {
  const [showQr, setShowQr] = useState(false);
  const payAmount = value || outstandingBalance || "0";

  const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("GramMart Merchant")}&am=${encodeURIComponent(payAmount)}&cu=INR&tn=${encodeURIComponent("Credit payoff for " + customerName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h3 className="text-2xl font-black">{copy.receivePayment}</h3>
        {Number(outstandingBalance) > 0 && (
          <button
            type="button"
            onClick={() => onChange(outstandingBalance)}
            className="text-sm font-black text-leaf-700 hover:text-leaf-800 underline text-left animate-pulse"
          >
            Fill Full Dues (Rs.{outstandingBalance})
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Input name="amount" label={copy.amountReceived} value={value} onChange={(e) => onChange(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="min-h-14 rounded-md border-2 border-leaf-600 bg-white px-4 font-black text-leaf-700 hover:bg-leaf-50 transition"
          >
            {showQr ? "Hide QR" : "Show UPI QR"}
          </button>
          <button disabled={busy} className="min-h-14 flex-1 rounded-md bg-leaf-600 px-5 font-black text-white disabled:opacity-60">
            {copy.savePayment}
          </button>
        </div>
      </form>

      {showQr && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-col items-center gap-3 rounded-md border-2 border-leaf-100 bg-[#f7fbf2] p-5 text-center"
        >
          <div className="rounded-md bg-white p-3 shadow-sm border border-leaf-200">
            <img src={qrCodeUrl} alt="UPI QR Code" className="h-44 w-44 object-contain" />
          </div>
          <div>
            <p className="text-base font-black text-leaf-900">Scan to Pay: Rs.{payAmount}</p>
            <p className="text-xs font-bold text-ink/60 mt-1">UPI ID: {merchantUpiId}</p>
            <p className="text-xs font-bold text-ink/50 mt-1 max-w-sm">
              Use GPay, PhonePe, Paytm, or any banking app to scan this QR code. Once payment succeeds, click "{copy.savePayment}" to register.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InlineAI({ customer, transcript, copy }: { customer: Customer; transcript: string; copy: ReturnType<typeof t> }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-2xl font-black"><Sparkles className="h-6 w-6 text-leaf-700" aria-hidden /> {copy.aiHelp}</h3>
      <div className="mt-3 grid gap-2">
        <AssistantBubble text={`${customer.name} currently has Rs.${customer.outstandingBalance ?? "0"} pending.`} />
        <AssistantBubble text={transcript ? `Voice: ${transcript}` : copy.askCustomerOwes} />
        <AssistantBubble text={copy.reminderSuggestion} />
      </div>
    </div>
  );
}

const speechLangCodes: Record<Language, string> = {
  ENGLISH: "en-IN",
  TAMIL: "ta-IN",
  HINDI: "hi-IN",
  TELUGU: "te-IN",
  KANNADA: "kn-IN",
  MALAYALAM: "ml-IN"
};

function AIAssistant({
  status,
  setStatus,
  copy,
  language,
  customer,
  transcript,
  customers,
  products,
  aiQueryOverride,
  setAiQueryOverride
}: {
  status: string;
  setStatus: (value: string) => void;
  copy: ReturnType<typeof t>;
  language: Language;
  customer: Customer | null;
  transcript: string;
  customers: Customer[];
  products: Product[];
  aiQueryOverride: string;
  setAiQueryOverride: (val: string) => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(status === "Ready" ? copy.ready : status);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (aiQueryOverride) {
      setQuestion("");
      void askQuestion(aiQueryOverride);
      setAiQueryOverride("");
    }
  }, [aiQueryOverride]);

  async function askQuestion(text: string) {
    setThinking(true);
    setAnswer(copy.listening);
    try {
      const response = await chatWithAi({
        message: text,
        language,
        customerName: customer?.name,
        outstandingBalance: customer?.outstandingBalance,
        transcript,
        customers,
        products
      });
      const nextAnswer = response?.answer ?? localAiAnswer(copy, customer);
      setAnswer(nextAnswer);
      setStatus(nextAnswer);
    } catch {
      const nextAnswer = localAiAnswer(copy, customer);
      setAnswer(nextAnswer);
      setStatus(nextAnswer);
    } finally {
      setThinking(false);
    }
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = question.trim() || transcript || copy.whoOwesMost;
    await askQuestion(message);
    setQuestion("");
  }

  return (
    <div className="rounded-md bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white"><Bot className="h-6 w-6" aria-hidden /></div>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.aiAssistant}</p>
          <h2 className="text-xl font-black">{copy.askSimpleWords}</h2>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <AssistantBubble text={copy.whoOwesMost} />
        <AssistantBubble text={copy.restockToday} />
        <AssistantBubble text={thinking ? copy.listening : answer === "Ready" ? copy.ready : answer || (status === "Ready" ? copy.ready : status)} speakable={true} language={language} />
      </div>

      {transcript && transcript !== "Listening..." && transcript !== "Speech recognition is not available in this browser." && (
        <button
          type="button"
          onClick={() => askQuestion(transcript)}
          className="mt-3 flex items-center gap-2 rounded-md bg-leaf-50 p-2 text-left text-sm font-bold text-leaf-700 hover:bg-leaf-100 transition w-full"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-leaf-600 animate-pulse" aria-hidden />
          <span>Ask AI about: <span className="italic">"{transcript}"</span></span>
        </button>
      )}

      <form onSubmit={ask} className="mt-3 space-y-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-11 w-full rounded-md border border-leaf-100 bg-leaf-50 px-3 font-bold outline-none focus:border-leaf-600" placeholder={copy.askSimpleWords} />
        <button disabled={thinking} className="min-h-11 w-full rounded-md bg-leaf-50 font-black text-leaf-700 disabled:opacity-60">{copy.askAssistant}</button>
      </form>
    </div>
  );
}

function localAiAnswer(copy: ReturnType<typeof t>, customer: Customer | null) {
  if (customer) {
    return `${customer.name}: Rs.${customer.outstandingBalance ?? "0"} pending. ${copy.suggestedNextStep}`;
  }
  return copy.suggestedNextStep;
}

function VoiceCard({
  transcript,
  onChangeTranscript,
  copy,
  onSendToAi,
  onRunCommand
}: {
  transcript: string;
  onChangeTranscript: (val: string) => void;
  copy: ReturnType<typeof t>;
  onSendToAi: () => void;
  onRunCommand: () => void;
}) {
  return (
    <div id="voice-panel" className="rounded-md bg-ink p-4 text-white shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink"><Mic className="h-6 w-6" aria-hidden /></div>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-white/50">{copy.voiceFirst}</p>
          <h2 className="text-xl font-black">{copy.voiceAssistant}</h2>
        </div>
      </div>
      <p className="mt-3 text-white/70">{copy.voicePrompt}</p>
      
      <textarea
        value={transcript}
        onChange={(e) => onChangeTranscript(e.target.value)}
        placeholder={copy.waitingForVoice}
        className="mt-3 min-h-24 w-full rounded-md bg-white/10 p-3 text-lg font-bold text-white outline-none border border-white/10 focus:border-leaf-600 focus:bg-white/15 transition resize-none"
      />

      {transcript && transcript.trim() !== "Listening..." && transcript.trim() !== "Speech recognition is not available in this browser." && (
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={onRunCommand}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 font-black text-white hover:bg-leaf-700 transition text-base"
          >
            <CircleCheck className="h-4 w-4" aria-hidden />
            Submit Voice Response
          </button>
          
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onSendToAi}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-4 font-bold text-white hover:bg-white/20 transition text-sm border border-white/5"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Ask AI Assistant
            </button>
            <button
              type="button"
              onClick={() => onChangeTranscript("")}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-4 font-bold text-white hover:bg-white/20 hover:text-chilli transition text-sm border border-white/5"
            >
              Clear Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md bg-white p-3 text-left shadow-sm hover:shadow-soft">
      <p className="text-lg font-black">{customer.name}</p>
      <p className="text-sm font-bold text-ink/60">{customer.phone || "No phone"}</p>
      <p className="mt-1 text-sm font-black text-leaf-700">Balance Rs.{customer.outstandingBalance ?? "0"}</p>
    </button>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }: { icon: typeof CreditCard; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-24 rounded-md p-3 text-left font-black shadow-sm transition ${active ? "bg-leaf-600 text-white" : "bg-leaf-50 text-ink hover:bg-leaf-100"}`}>
      <Icon className="h-7 w-7" aria-hidden />
      <span className="mt-3 block">{label}</span>
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-14 items-center justify-center gap-2 rounded-md px-3 font-black transition ${active ? "bg-ink text-white" : "bg-leaf-50 text-ink hover:bg-leaf-100"}`}>
      <Icon className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-leaf-100 bg-leaf-50 p-4">
      <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}

function AdminAction({ icon: Icon, title, text, onClick }: { icon: LucideIcon; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-32 rounded-md border border-leaf-100 bg-white p-4 text-left shadow-sm transition hover:border-leaf-600 hover:shadow-soft">
      <Icon className="h-7 w-7 text-leaf-700" aria-hidden />
      <p className="mt-3 text-xl font-black">{title}</p>
      <p className="mt-1 text-sm font-bold text-ink/60">{text}</p>
    </button>
  );
}

function SummaryTile({ icon: Icon, label, value, tone }: { icon: typeof IndianRupee; label: string; value: string; tone: string }) {
  return (
    <article className={`rounded-md p-4 shadow-soft ${tone}`}>
      <Icon className="h-7 w-7" aria-hidden />
      <p className="mt-4 text-sm font-black uppercase opacity-75">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </article>
  );
}

function StatusPill({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return <span className="flex min-h-11 items-center gap-2 rounded-md bg-white px-3 text-sm font-black shadow-sm"><Icon className="h-4 w-4 text-leaf-700" aria-hidden /> {label}</span>;
}

function AssistantBubble({ text, speakable, language }: { text: string; speakable?: boolean; language?: Language }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleSpeak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language ? speechLangCodes[language] : "en-IN";
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  }

  return (
    <div className="relative rounded-md bg-leaf-50 p-3 pr-10 text-sm font-bold text-ink/75">
      <p>{text}</p>
      {speakable && text && text !== "Ready" && text !== "Listening..." && text !== "Speech recognition is not available in this browser." && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`absolute right-2 top-2 p-1 rounded-full transition hover:bg-leaf-100 ${speaking ? "text-leaf-600 bg-leaf-100" : "text-ink/50"}`}
          title="Speak aloud"
          aria-label="Speak aloud"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Input({ name, label, type = "text", required = true, defaultValue, value, onChange }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block flex-1 text-sm font-black text-ink/70">
      {label}
      <input name={name} type={type} required={required} defaultValue={defaultValue} value={value} onChange={onChange} className="mt-1 min-h-12 w-full rounded-md border border-leaf-100 bg-white px-3 text-lg font-bold text-ink outline-none focus:border-leaf-600" />
    </label>
  );
}

function VoiceCommandVerificationCard({
  command,
  onConfirm,
  onCancel,
  copy
}: {
  command: { intent: string; customerName?: string; productAlias?: string; amount?: string; quantity?: string };
  onConfirm: () => void;
  onCancel: () => void;
  copy: any;
}) {
  const isPurchase = command.intent.toUpperCase() === "ADD_PURCHASE";

  return (
    <div className="rounded-md border-2 border-leaf-600 bg-[#f7fbf2] p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-600 text-white animate-pulse">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h4 className="text-lg font-black text-leaf-900">Confirm Voice Action</h4>
          <p className="text-base font-bold text-ink/80">
            {isPurchase
              ? `Save credit purchase of "${command.productAlias}" (Qty: ${command.quantity}) for ${command.customerName}?`
              : `Save payment of Rs.${command.amount} from ${command.customerName}?`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 min-h-12 rounded-md bg-leaf-600 font-black text-white hover:bg-leaf-700 transition text-base"
        >
          {isPurchase ? "Save Credit" : "Save Payment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-12 rounded-md bg-[#ffe9e3] font-black text-chilli hover:bg-[#ffdcd2] transition text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

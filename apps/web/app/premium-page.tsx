"use client";

/**
 * GramMart AI - Premium Rural Retail Operating System
 * 
 * Complete UI redesign with Village Sunrise theme
 * This replaces the old generic admin dashboard
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumSidebar } from "@/components/premium/layout/premium-sidebar";
import { PremiumHeader } from "@/components/premium/layout/premium-header";
import { AICommandCenter } from "@/components/premium/dashboard/ai-command-center";
import { PremiumBilling } from "@/components/premium/billing/premium-billing";
import { FloatingAIAssistant } from "@/components/premium/ai/floating-ai-assistant";
import { colors } from "@/styles/design-system";
import type { Language } from "@/lib/i18n";
import { useNetworkStatus } from "@/lib/offline";

const queryClient = new QueryClient();

type View = "dashboard" | "customers" | "billing" | "products" | "payments" | "reports" | "ai" | "settings";

function PremiumApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [language, setLanguage] = useState<Language>("ENGLISH");
  const [shopName] = useState("Abi Stores");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isOnline = useNetworkStatus();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        display: "flex",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Sidebar */}
      <PremiumSidebar currentView={currentView} onNavigate={(view) => setCurrentView(view as View)} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? "96px" : "296px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <PremiumHeader
          shopName={shopName}
          language={language}
          isOnline={isOnline}
          onLanguageChange={setLanguage}
        />

        {/* Page Content */}
        <main style={{ flex: 1, overflow: "auto" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === "dashboard" && <AICommandCenter />}
              {currentView === "customers" && <PlaceholderScreen title="Customers" />}
              {currentView === "billing" && <PremiumBilling />}
              {currentView === "products" && <PlaceholderScreen title="Products" />}
              {currentView === "payments" && <PlaceholderScreen title="Payments" />}
              {currentView === "reports" && <PlaceholderScreen title="Reports" />}
              {currentView === "ai" && <PlaceholderScreen title="AI Assistant" />}
              {currentView === "settings" && <PlaceholderScreen title="Settings" />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}

// Placeholder for screens not yet implemented
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          textAlign: "center",
          background: colors.surface,
          borderRadius: "22px",
          padding: "3rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${colors.primary}, #4CAF50)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <span style={{ fontSize: "2rem" }}>🚀</span>
        </div>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: colors.textSecondary,
            marginBottom: "2rem",
          }}
        >
          This premium screen is coming soon! ✨
        </p>
        <div
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: colors.background,
            borderRadius: "100px",
            fontSize: "0.875rem",
            color: colors.textSecondary,
          }}
        >
          Under Development
        </div>
      </motion.div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PremiumApp />
    </QueryClientProvider>
  );
}

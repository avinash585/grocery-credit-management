"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  BarChart3,
  Sparkles,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { colors, borderRadius, spacing, shadows, typography, zIndex } from "@/styles/design-system";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  color?: string;
}

interface PremiumSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function PremiumSidebar({ currentView, onNavigate }: PremiumSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: colors.primary },
    { id: "customers", label: "Customers", icon: Users, color: "#0288D1" },
    { id: "billing", label: "Billing", icon: ShoppingCart, color: "#F59E0B" },
    { id: "products", label: "Products", icon: Package, color: "#9C27B0" },
    { id: "payments", label: "Payments", icon: DollarSign, color: "#2E7D32" },
    { id: "reports", label: "Reports", icon: BarChart3, color: "#D32F2F" },
    { id: "ai", label: "AI Assistant", icon: Sparkles, color: colors.primary, badge: 3 },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{
        width: collapsed ? "80px" : "280px",
        height: "calc(100vh - 32px)",
        background: colors.sidebar,
        borderRadius: borderRadius.xl,
        margin: spacing.md,
        padding: spacing.lg,
        boxShadow: shadows.float,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: zIndex.fixed,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
      }}
    >
      {/* Logo & Shop Name */}
      <div
        style={{
          marginBottom: spacing.xl,
          paddingBottom: spacing.lg,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${colors.gradients.hero[0]}, ${colors.gradients.hero[1]})`,
              borderRadius: borderRadius.lg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Package size={24} color={colors.surface} />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  fontSize: typography.body.sizes.small,
                  color: "rgba(255, 255, 255, 0.6)",
                  marginBottom: 2,
                }}
              >
                GRAMMART AI
              </div>
              <div
                style={{
                  fontSize: typography.body.sizes.regular,
                  fontWeight: typography.heading.weight,
                  color: colors.sidebarText,
                }}
              >
                Rural Retail OS
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: spacing.md,
                padding: collapsed ? spacing.md : `${spacing.md} ${spacing.lg}`,
                marginBottom: spacing.sm,
                background: isActive
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
                border: "none",
                borderRadius: borderRadius.lg,
                color: colors.sidebarText,
                cursor: "pointer",
                transition: "all 0.3s ease",
                justifyContent: collapsed ? "center" : "flex-start",
                position: "relative",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 4,
                    height: "60%",
                    background: colors.accent,
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              )}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: borderRadius.md,
                  background: isActive
                    ? `${item.color || colors.primary}40`
                    : "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={isActive ? item.color || colors.accent : colors.sidebarText} />
              </div>
              {!collapsed && (
                <>
                  <span
                    style={{
                      fontSize: typography.body.sizes.regular,
                      fontWeight: isActive ? 600 : 500,
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: borderRadius.full,
                        background: colors.danger,
                        color: colors.surface,
                        fontSize: typography.body.sizes.tiny,
                        fontWeight: typography.heading.weight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Settings & Collapse Button */}
      <div
        style={{
          paddingTop: spacing.lg,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
            padding: collapsed ? spacing.md : `${spacing.md} ${spacing.lg}`,
            marginBottom: spacing.sm,
            background: "transparent",
            border: "none",
            borderRadius: borderRadius.lg,
            color: colors.sidebarText,
            cursor: "pointer",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onClick={() => onNavigate("settings")}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%",
            padding: spacing.md,
            background: "rgba(255, 255, 255, 0.05)",
            border: "none",
            borderRadius: borderRadius.lg,
            color: colors.sidebarText,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

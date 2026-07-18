"use client";

import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Globe,
  Wifi,
  WifiOff,
  User,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { colors, borderRadius, spacing, shadows, typography } from "@/styles/design-system";
import type { Language } from "@/lib/i18n";

interface PremiumHeaderProps {
  shopName: string;
  language: Language;
  isOnline: boolean;
  onLanguageChange: (lang: Language) => void;
}

export function PremiumHeader({
  shopName,
  language,
  isOnline,
  onLanguageChange,
}: PremiumHeaderProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const languages = [
    { code: "ENGLISH", label: "English", flag: "🇬🇧" },
    { code: "TAMIL", label: "தமிழ்", flag: "🇮🇳" },
    { code: "HINDI", label: "हिंदी", flag: "🇮🇳" },
    { code: "TELUGU", label: "తెలుగు", flag: "🇮🇳" },
    { code: "KANNADA", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "MALAYALAM", label: "മലയാളം", flag: "🇮🇳" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.md} ${spacing.xl}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.lg,
        boxShadow: shadows.sm,
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: "500px",
          position: "relative",
        }}
      >
        <Search
          size={20}
          style={{
            position: "absolute",
            left: spacing.md,
            top: "50%",
            transform: "translateY(-50%)",
            color: colors.textSecondary,
          }}
        />
        <input
          type="text"
          placeholder="Search customers, products..."
          style={{
            width: "100%",
            padding: `${spacing.md} ${spacing.md} ${spacing.md} 44px`,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.full,
            fontSize: typography.body.sizes.regular,
            outline: "none",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary;
            e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
        {/* Online Status */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
            padding: `${spacing.sm} ${spacing.md}`,
            background: isOnline ? `${colors.success}10` : `${colors.danger}10`,
            borderRadius: borderRadius.full,
            cursor: "pointer",
          }}
        >
          {isOnline ? (
            <Wifi size={16} color={colors.success} />
          ) : (
            <WifiOff size={16} color={colors.danger} />
          )}
          <span
            style={{
              fontSize: typography.body.sizes.small,
              color: isOnline ? colors.success : colors.danger,
              fontWeight: 600,
            }}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </motion.div>

        {/* Language Selector */}
        <div style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              padding: `${spacing.sm} ${spacing.md}`,
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.full,
              cursor: "pointer",
              fontSize: typography.body.sizes.small,
            }}
          >
            <Globe size={16} color={colors.primary} />
            <span>{currentLang?.flag} {currentLang?.label}</span>
            <ChevronDown size={16} />
          </motion.button>

          {showLangMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: colors.surface,
                borderRadius: borderRadius.lg,
                boxShadow: shadows.lg,
                padding: spacing.sm,
                minWidth: "180px",
                zIndex: 1200,
              }}
            >
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ background: colors.background }}
                  onClick={() => {
                    onLanguageChange(lang.code as Language);
                    setShowLangMenu(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.sm,
                    padding: spacing.md,
                    background: language === lang.code ? colors.background : "transparent",
                    border: "none",
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontSize: typography.body.sizes.small,
                    textAlign: "left",
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: borderRadius.full,
            background: colors.background,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={20} color={colors.textPrimary} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: colors.danger,
              border: `2px solid ${colors.surface}`,
            }}
          />
        </motion.button>

        {/* Profile Menu */}
        <div style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              padding: `${spacing.sm} ${spacing.md}`,
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.full,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: borderRadius.full,
                background: `linear-gradient(135deg, ${colors.gradients.hero[0]}, ${colors.gradients.hero[1]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={16} color={colors.surface} />
            </div>
            <span style={{ fontSize: typography.body.sizes.small, fontWeight: 600 }}>
              {shopName}
            </span>
            <ChevronDown size={16} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

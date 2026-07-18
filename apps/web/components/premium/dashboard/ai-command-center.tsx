"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Bell,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";
import { colors, shadows, borderRadius, spacing, typography } from "@/styles/design-system";

interface AIInsight {
  type: "alert" | "suggestion" | "insight";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: string;
  icon: any;
}

interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  color: string;
}

export function AICommandCenter() {
  // Mock data - Replace with real API calls
  const greeting = getGreeting();
  const shopName = "Abi Stores";
  
  const metrics: DashboardMetric[] = [
    { label: "Today's Sales", value: "₹0", color: colors.success },
    { label: "Today's Credit", value: "₹0", color: colors.warning },
    { label: "Today's Payments", value: "₹0", color: colors.info },
    { label: "Pending Collections", value: "₹0.00", color: colors.danger },
  ];
  
  const insights: AIInsight[] = [
    {
      type: "alert",
      priority: "high",
      title: "No customers have visited today",
      description: "Start billing to track today's business",
      icon: Users,
    },
    {
      type: "suggestion",
      priority: "medium",
      title: "Connect your shop",
      description: "Login once to sync with backend and MySQL",
      action: "Connect Now",
      icon: Package,
    },
  ];
  
  return (
    <div style={{
      padding: spacing.xl,
      background: colors.background,
      minHeight: "100vh",
    }}>
      {/* Dynamic Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: spacing.xl,
        }}
      >
        <h1 style={{
          fontSize: typography.heading.sizes.h2,
          fontWeight: typography.heading.weight,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}>
          {greeting}, {shopName}
        </h1>
        <p style={{
          fontSize: typography.body.sizes.regular,
          color: colors.textSecondary,
        }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Today's Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: spacing.lg,
        marginBottom: spacing.xl,
      }}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: shadows.lg }}
            style={{
              background: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              boxShadow: shadows.md,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing.md,
            }}>
              <span style={{
                fontSize: typography.body.sizes.small,
                color: colors.textSecondary,
                fontWeight: 500,
              }}>
                {metric.label}
              </span>
              {metric.trend && (
                <TrendingUp
                  size={16}
                  style={{
                    color: metric.trend === "up" ? colors.success : colors.danger,
                  }}
                />
              )}
            </div>
            <div style={{
              fontSize: typography.heading.sizes.h3,
              fontWeight: typography.heading.weight,
              color: metric.color,
            }}>
              {metric.value}
            </div>
            {metric.change && (
              <div style={{
                fontSize: typography.body.sizes.small,
                color: colors.textSecondary,
                marginTop: spacing.sm,
              }}>
                {metric.change}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: `linear-gradient(135deg, ${colors.gradients.hero[0]}, ${colors.gradients.hero[1]})`,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          boxShadow: shadows.float,
          marginBottom: spacing.xl,
          color: colors.surface,
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}>
          <Sparkles size={28} />
          <div>
            <h2 style={{
              fontSize: typography.heading.sizes.h4,
              fontWeight: typography.heading.weight,
              marginBottom: spacing.xs,
            }}>
              AI Insights
            </h2>
            <p style={{
              fontSize: typography.body.sizes.small,
              opacity: 0.9,
            }}>
              Shop assistant
            </p>
          </div>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          backdropFilter: "blur(10px)",
        }}>
          <p style={{
            fontSize: typography.body.sizes.regular,
            lineHeight: 1.6,
            marginBottom: spacing.md,
          }}>
            Ask about customers, credit, stock, reminders, and daily work.
          </p>
          <div style={{
            display: "flex",
            gap: spacing.sm,
            flexWrap: "wrap",
          }}>
            {["Who owes the most money?", "What should I restock today?", "Ready"].map(
              (suggestion) => (
                <motion.button
                  key={suggestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: borderRadius.full,
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontSize: typography.body.sizes.small,
                    color: colors.surface,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {suggestion}
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Priority Alerts & Suggestions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: spacing.lg,
      }}>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            style={{
              background: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              boxShadow: shadows.md,
              borderLeft: `4px solid ${
                insight.priority === "high"
                  ? colors.danger
                  : insight.priority === "medium"
                  ? colors.warning
                  : colors.info
              }`,
            }}
          >
            <div style={{
              display: "flex",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  background:
                    insight.priority === "high"
                      ? `${colors.danger}20`
                      : insight.priority === "medium"
                      ? `${colors.warning}20`
                      : `${colors.info}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <insight.icon
                  size={24}
                  color={
                    insight.priority === "high"
                      ? colors.danger
                      : insight.priority === "medium"
                      ? colors.warning
                      : colors.info
                  }
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: typography.body.sizes.regular,
                  fontWeight: typography.heading.weight,
                  color: colors.textPrimary,
                  marginBottom: spacing.xs,
                }}>
                  {insight.title}
                </h3>
                <p style={{
                  fontSize: typography.body.sizes.small,
                  color: colors.textSecondary,
                  lineHeight: 1.5,
                }}>
                  {insight.description}
                </p>
              </div>
            </div>
            {insight.action && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: colors.primary,
                  color: colors.surface,
                  border: "none",
                  borderRadius: borderRadius.lg,
                  fontSize: typography.body.sizes.small,
                  fontWeight: typography.button.weight,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.sm,
                }}
              >
                {insight.action}
                <ArrowRight size={16} />
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "🌞 Good Morning";
  } else if (hour < 17) {
    return "👋 Good Afternoon";
  } else {
    return "🌙 Good Evening";
  }
}

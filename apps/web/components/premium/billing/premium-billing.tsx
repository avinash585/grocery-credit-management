"use client";

import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Package,
  ShoppingCart,
  Send,
  Receipt,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { colors, borderRadius, spacing, shadows, typography } from "@/styles/design-system";
import type { Customer, Product } from "@/lib/api";

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export function PremiumBilling() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "Avinash Kumar",
      phone: "9876543210",
      outstandingBalance: "1500.00",
      preferredLanguage: "ENGLISH",
    },
    {
      id: "2",
      name: "Lakshmi Devi",
      phone: "9876543211",
      outstandingBalance: "2500.00",
      preferredLanguage: "TAMIL",
    },
  ];

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Rice",
      sellingPrice: "45.00",
      stockQuantity: "100.00",
      unit: "1 kg",
      category: "Grains",
      sku: "RICE-001",
      enabled: true,
      nameTa: "அரிசி",
    },
    {
      id: "2",
      name: "Sugar",
      sellingPrice: "47.00",
      stockQuantity: "80.00",
      unit: "1 kg",
      category: "Sugar",
      sku: "SUG-001",
      enabled: true,
      nameTa: "சர்க்கரை",
    },
  ];

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 400px",
        gap: spacing.lg,
        padding: spacing.xl,
        height: "calc(100vh - 80px)",
      }}
    >
      {/* Left Panel - Customer Selection */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          background: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          boxShadow: shadows.md,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontSize: typography.heading.sizes.h5,
            fontWeight: typography.heading.weight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <User size={20} color={colors.primary} />
          Customer
        </h3>

        {selectedCustomer ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: spacing.lg,
              background: `linear-gradient(135deg, ${colors.gradients.customer[0]}, ${colors.gradients.customer[1]})`,
              borderRadius: borderRadius.lg,
              marginBottom: spacing.md,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.md,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: typography.body.sizes.regular,
                    fontWeight: typography.heading.weight,
                    color: colors.textPrimary,
                  }}
                >
                  {selectedCustomer.name}
                </div>
                <div
                  style={{
                    fontSize: typography.body.sizes.small,
                    color: colors.textSecondary,
                  }}
                >
                  {selectedCustomer.phone}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "rgba(211, 47, 47, 0.1)",
                  border: "none",
                  borderRadius: borderRadius.full,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} color={colors.danger} />
              </motion.button>
            </div>
            <div
              style={{
                padding: spacing.md,
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: borderRadius.md,
              }}
            >
              <div style={{ fontSize: typography.body.sizes.tiny, color: colors.textSecondary }}>
                Outstanding Balance
              </div>
              <div
                style={{
                  fontSize: typography.heading.sizes.h5,
                  fontWeight: typography.heading.weight,
                  color: colors.danger,
                }}
              >
                ₹{selectedCustomer.outstandingBalance}
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: spacing.md,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius.lg,
                fontSize: typography.body.sizes.small,
                marginBottom: spacing.md,
              }}
            />
            {mockCustomers.map((customer) => (
              <motion.button
                key={customer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCustomer(customer)}
                style={{
                  width: "100%",
                  padding: spacing.md,
                  background: colors.background,
                  border: "none",
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.sm,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: typography.body.sizes.small,
                    fontWeight: 600,
                    color: colors.textPrimary,
                  }}
                >
                  {customer.name}
                </div>
                <div
                  style={{
                    fontSize: typography.body.sizes.tiny,
                    color: colors.textSecondary,
                  }}
                >
                  {customer.phone}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Center Panel - Products & Cart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.lg,
        }}
      >
        {/* Products Grid */}
        <div
          style={{
            background: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            boxShadow: shadows.md,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontSize: typography.heading.sizes.h5,
              fontWeight: typography.heading.weight,
              color: colors.textPrimary,
              marginBottom: spacing.lg,
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Package size={20} color={colors.primary} />
            Products
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: spacing.md,
            }}
          >
            {mockProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ y: -4, boxShadow: shadows.lg }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: spacing.md,
                  background: colors.background,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    margin: "0 auto 0.5rem",
                    borderRadius: borderRadius.md,
                    background: `linear-gradient(135deg, ${colors.gradients.inventory[0]}, ${colors.gradients.inventory[1]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  🌾
                </div>
                <div
                  style={{
                    fontSize: typography.body.sizes.small,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {product.name}
                </div>
                <div
                  style={{
                    fontSize: typography.body.sizes.tiny,
                    color: colors.textSecondary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {product.unit}
                </div>
                <div
                  style={{
                    fontSize: typography.body.sizes.regular,
                    fontWeight: typography.heading.weight,
                    color: colors.primary,
                  }}
                >
                  ₹{product.sellingPrice}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div
          style={{
            background: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            boxShadow: shadows.md,
            maxHeight: "250px",
          }}
        >
          <h3
            style={{
              fontSize: typography.heading.sizes.h5,
              fontWeight: typography.heading.weight,
              color: colors.textPrimary,
              marginBottom: spacing.lg,
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <ShoppingCart size={20} color={colors.primary} />
            Cart ({cart.length} items)
          </h3>

          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: spacing.xl,
                color: colors.textSecondary,
              }}
            >
              Cart is empty. Add products to start billing.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
              {cart.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.md,
                    background: colors.background,
                    borderRadius: borderRadius.md,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ fontSize: typography.body.sizes.tiny, color: colors.textSecondary }}>
                      ₹{item.product.sellingPrice} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: colors.primary }}>
                    ₹{item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Summary & Actions */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          background: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          boxShadow: shadows.md,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontSize: typography.heading.sizes.h5,
            fontWeight: typography.heading.weight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          Summary
        </h3>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                padding: spacing.lg,
                background: `linear-gradient(135deg, ${colors.gradients.billing[0]}, ${colors.gradients.billing[1]})`,
                borderRadius: borderRadius.lg,
                marginBottom: spacing.lg,
              }}
            >
              <div
                style={{
                  fontSize: typography.body.sizes.small,
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                }}
              >
                Total Amount
              </div>
              <div
                style={{
                  fontSize: typography.heading.sizes.h2,
                  fontWeight: typography.heading.weight,
                  color: colors.primary,
                }}
              >
                ₹{total.toFixed(2)}
              </div>
            </div>

            <div style={{ fontSize: typography.body.sizes.tiny, color: colors.textSecondary, marginBottom: spacing.sm }}>
              BILLING TIME
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
                marginBottom: spacing.xl,
                color: colors.textSecondary,
              }}
            >
              <Clock size={16} />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedCustomer || cart.length === 0}
              style={{
                padding: spacing.lg,
                background: colors.warning,
                border: "none",
                borderRadius: borderRadius.xl,
                color: colors.surface,
                fontSize: typography.body.sizes.regular,
                fontWeight: typography.button.weight,
                cursor: selectedCustomer && cart.length > 0 ? "pointer" : "not-allowed",
                opacity: selectedCustomer && cart.length > 0 ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
              }}
            >
              <Receipt size={20} />
              Save as Credit
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedCustomer || cart.length === 0}
              style={{
                padding: spacing.lg,
                background: colors.success,
                border: "none",
                borderRadius: borderRadius.xl,
                color: colors.surface,
                fontSize: typography.body.sizes.regular,
                fontWeight: typography.button.weight,
                cursor: selectedCustomer && cart.length > 0 ? "pointer" : "not-allowed",
                opacity: selectedCustomer && cart.length > 0 ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
              }}
            >
              <Send size={20} />
              Cash Payment
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

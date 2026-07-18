"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  X,
  Send,
  Sparkles,
  Volume2,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { colors, borderRadius, spacing, shadows, typography, zIndex } from "@/styles/design-system";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingAIAssistantProps {
  onVoiceCommand?: (text: string) => void;
  isListening?: boolean;
  isProcessing?: boolean;
}

export function FloatingAIAssistant({
  onVoiceCommand,
  isListening = false,
  isProcessing = false,
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI shop assistant. Ask me about customers, credit, stock, or daily tasks.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    "Who owes the most money?",
    "What should I restock today?",
    "Show today's sales",
    "Low stock items",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate AI response (replace with real AI call)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "I understand. Let me help you with that...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Voice Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: spacing.xl,
          right: spacing.xl,
          width: 64,
          height: 64,
          borderRadius: borderRadius.full,
          background: isListening
            ? `linear-gradient(135deg, ${colors.danger}, ${colors.warning})`
            : `linear-gradient(135deg, ${colors.gradients.hero[0]}, ${colors.gradients.hero[1]})`,
          border: "none",
          boxShadow: isListening ? shadows.glow : shadows.float,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: zIndex.floatingAI,
        }}
      >
        {isProcessing ? (
          <Loader2 size={28} color={colors.surface} className="animate-spin" />
        ) : isListening ? (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <Mic size={28} color={colors.surface} />
          </motion.div>
        ) : (
          <Sparkles size={28} color={colors.surface} />
        )}
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "fixed",
              bottom: 120,
              right: spacing.xl,
              width: 400,
              maxHeight: "600px",
              background: colors.surface,
              borderRadius: borderRadius.xl,
              boxShadow: shadows["2xl"],
              zIndex: zIndex.floatingAI,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.gradients.hero[0]}, ${colors.gradients.hero[1]})`,
                padding: spacing.lg,
                color: colors.surface,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                  <Sparkles size={24} />
                  <div>
                    <div style={{ fontWeight: typography.heading.weight, fontSize: typography.body.sizes.regular }}>
                      AI Shop Assistant
                    </div>
                    <div style={{ fontSize: typography.body.sizes.small, opacity: 0.9 }}>
                      Always here to help
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
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
                  <X size={20} color={colors.surface} />
                </motion.button>
              </div>

              {/* Mode Toggle */}
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  marginTop: spacing.md,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: borderRadius.full,
                  padding: 4,
                }}
              >
                {[
                  { id: "voice", icon: Mic, label: "Voice" },
                  { id: "chat", icon: MessageCircle, label: "Chat" },
                ].map((m) => (
                  <motion.button
                    key={m.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(m.id as any)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: spacing.sm,
                      padding: `${spacing.sm} ${spacing.md}`,
                      background: mode === m.id ? colors.surface : "transparent",
                      color: mode === m.id ? colors.primary : colors.surface,
                      border: "none",
                      borderRadius: borderRadius.full,
                      cursor: "pointer",
                      fontSize: typography.body.sizes.small,
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <m.icon size={16} />
                    {m.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: spacing.lg,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: spacing.md,
                      borderRadius: borderRadius.lg,
                      background:
                        message.role === "user"
                          ? colors.primary
                          : colors.background,
                      color:
                        message.role === "user"
                          ? colors.surface
                          : colors.textPrimary,
                      fontSize: typography.body.sizes.small,
                      lineHeight: 1.5,
                    }}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {mode === "voice" && (
              <div
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: typography.body.sizes.tiny,
                    color: colors.textSecondary,
                    marginBottom: spacing.sm,
                    fontWeight: 600,
                  }}
                >
                  TRY ASKING
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                  {quickSuggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const userMessage: Message = {
                          role: "user",
                          content: suggestion,
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMessage]);
                      }}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        background: colors.background,
                        border: `1px solid ${colors.border}`,
                        borderRadius: borderRadius.full,
                        fontSize: typography.body.sizes.tiny,
                        color: colors.textPrimary,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            {mode === "chat" && (
              <div
                style={{
                  padding: spacing.lg,
                  borderTop: `1px solid ${colors.border}`,
                  display: "flex",
                  gap: spacing.md,
                }}
              >
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  style={{
                    flex: 1,
                    padding: spacing.md,
                    border: `1px solid ${colors.border}`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.body.sizes.small,
                    outline: "none",
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: borderRadius.full,
                    background: inputText.trim() ? colors.primary : colors.border,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: inputText.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  <Send size={18} color={colors.surface} />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

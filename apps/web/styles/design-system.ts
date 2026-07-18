/**
 * GramMart AI Design System
 * Village Sunrise Theme - Premium Rural Retail Operating System
 * 
 * This design system replaces the old generic green admin dashboard
 * with a warm, modern, AI-first experience inspired by Indian villages.
 */

export const colors = {
  // Brand Colors (Village Sunrise Theme)
  background: "#F8F6F1",        // Warm cream background
  surface: "#FFFFFF",           // Pure white cards
  primary: "#1B5E20",           // Deep forest green
  primaryHover: "#145A32",      // Darker green on hover
  secondary: "#E8F5E9",         // Light green accent
  accent: "#D97706",            // Warm amber
  highlight: "#F4B400",         // Golden yellow
  
  // Functional Colors
  success: "#2E7D32",           // Green for success
  warning: "#F59E0B",           // Orange for warnings
  danger: "#D32F2F",            // Red for errors
  info: "#0288D1",              // Blue for info
  
  // Text Colors
  textPrimary: "#1A1A1A",       // Near black
  textSecondary: "#616161",     // Medium gray
  
  // UI Colors
  border: "#E6E6E6",            // Light border
  shadow: "rgba(0,0,0,0.08)",   // Soft shadow
  
  // Sidebar
  sidebar: "#103D2C",           // Deep forest for sidebar
  sidebarText: "#FFFFFF",       // White text on sidebar
  
  // Gradients
  gradients: {
    hero: ["#1B5E20", "#4CAF50"],              // AI gradient
    billing: ["#FFF8E1", "#FFE082"],           // Billing gradient
    customer: ["#E8F5E9", "#C8E6C9"],          // Customer gradient
    payment: ["#E3F2FD", "#BBDEFB"],           // Payment gradient
    reports: ["#F3E5F5", "#E1BEE7"],           // Reports gradient
    inventory: ["#FFF3E0", "#FFD180"],         // Inventory gradient
  }
};

export const typography = {
  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: {
    weight: 700,
    sizes: {
      h1: "2.5rem",    // 40px
      h2: "2rem",      // 32px
      h3: "1.75rem",   // 28px
      h4: "1.5rem",    // 24px
      h5: "1.25rem",   // 20px
      h6: "1rem",      // 16px
    }
  },
  body: {
    weight: 500,
    sizes: {
      large: "1.125rem",   // 18px
      regular: "1rem",     // 16px
      small: "0.875rem",   // 14px
      tiny: "0.75rem",     // 12px
    }
  },
  button: {
    weight: 600,
  }
};

export const spacing = {
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "3rem",    // 48px
  "3xl": "4rem",    // 64px
};

export const borderRadius = {
  sm: "0.5rem",      // 8px
  md: "0.75rem",     // 12px
  lg: "1rem",        // 16px
  xl: "1.375rem",    // 22px (brand standard)
  full: "9999px",    // Pill buttons
};

export const shadows = {
  sm: `0 2px 4px ${colors.shadow}`,
  md: `0 4px 8px ${colors.shadow}`,
  lg: `0 8px 16px ${colors.shadow}`,
  xl: `0 12px 24px ${colors.shadow}`,
  "2xl": `0 16px 32px ${colors.shadow}`,
  
  // Special shadows
  float: `0 8px 24px rgba(27, 94, 32, 0.15)`,       // Floating cards
  glow: `0 0 20px rgba(27, 94, 32, 0.25)`,          // AI glow effect
};

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "300ms ease-in-out",
  slow: "500ms ease-in-out",
};

export const breakpoints = {
  mobile: "640px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px",
  wide: "1536px",
};

// Village Mode - Large Touch-Friendly Sizes
export const villageMode = {
  buttonSize: {
    min: "80px",      // Minimum 80x80px touch target
    regular: "120px",
  },
  fontSize: {
    regular: "1.125rem",   // 18px minimum
    large: "1.5rem",       // 24px for headers
    xlarge: "2rem",        // 32px for numbers
  },
  iconSize: {
    regular: "32px",
    large: "48px",
  },
  spacing: {
    card: "1.5rem",        // 24px
    section: "2rem",       // 32px
  }
};

// Color Coding for Village Mode
export const villageColorCoding = {
  credit: "#F4B400",      // Yellow
  payment: "#2E7D32",     // Green
  inventory: "#F59E0B",   // Orange
  reports: "#9C27B0",     // Purple
  customers: "#0288D1",   // Blue
  ai: "#1B5E20",          // Emerald green
};

// Component Styles
export const components = {
  card: {
    background: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadow: shadows.md,
    hoverShadow: shadows.lg,
  },
  button: {
    primary: {
      background: colors.primary,
      color: colors.surface,
      borderRadius: borderRadius.full,
      padding: `${spacing.md} ${spacing.xl}`,
      shadow: shadows.sm,
      hoverShadow: shadows.md,
    },
    secondary: {
      background: colors.secondary,
      color: colors.primary,
      borderRadius: borderRadius.full,
      padding: `${spacing.md} ${spacing.xl}`,
    },
    ghost: {
      background: "transparent",
      color: colors.textPrimary,
      borderRadius: borderRadius.full,
      padding: `${spacing.md} ${spacing.xl}`,
    }
  },
  input: {
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    border: `1px solid ${colors.border}`,
    focusBorder: `1px solid ${colors.primary}`,
  },
  sidebar: {
    width: "280px",
    collapsedWidth: "80px",
    background: colors.sidebar,
    color: colors.sidebarText,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  }
};

// Animation Presets
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  slideInFromRight: {
    from: { opacity: 0, transform: "translateX(40px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  voicePulse: {
    "0%, 100%": { transform: "scale(1)", opacity: 1 },
    "50%": { transform: "scale(1.1)", opacity: 0.8 },
  },
  shimmer: {
    "0%": { backgroundPosition: "-1000px 0" },
    "100%": { backgroundPosition: "1000px 0" },
  }
};

// Z-Index Layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  floatingAI: 1800,
};

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  villageMode,
  villageColorCoding,
  components,
  animations,
  zIndex,
};

export default designSystem;

# TypeScript Language Type Maintenance Guide

## Overview
This document provides guidelines for maintaining the `Language` type and related translations to prevent TypeScript build errors in Vercel deployment.

## Source of Truth
**File**: `apps/web/lib/i18n.ts`

The `Language` type is defined as:
```typescript
export type Language = "ENGLISH" | "TAMIL" | "HINDI" | "TELUGU" | "KANNADA" | "MALAYALAM" | "TANGLISH" | "HINGLISH";
```

## Critical Rules

### 1. **Base Translation Object**
The `english` object in `i18n.ts` is the base translation. ALL translation keys must be defined here first.

```typescript
const english = {
  // All keys must be defined here
  appName: "GramMart AI",
  customerName: "Customer name",
  // ... etc
};
```

### 2. **Partial Translations**
All other language translations are `Partial<typeof english>`, meaning they can have a subset of keys:

```typescript
const tamil: Partial<typeof english> = {
  appName: "கிராம்மார்ட் AI",
  // Only translated keys needed
};
```

### 3. **Adding New Translation Keys**
When adding a new translation key:

1. **First**: Add it to the `english` object
2. **Then**: Add translations to other language objects (tamil, hindi, etc.)
3. **Never** add a key to a non-English translation without first adding it to `english`

### 4. **Record<Language, T> Pattern**
Any object that maps all languages to values must include ALL 8 languages:

```typescript
// CORRECT
const speechLangCodes: Record<Language, string> = {
  ENGLISH: "en-IN",
  TAMIL: "ta-IN",
  HINDI: "hi-IN",
  TELUGU: "te-IN",
  KANNADA: "kn-IN",
  MALAYALAM: "ml-IN",
  TANGLISH: "en-IN",  // Must be included
  HINGLISH: "en-IN",  // Must be included
};

// INCORRECT - Missing TANGLISH and HINGLISH
const speechLangCodes: Record<Language, string> = {
  ENGLISH: "en-IN",
  TAMIL: "ta-IN",
  HINDI: "hi-IN",
  TELUGU: "te-IN",
  KANNADA: "kn-IN",
  MALAYALAM: "ml-IN",
};
```

## Common Mistakes Fixed

### Issue 1: Duplicate Language Type Definitions
**Problem**: `transliterate.ts` had its own `Language` type definition
**Solution**: Import from `i18n.ts` instead
```typescript
// WRONG
type Language = "ENGLISH" | "TAMIL" | "HINDI" | ...;

// RIGHT
import type { Language } from "@/lib/i18n";
```

### Issue 2: Type Aliases
**Problem**: `whatsapp.ts` used `NotificationLanguage` alias
**Solution**: Use `Language` type directly
```typescript
// WRONG
type NotificationLanguage = Language;

// RIGHT
import type { Language } from "@/lib/i18n";
```

### Issue 3: Incomplete Language Mappings
**Problem**: Objects with `Record<Language, T>` missing TANGLISH/HINGLISH
**Files Fixed**:
- `apps/web/app/page.tsx` - speechLangCodes
- `apps/web/components/floating-mic.tsx` - langCodes, ui objects

### Issue 4: Missing Translation Keys
**Problem**: tanglish/hinglish objects had keys not in `english` base
**Solution**: Add `customerName` to `english` object first

## Files That Use Language Type

### Core Files
- `apps/web/lib/i18n.ts` - **Source of truth**
- `apps/web/lib/transliterate.ts` - Transliteration logic
- `apps/web/lib/whatsapp.ts` - WhatsApp notifications
- `apps/web/lib/api.ts` - API types

### Component Files
- `apps/web/app/page.tsx` - Main page with speech codes
- `apps/web/components/floating-mic.tsx` - Voice input component

### API Routes
- `apps/web/app/api/whatsapp/route.ts` - WhatsApp webhook
- `apps/web/app/api/ai/chat/route.ts` - AI chat endpoint

## Verification Steps

### Before Committing
1. Run TypeScript type check:
   ```bash
   cd apps/web
   npm run build
   ```

2. Check for all Language usages:
   ```bash
   grep -r "Record<Language" apps/web/
   grep -r "import.*Language" apps/web/
   ```

3. Verify no duplicate Language type definitions:
   ```bash
   grep -r "type Language.*=" apps/web/lib/
   grep -r "enum Language" apps/web/lib/
   ```

## Commit History (Reference)
- `a7ca4e7` - Import Language type from i18n instead of redefining
- `c612166` - Use Language type directly instead of NotificationLanguage alias
- `6439372` - Add TANGLISH and HINGLISH to speechLangCodes mapping
- `c7d37a7` - Add TANGLISH and HINGLISH support to floating-mic component
- `f03ccbf` - Add missing 'customerName' property to english translation base object

## Prevention Checklist

When adding a new language:
- [ ] Add to `Language` type in `i18n.ts`
- [ ] Add translation object in `i18n.ts`
- [ ] Update all `Record<Language, T>` objects in codebase
- [ ] Search for `.tsx?` files using Language type
- [ ] Run `npm run build` to verify
- [ ] Commit and push to trigger Vercel build
- [ ] Monitor Vercel deployment for success

## Future Improvements

### Potential Validation Script
Create `scripts/validate-languages.ts`:
```typescript
// Check all Record<Language, T> have all 8 languages
// Check no duplicate Language type definitions
// Check all translation keys exist in english base
```

### Type-Level Validation
Consider using TypeScript's `satisfies` operator:
```typescript
const translations = {
  ENGLISH: english,
  TAMIL: tamil,
  HINDI: hindi,
  TELUGU: telugu,
  KANNADA: kannada,
  MALAYALAM: malayalam,
  TANGLISH: tanglish,
  HINGLISH: hinglish,
} satisfies Record<Language, Partial<typeof english>>;
```

## Contact
For questions about Language type maintenance, refer to:
- This guide
- Commit history (commits listed above)
- TypeScript compiler errors during build

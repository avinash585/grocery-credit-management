/**
 * Entity Extraction Engine
 * 
 * Extracts entities (customers, products, quantities, amounts) from user queries.
 * Features:
 * - Fuzzy customer matching
 * - Multilingual product recognition
 * - Quantity parsing with unit conversion
 * - Amount extraction in multiple formats
 */

import type { Customer, Product } from "@/lib/api";
import type { Language } from "@/lib/i18n";
import type {
  EntityMap,
  CustomerEntity,
  ProductEntity,
  AmountEntity,
  QuantityEntity,
} from "./types";
import { PRODUCT_KEYWORDS, getAllKeywords } from "./product-keywords";

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY EXTRACTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class EntityExtractor {
  /**
   * Extract all entities from query
   */
  public extract(
    query: string,
    language: Language,
    allCustomers: Customer[],
    allProducts: Product[]
  ): EntityMap {
    const normalized = this.normalizeQuery(query);
    
    return {
      customers: this.extractCustomers(normalized, allCustomers, language),
      products: this.extractProducts(normalized, allProducts, language),
      amounts: this.extractAmounts(normalized, language),
      quantities: this.extractQuantities(normalized, language),
      dates: [], // TODO: Implement date extraction
      timeRanges: [], // TODO: Implement time range extraction
    };
  }
  
  /**
   * Normalize query for extraction
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOMER EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Extract customer names with fuzzy matching
   */
  public extractCustomers(
    query: string,
    allCustomers: Customer[],
    language: Language
  ): CustomerEntity[] {
    const matches: CustomerEntity[] = [];
    
    // Method 1: Exact name match (highest confidence)
    for (const customer of allCustomers) {
      if (query.includes(customer.name.toLowerCase())) {
        matches.push({
          customer,
          confidence: 1.0,
          matchType: "EXACT",
          rawText: customer.name,
        });
      }
    }
    
    if (matches.length > 0) return this.deduplicateCustomers(matches);
    
    // Method 2: First name match
    for (const customer of allCustomers) {
      const firstName = customer.name.split(/\s+/)[0];
      if (firstName.length > 2 && query.includes(firstName.toLowerCase())) {
        matches.push({
          customer,
          confidence: 0.9,
          matchType: "PARTIAL",
          rawText: firstName,
        });
      }
    }
    
    if (matches.length > 0) return this.deduplicateCustomers(matches);
    
    // Method 3: Fuzzy match (Levenshtein distance)
    for (const customer of allCustomers) {
      const distance = this.levenshteinDistance(
        query,
        customer.name.toLowerCase()
      );
      
      if (distance <= 3 && customer.name.length > 3) {
        matches.push({
          customer,
          confidence: Math.max(0.6, 1.0 - (distance * 0.15)),
          matchType: "FUZZY",
          rawText: customer.name,
        });
      }
    }
    
    if (matches.length > 0) return this.deduplicateCustomers(matches);
    
    // Method 4: Phone number match
    const phoneMatch = query.match(/\d{10}/);
    if (phoneMatch) {
      const phoneNumber = phoneMatch[0];
      const customer = allCustomers.find(c => c.phone === phoneNumber);
      if (customer) {
        return [{
          customer,
          confidence: 1.0,
          matchType: "PHONE",
          rawText: phoneNumber,
        }];
      }
    }
    
    return matches;
  }
  
  /**
   * Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * Remove duplicate customers, keep highest confidence
   */
  private deduplicateCustomers(matches: CustomerEntity[]): CustomerEntity[] {
    const seen = new Set<string>();
    const deduplicated: CustomerEntity[] = [];
    
    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    
    for (const match of matches) {
      if (!seen.has(match.customer.id)) {
        seen.add(match.customer.id);
        deduplicated.push(match);
      }
    }
    
    return deduplicated;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Extract product names with multilingual support
   */
  public extractProducts(
    query: string,
    allProducts: Product[],
    language: Language
  ): ProductEntity[] {
    const matches: ProductEntity[] = [];
    
    // First try keyword database
    for (const keywordEntry of PRODUCT_KEYWORDS) {
      const keywords = getAllKeywords(keywordEntry);
      
      for (const keyword of keywords) {
        if (query.includes(keyword.toLowerCase())) {
          // Find actual product in database
          const product = allProducts.find(p => 
            p.name.toLowerCase().includes(keywordEntry.canonical.toLowerCase()) ||
            keywordEntry.canonical.toLowerCase().includes(p.name.toLowerCase())
          );
          
          if (product) {
            // Extract quantity if present
            const quantityData = this.extractQuantityNearProduct(query, keyword);
            
            matches.push({
              product,
              quantity: quantityData.quantity,
              unit: quantityData.unit,
              confidence: this.calculateProductConfidence(keyword, query),
              matchType: this.getProductMatchType(keyword, keywordEntry),
              rawText: keyword,
            });
            break; // Found one keyword for this product
          }
        }
      }
    }
    
    // Then try direct product name matching
    if (matches.length === 0) {
      for (const product of allProducts) {
        if (query.includes(product.name.toLowerCase())) {
          const quantityData = this.extractQuantityNearProduct(query, product.name);
          
          matches.push({
            product,
            quantity: quantityData.quantity,
            unit: quantityData.unit,
            confidence: 0.95,
            matchType: "EXACT",
            rawText: product.name,
          });
        }
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate product match confidence
   */
  private calculateProductConfidence(keyword: string, query: string): number {
    // Exact word match
    const words = query.split(/\s+/);
    if (words.includes(keyword)) {
      return 1.0;
    }
    
    // Partial match
    if (query.includes(keyword)) {
      return 0.9;
    }
    
    return 0.8;
  }
  
  /**
   * Determine product match type
   */
  private getProductMatchType(
    keyword: string,
    keywordEntry: any
  ): ProductEntity["matchType"] {
    if (keywordEntry.keywords[0] === keyword) return "EXACT";
    if (keywordEntry.brands?.includes(keyword)) return "BRAND";
    
    // Check if regional keyword
    for (const regionalKeywords of Object.values(keywordEntry.regional || {})) {
      if ((regionalKeywords as string[])?.includes(keyword)) {
        return "REGIONAL";
      }
    }
    
    return "ALIAS";
  }
  
  /**
   * Extract quantity near product mention
   */
  private extractQuantityNearProduct(
    query: string,
    productKeyword: string
  ): { quantity: number; unit: ProductEntity["unit"] } {
    const productIndex = query.indexOf(productKeyword.toLowerCase());
    
    // Look for quantity before or after product (within 20 characters)
    const before = query.substring(Math.max(0, productIndex - 20), productIndex);
    const after = query.substring(productIndex, Math.min(query.length, productIndex + 40));
    const searchArea = before + " " + after;
    
    // Try to find quantity with unit
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram)/i,
      /(\d+(?:\.\d+)?)\s*(g|gram|grams)/i,
      /(\d+(?:\.\d+)?)\s*(l|litre|liter|litres|liters)/i,
      /(\d+(?:\.\d+)?)\s*(ml|millilitre)/i,
      /(\d+(?:\.\d+)?)\s*(piece|pieces|pc|pcs)/i,
      /(\d+(?:\.\d+)?)\s*(packet|packets|pack)/i,
      /(\d+(?:\.\d+)?)\s*(box|boxes)/i,
      /(\d+(?:\.\d+)?)\s*(bundle|bundles)/i,
    ];
    
    for (const pattern of patterns) {
      const match = searchArea.match(pattern);
      if (match) {
        return {
          quantity: parseFloat(match[1]),
          unit: this.normalizeUnit(match[2]) as ProductEntity["unit"],
        };
      }
    }
    
    // Default: 1 piece
    return { quantity: 1, unit: "piece" };
  }
  
  /**
   * Normalize unit name
   */
  private normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase();
    
    if (["kg", "kilo", "kilogram"].includes(normalized)) return "kg";
    if (["g", "gram", "grams"].includes(normalized)) return "g";
    if (["l", "litre", "liter", "litres", "liters"].includes(normalized)) return "L";
    if (["ml", "millilitre", "milliliter"].includes(normalized)) return "ml";
    if (["piece", "pieces", "pc", "pcs"].includes(normalized)) return "piece";
    if (["packet", "packets", "pack"].includes(normalized)) return "packet";
    if (["box", "boxes"].includes(normalized)) return "box";
    if (["bundle", "bundles"].includes(normalized)) return "bundle";
    
    return "piece";
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AMOUNT EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Extract amounts (money) from query
   */
  public extractAmounts(query: string, language: Language): AmountEntity[] {
    const amounts: AmountEntity[] = [];
    
    // Pattern 1: ₹500, Rs.500, Rs 500
    const patterns = [
      /₹\s*(\d+(?:[.,]\d+)?)/g,
      /rs\.?\s*(\d+(?:[.,]\d+)?)/gi,
      /rupees?\s*(\d+(?:[.,]\d+)?)/gi,
      /(\d+)\s*(?:rupees?|rs|₹)/gi,
    ];
    
    // Regional patterns
    const regionalPatterns: Record<string, RegExp[]> = {
      TAMIL: [/(\d+)\s*ரூபாய்/g],
      HINDI: [/(\d+)\s*रुपये/g],
      TELUGU: [/(\d+)\s*రూపాయ/g],
      KANNADA: [/(\d+)\s*ರೂಪಾಯಿ/g],
      MALAYALAM: [/(\d+)\s*രൂപ/g],
    };
    
    // Try standard patterns
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const value = parseFloat(match[1].replace(",", "."));
        amounts.push({
          value,
          currency: "INR",
          rawText: match[0],
        });
      }
    }
    
    // Try regional patterns
    if (regionalPatterns[language]) {
      for (const pattern of regionalPatterns[language]) {
        let match;
        while ((match = pattern.exec(query)) !== null) {
          const value = parseFloat(match[1]);
          amounts.push({
            value,
            currency: "INR",
            rawText: match[0],
          });
        }
      }
    }
    
    return amounts;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTITY EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Extract quantities with units
   */
  public extractQuantities(query: string, language: Language): QuantityEntity[] {
    const quantities: QuantityEntity[] = [];
    
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram)/gi,
      /(\d+(?:\.\d+)?)\s*(g|gram|grams)/gi,
      /(\d+(?:\.\d+)?)\s*(l|litre|liter|litres|liters)/gi,
      /(\d+(?:\.\d+)?)\s*(ml|millilitre|milliliter)/gi,
      /(\d+(?:\.\d+)?)\s*(piece|pieces|pc|pcs)/gi,
      /(\d+(?:\.\d+)?)\s*(packet|packets|pack)/gi,
      /(\d+(?:\.\d+)?)\s*(box|boxes)/gi,
      /(\d+(?:\.\d+)?)\s*(bundle|bundles)/gi,
      /(\d+(?:\.\d+)?)\s*(dozen)/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        quantities.push({
          value: parseFloat(match[1]),
          unit: this.normalizeUnit(match[2]) as QuantityEntity["unit"],
          rawText: match[0],
        });
      }
    }
    
    // Number words (one, two, three, etc.)
    const numberWords = this.extractNumberWords(query, language);
    quantities.push(...numberWords);
    
    return quantities;
  }
  
  /**
   * Extract number words (one, two, ஒரு, दो, etc.)
   */
  private extractNumberWords(query: string, language: Language): QuantityEntity[] {
    const numberWordMap: Record<string, number> = {
      // English
      "half": 0.5, "quarter": 0.25,
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
      "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "dozen": 12,
      
      // Tamil
      "ஒரு": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4, "ஐந்து": 5,
      "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9, "பத்து": 10,
      
      // Hindi
      "एक": 1, "ek": 1, "दो": 2, "do": 2, "तीन": 3, "teen": 3,
      "चार": 4, "char": 4, "पाँच": 5, "paanch": 5, "दस": 10, "das": 10,
      
      // Telugu
      "ఒక": 1, "okati": 1, "రెండు": 2, "rendu": 2, "మూడు": 3, "moodu": 3,
      "నాలుగు": 4, "naalugu": 4, "అయిదు": 5, "aidu": 5,
      
      // Kannada
      "ಒಂದು": 1, "ondu": 1, "ಎರಡು": 2, "eradu": 2, "ಮೂರು": 3, "mooru": 3,
      "ನಾಲ್ಕು": 4, "naalku": 4, "ಐದು": 5,
      
      // Malayalam
      "ഒന്ന്": 1, "onnu": 1, "രണ്ട്": 2, "randu": 2, "മൂന്ന്": 3, "moonnu": 3,
      "നാല്": 4, "naalu": 4, "അഞ്ച്": 5, "anchu": 5,
    };
    
    const quantities: QuantityEntity[] = [];
    
    for (const [word, value] of Object.entries(numberWordMap)) {
      if (query.includes(word.toLowerCase())) {
        quantities.push({
          value,
          unit: "piece", // Default unit
          rawText: word,
        });
      }
    }
    
    return quantities;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const entityExtractor = new EntityExtractor();

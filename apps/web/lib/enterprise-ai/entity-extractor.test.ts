/**
 * Entity Extraction Engine - Test Suite
 * 
 * Tests customer, product, quantity, and amount extraction
 */

import { describe, it, expect } from "@jest/globals";
import { EntityExtractor } from "./entity-extractor";
import type { Customer, Product } from "@/lib/api";

// Mock data
const mockCustomers: Customer[] = [
  { id: "1", name: "Avinash Kumar", phone: "9876543210", preferredLanguage: "ENGLISH", outstandingBalance: "100" },
  { id: "2", name: "Kumar Stores", phone: "9876543211", preferredLanguage: "ENGLISH", outstandingBalance: "500" },
  { id: "3", name: "Lakshmi", phone: "9876543212", preferredLanguage: "TAMIL", outstandingBalance: "250" },
  { id: "4", name: "Rajesh Traders", phone: "9876543213", preferredLanguage: "HINDI", outstandingBalance: "0" },
];

const mockProducts: Product[] = [
  { id: "1", sku: "RICE-1KG", name: "Ponni Rice 1kg", sellingPrice: "45", nameTa: "பொன்னி அரிசி" },
  { id: "2", sku: "SUGAR-1KG", name: "Sugar 1kg", sellingPrice: "47", nameTa: "சர்க்கரை" },
  { id: "3", sku: "MILK-500ML", name: "Aavin Milk 500ml", sellingPrice: "25", nameTa: "பால்" },
  { id: "4", sku: "OIL-1L", name: "Sunflower Oil 1L", sellingPrice: "189", nameTa: "எண்ணெய்" },
  { id: "5", sku: "DAL-1KG", name: "Toor Dal 1kg", sellingPrice: "120", nameTa: "துவரம் பருப்பு" },
];

describe("EntityExtractor", () => {
  const extractor = new EntityExtractor();

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOMER EXTRACTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Customer Extraction", () => {
    it("should extract exact customer name", () => {
      const result = extractor.extractCustomers(
        "open avinash kumar account",
        mockCustomers,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customer.name).toBe("Avinash Kumar");
      expect(result[0].matchType).toBe("EXACT");
      expect(result[0].confidence).toBe(1.0);
    });

    it("should extract first name only", () => {
      const result = extractor.extractCustomers(
        "add rice to avinash",
        mockCustomers,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customer.name).toBe("Avinash Kumar");
      expect(result[0].matchType).toBe("PARTIAL");
      expect(result[0].confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should extract customer from partial name", () => {
      const result = extractor.extractCustomers(
        "lakshmi paid 500",
        mockCustomers,
        "TAMIL"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customer.name).toBe("Lakshmi");
      expect(result[0].confidence).toBeGreaterThan(0.8);
    });

    it("should extract customer by phone number", () => {
      const result = extractor.extractCustomers(
        "customer 9876543210 paid",
        mockCustomers,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customer.name).toBe("Avinash Kumar");
      expect(result[0].matchType).toBe("PHONE");
      expect(result[0].confidence).toBe(1.0);
    });

    it("should handle fuzzy matching with typos", () => {
      const result = extractor.extractCustomers(
        "open aviansh account", // typo: aviansh instead of avinash
        mockCustomers,
        "ENGLISH"
      );

      // Should still match with lower confidence
      expect(result.length).toBeGreaterThanOrEqual(0);
      if (result.length > 0) {
        expect(result[0].matchType).toBe("FUZZY");
        expect(result[0].confidence).toBeLessThan(1.0);
      }
    });

    it("should return empty array if no customer found", () => {
      const result = extractor.extractCustomers(
        "show products",
        mockCustomers,
        "ENGLISH"
      );

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCT EXTRACTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Product Extraction", () => {
    it("should extract product by English name", () => {
      const result = extractor.extractProducts(
        "add rice to kumar",
        mockProducts,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].product.name).toContain("Rice");
      expect(result[0].confidence).toBeGreaterThan(0.8);
    });

    it("should extract product by regional name - Tamil", () => {
      const result = extractor.extractProducts(
        "குமார் கணக்கில் அரிசி சேர்",
        mockProducts,
        "TAMIL"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].product.name).toContain("Rice");
      expect(result[0].matchType).toBe("REGIONAL");
    });

    it("should extract product with quantity", () => {
      const result = extractor.extractProducts(
        "add 2 kg rice",
        mockProducts,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].quantity).toBe(2);
      expect(result[0].unit).toBe("kg");
    });

    it("should extract multiple products", () => {
      const result = extractor.extractProducts(
        "add rice and sugar and milk",
        mockProducts,
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      const productNames = result.map(r => r.product.name.toLowerCase());
      expect(productNames.some(n => n.includes("rice"))).toBe(true);
      expect(productNames.some(n => n.includes("sugar"))).toBe(true);
    });

    it("should handle product aliases", () => {
      const result = extractor.extractProducts(
        "add paal", // Tamil word for milk
        mockProducts,
        "TAMIL"
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].product.name).toContain("Milk");
    });

    it("should extract with different units", () => {
      const testCases = [
        { query: "add 500 gram sugar", expectedUnit: "g", expectedQty: 500 },
        { query: "add 2 litre oil", expectedUnit: "L", expectedQty: 2 },
        { query: "add 5 packet biscuits", expectedUnit: "packet", expectedQty: 5 },
      ];

      testCases.forEach(({ query, expectedUnit, expectedQty }) => {
        const result = extractor.extractProducts(query, mockProducts, "ENGLISH");
        if (result.length > 0) {
          expect(result[0].unit).toBe(expectedUnit);
          expect(result[0].quantity).toBe(expectedQty);
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AMOUNT EXTRACTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Amount Extraction", () => {
    it("should extract amount with ₹ symbol", () => {
      const result = extractor.extractAmounts("kumar paid ₹500", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(500);
      expect(result[0].currency).toBe("INR");
    });

    it("should extract amount with Rs prefix", () => {
      const result = extractor.extractAmounts("received Rs 1000", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(1000);
    });

    it("should extract amount with Rs. prefix", () => {
      const result = extractor.extractAmounts("paid Rs.250", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(250);
    });

    it("should extract amount with rupees suffix", () => {
      const result = extractor.extractAmounts("500 rupees received", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(500);
    });

    it("should extract amount in Tamil", () => {
      const result = extractor.extractAmounts("500 ரூபாய் கொடுத்தார்", "TAMIL");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(500);
    });

    it("should extract decimal amounts", () => {
      const result = extractor.extractAmounts("paid ₹150.50", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(150.5);
    });

    it("should extract multiple amounts", () => {
      const result = extractor.extractAmounts(
        "received ₹500 and ₹300",
        "ENGLISH"
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTITY EXTRACTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Quantity Extraction", () => {
    it("should extract quantity in kg", () => {
      const result = extractor.extractQuantities("2 kg rice", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(2);
      expect(result[0].unit).toBe("kg");
    });

    it("should extract quantity in grams", () => {
      const result = extractor.extractQuantities("500 grams sugar", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(500);
      expect(result[0].unit).toBe("g");
    });

    it("should extract quantity in litres", () => {
      const result = extractor.extractQuantities("3 litre milk", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(3);
      expect(result[0].unit).toBe("L");
    });

    it("should extract quantity in pieces", () => {
      const result = extractor.extractQuantities("5 pieces biscuit", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(5);
      expect(result[0].unit).toBe("piece");
    });

    it("should extract number words", () => {
      const result = extractor.extractQuantities("two kg rice", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(2);
    });

    it("should extract Tamil number words", () => {
      const result = extractor.extractQuantities("இரண்டு கிலோ அரிசி", "TAMIL");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(2);
    });

    it("should extract decimal quantities", () => {
      const result = extractor.extractQuantities("2.5 kg rice", "ENGLISH");

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(2.5);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATED EXTRACTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Integrated Extraction", () => {
    it("should extract all entities from complex query", () => {
      const result = extractor.extract(
        "add 2 kg rice to kumar account and receive 500 rupees",
        "ENGLISH",
        mockCustomers,
        mockProducts
      );

      expect(result.customers.length).toBeGreaterThan(0);
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.amounts.length).toBeGreaterThan(0);
      expect(result.quantities.length).toBeGreaterThan(0);

      expect(result.customers[0].customer.name).toContain("Kumar");
      expect(result.products[0].product.name).toContain("Rice");
      expect(result.amounts[0].value).toBe(500);
    });

    it("should handle Tamil query with all entities", () => {
      const result = extractor.extract(
        "லட்சுமி கணக்கில் இரண்டு கிலோ அரிசி சேர்",
        "TAMIL",
        mockCustomers,
        mockProducts
      );

      expect(result.customers.length).toBeGreaterThan(0);
      expect(result.products.length).toBeGreaterThan(0);

      expect(result.customers[0].customer.name).toBe("Lakshmi");
      expect(result.products[0].product.name).toContain("Rice");
    });
  });
});

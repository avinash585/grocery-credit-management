package com.grammart.ai;

import com.grammart.ai.AiDtos.ChatRequest;
import com.grammart.ai.AiDtos.ChatResponse;
import com.grammart.catalog.Product;
import com.grammart.catalog.ProductRepository;
import com.grammart.common.Language;
import com.grammart.customer.Customer;
import com.grammart.customer.CustomerRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Multilingual AI Assistant Service.
 *
 * <p>Responsibilities:
 * <ol>
 *   <li>Detect user language automatically (Tamil, Hindi, Telugu, Kannada, Malayalam,
 *       Tanglish, Hinglish, English)</li>
 *   <li>Respond in the SAME language the user used</li>
 *   <li>Understand regional grocery terms, slang, mixed-language sentences</li>
 *   <li>Fetch live data from MySQL to answer business queries</li>
 *   <li>Emit structured action blocks for executable operations</li>
 * </ol>
 */
@Service
public class AiAssistantService {

    private final RestClient restClient;
    private final String geminiApiKey;
    private final String geminiModel;

    // Optional: live data context
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public AiAssistantService(
            RestClient.Builder restClientBuilder,
            @Value("${app.ai.gemini-api-key:}") String geminiApiKey,
            @Value("${app.ai.gemini-model:gemini-1.5-flash}") String geminiModel,
            Optional<CustomerRepository> customerRepository,
            Optional<ProductRepository> productRepository
    ) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
        this.customerRepository = customerRepository.orElse(null);
        this.productRepository = productRepository.orElse(null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> summarizeDailyBusiness(BigDecimal sales, BigDecimal credit, BigDecimal payments) {
        BigDecimal netCash = sales.subtract(credit).add(payments);
        return Map.of(
                "summary",        "Today cash movement is Rs." + netCash + ". Credit needs follow-up if it exceeds payments.",
                "netCash",        netCash,
                "recommendation", credit.compareTo(payments) > 0
                        ? "Send reminders to high-balance customers."
                        : "Credit collections are healthy today."
        );
    }

    public ChatResponse chat(ChatRequest request) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return new ChatResponse(localFallback(request), false);
        }
        try {
            // Build live data summaries from MySQL
            String customerContext = buildCustomerContext(request);
            String productContext  = buildProductContext(request);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", geminiApiKey)
                            .build(geminiModel))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "contents", List.of(Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", buildPrompt(request, customerContext, productContext)))
                            )),
                            "generationConfig", Map.of(
                                    "temperature", 0.3,
                                    "maxOutputTokens", 600
                            )
                    ))
                    .retrieve()
                    .body(Map.class);

            String answer = extractText(response);
            return new ChatResponse(answer == null || answer.isBlank() ? localFallback(request) : answer, true);
        } catch (RuntimeException ex) {
            System.err.println("AI chat failed: " + ex.getMessage());
            return new ChatResponse(localFallback(request), false);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Prompt builder
    // ─────────────────────────────────────────────────────────────────────────

    private String buildPrompt(ChatRequest request, String customerContext, String productContext) {
        String language = request.language() == null ? "AUTO" : request.language().name();

        return """
                You are GramMart AI (ग्रामीण किराना AI | கிராம் கிரானா AI), the primary AI assistant
                for Indian rural kirana/grocery shopkeepers.
                
                ═══════════════════════════════════════════════════════════════
                MULTILINGUAL RESPONSE RULES (MANDATORY)
                ═══════════════════════════════════════════════════════════════
                1. AUTO-DETECT the language the user spoke or typed.
                   - If the user writes in Tamil script → reply fully in Tamil.
                   - If the user writes in Hindi script → reply fully in Hindi.
                   - If the user writes in Telugu script → reply fully in Telugu.
                   - If the user writes in Kannada script → reply fully in Kannada.
                   - If the user writes in Malayalam script → reply fully in Malayalam.
                   - If the user mixes Tamil + English (Tanglish) → reply in Tanglish.
                   - If the user mixes Hindi + English (Hinglish) → reply in Hinglish.
                   - If the user writes fully in English → reply in English.
                   - NEVER change the language unless the user changes first.
                   - Configured language hint: %s (use this only as a tiebreaker)
                
                2. NEVER reply with "I don't understand" just because of language mixing.
                   Always try to understand regional grocery terms, slang, and local names.
                
                ═══════════════════════════════════════════════════════════════
                REGIONAL GROCERY KNOWLEDGE
                ═══════════════════════════════════════════════════════════════
                Regional product aliases (understand all of these):
                - Rice: அரிசி (arisi), चावल (chawal), బియ్యం, ಅಕ್ಕಿ, അരി
                - Sugar: சர்க்கரை (sakkarai), चीनी (chini), చక్కెర, ಸಕ್ಕರೆ, പഞ്ചസാര
                - Oil: எண்ணெய் (ennai), तेल (tel), నూనె, ಎಣ್ಣೆ, എണ്ണ
                - Dal/Lentils: பருப்பு (paruppu), दाल (dal), పప్పు, ಬೇಳೆ, പരിപ്പ്
                - Milk: பால் (paal), दूध (doodh), పాలు, ಹಾಲು, പാൽ
                - Salt: உப்பு (uppu), नमक (namak), ఉప్పు, ಉಪ್ಪು, ഉപ്പ്
                - Turmeric: மஞ்சள் (manjal), हल्दी (haldi), పసుపు, ಅರಿಶಿನ, മഞ്ഞൾ
                
                Units: கிலோ/kg, லிட்டர்/liter, பாக்கெட்/packet, கட்டு/bundle
                
                ═══════════════════════════════════════════════════════════════
                BUSINESS LOGIC RULES
                ═══════════════════════════════════════════════════════════════
                1. CREDIT RISK: If a customer owes > Rs.400, politely warn before extending more credit.
                2. PRODUCT QUERIES: Answer price/stock from the live catalog below. Do NOT create credit.
                3. ACTION SAFETY: Only emit an action block for explicit operations (add credit, receive
                   payment, open account, send reminder). Product price/stock questions → answer only.
                4. LIVE DATA: Always use the MySQL data provided below. Never return hardcoded guesses.
                
                ═══════════════════════════════════════════════════════════════
                ACTION BLOCK INSTRUCTIONS
                ═══════════════════════════════════════════════════════════════
                When the user's intent is clearly an executable operation, append ONE action block
                at the very end of your response (after your natural language reply) in this format:
                
                ```action
                { "intent": "INTENT_NAME", "customerName": "...", "productAlias": "...", "quantity": "...", "amount": 0 }
                ```
                
                Supported intents:
                - OPEN_CUSTOMER   → { "intent": "OPEN_CUSTOMER",   "customerName": "..." }
                - ADD_PURCHASE    → { "intent": "ADD_PURCHASE",    "customerName": "...", "productAlias": "...", "quantity": "..." }
                - RECEIVE_PAYMENT → { "intent": "RECEIVE_PAYMENT", "customerName": "...", "amount": 500 }
                - SEND_REMINDER   → { "intent": "SEND_REMINDER",   "customerName": "..." }
                - SHOW_REPORT     → { "intent": "SHOW_REPORT" }
                - ASK_BALANCE     → { "intent": "ASK_BALANCE",     "customerName": "..." }
                
                ═══════════════════════════════════════════════════════════════
                LIVE CONTEXT FROM MySQL
                ═══════════════════════════════════════════════════════════════
                Active Customer: %s
                Current Outstanding Balance: Rs. %s
                Last Voice Transcript: "%s"
                
                %s
                %s
                
                ═══════════════════════════════════════════════════════════════
                USER MESSAGE
                ═══════════════════════════════════════════════════════════════
                %s
                """.formatted(
                language,
                safe(request.customerName(), "None selected"),
                safe(request.outstandingBalance(), "0"),
                safe(request.transcript(), "None"),
                customerContext,
                productContext,
                safe(request.message(), "Give me guidance for today")
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Live MySQL context builders
    // ─────────────────────────────────────────────────────────────────────────

    private String buildCustomerContext(ChatRequest request) {
        // Try request-provided customers first (frontend passes them)
        if (request.customers() != null && !request.customers().isEmpty()) {
            String lines = request.customers().stream()
                    .map(c -> "  - " + c.name() + ": Rs." + c.outstandingBalance() + " pending")
                    .collect(Collectors.joining("\n"));
            return "All customer balances (from request):\n" + lines;
        }

        // Fall back to live DB query
        if (customerRepository != null) {
            try {
                List<Customer> customers = customerRepository.findAll();
                if (!customers.isEmpty()) {
                    String lines = customers.stream()
                            .map(c -> "  - " + c.getName() + ": Rs." + c.getOutstandingBalance() + " pending")
                            .collect(Collectors.joining("\n"));
                    return "All customer balances (live from MySQL):\n" + lines;
                }
            } catch (Exception e) {
                System.err.println("AI: Could not fetch customers from DB: " + e.getMessage());
            }
        }
        return "";
    }

    private String buildProductContext(ChatRequest request) {
        // Try request-provided products first
        if (request.products() != null && !request.products().isEmpty()) {
            String lines = request.products().stream()
                    .map(p -> "  - " + p.name() + " (SKU: " + p.sku() + ") @ Rs." + p.sellingPrice())
                    .collect(Collectors.joining("\n"));
            return "Product catalog (from request):\n" + lines;
        }

        // Fall back to live DB query
        if (productRepository != null) {
            try {
                List<Product> products = productRepository.findAll().stream()
                        .filter(Product::isEnabled)
                        .collect(Collectors.toList());
                if (!products.isEmpty()) {
                    String lines = products.stream()
                            .map(p -> "  - " + p.getNameEn()
                                    + (p.getNameTa() != null ? " / " + p.getNameTa() : "")
                                    + (p.getNameHi() != null ? " / " + p.getNameHi() : "")
                                    + " @ Rs." + p.getSellingPrice()
                                    + " (stock: " + p.getStockQuantity() + " " + p.getUnit() + ")")
                            .collect(Collectors.joining("\n"));
                    return "Product catalog (live from MySQL):\n" + lines;
                }
            } catch (Exception e) {
                System.err.println("AI: Could not fetch products from DB: " + e.getMessage());
            }
        }
        return "";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallback (no Gemini API key)
    // ─────────────────────────────────────────────────────────────────────────

    private String localFallback(ChatRequest request) {
        Language lang = request.language() == null ? Language.ENGLISH : request.language();
        String customer = safe(request.customerName(), "this customer");
        String balance  = safe(request.outstandingBalance(), "0");

        return switch (lang) {
            case TAMIL     -> customer + " கணக்கில் Rs." + balance + " நிலுவை உள்ளது. பணம் பெற்றால் 'Payment' அழுத்தவும்.";
            case HINDI     -> customer + " का Rs." + balance + " बकाया है। पैसे मिलने पर 'Payment' दबाएं।";
            case TELUGU    -> customer + " ఖాతాలో Rs." + balance + " బాకీ ఉంది. పైసలు వస్తే 'Payment' నొక్కండి.";
            case KANNADA   -> customer + " ಖಾತೆಯಲ್ಲಿ Rs." + balance + " ಬಾಕಿ ಇದೆ. ಹಣ ಬಂದಾಗ 'Payment' ಒತ್ತಿರಿ.";
            case MALAYALAM -> customer + " അക്കൗണ്ടിൽ Rs." + balance + " ബാക്കിയുണ്ട്. പണം കിട്ടിയാൽ 'Payment' അമർത്തുക.";
            case TANGLISH  -> customer + " account-la Rs." + balance + " pending. Paidam vaangina 'Payment' click pannunga.";
            case HINGLISH  -> customer + " ke account mein Rs." + balance + " baaki hai. Paisa mile to 'Payment' press karo.";
            default        -> customer + " has Rs." + balance + " pending. Use Payment when money is received.";
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) return null;
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return null;
        var content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return null;
        var parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return null;
        Object text = parts.get(0).get("text");
        return text == null ? null : text.toString();
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

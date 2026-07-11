package com.grammart.ai;

import com.grammart.common.Language;
import java.util.List;

public final class AiDtos {
    private AiDtos() {}

    /** Customer summary passed in the request payload for live context. */
    public record CustomerSummary(String name, String outstandingBalance) {}

    /** Product summary passed in the request payload for live context. */
    public record ProductSummary(String name, String sku, String sellingPrice) {}

    /**
     * Chat request from the frontend.
     *
     * @param message            The user's natural language query (any Indian language)
     * @param language           Optional language hint; AUTO = detect automatically
     * @param customerName       Currently open customer name (or null)
     * @param outstandingBalance Currently open customer's outstanding balance (or null)
     * @param transcript         Last voice transcript (or null)
     * @param customers          Full list of customer balances for live context (optional)
     * @param products           Product catalog for live context (optional)
     */
    public record ChatRequest(
            String message,
            Language language,
            String customerName,
            String outstandingBalance,
            String transcript,
            List<CustomerSummary> customers,
            List<ProductSummary> products
    ) {}

    /**
     * Chat response to the frontend.
     *
     * @param answer           Natural language reply in the user's language
     * @param live             True if the answer came from the LLM (not a local fallback)
     * @param detectedLanguage The language detected from the user's message
     */
    public record ChatResponse(String answer, boolean live, String detectedLanguage) {
        /** Compact constructor — detectedLanguage defaults to UNKNOWN */
        public ChatResponse(String answer, boolean live) {
            this(answer, live, "UNKNOWN");
        }
    }
}

package com.grammart.ai;

import com.grammart.ai.AiDtos.ChatRequest;
import com.grammart.ai.AiDtos.ChatResponse;
import com.grammart.common.Language;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiAssistantService {
    private final RestClient restClient;
    private final String geminiApiKey;
    private final String geminiModel;

    public AiAssistantService(
            RestClient.Builder restClientBuilder,
            @Value("${app.ai.gemini-api-key:}") String geminiApiKey,
            @Value("${app.ai.gemini-model:gemini-1.5-flash}") String geminiModel
    ) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
    }

    public Map<String, Object> summarizeDailyBusiness(BigDecimal sales, BigDecimal credit, BigDecimal payments) {
        BigDecimal netCash = sales.subtract(credit).add(payments);
        return Map.of(
                "summary", "Today cash movement is Rs." + netCash + ". Credit needs follow-up if it exceeds payments.",
                "netCash", netCash,
                "recommendation", credit.compareTo(payments) > 0 ? "Send reminders to high-balance customers." : "Credit collections are healthy today."
        );
    }

    public ChatResponse chat(ChatRequest request) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return new ChatResponse(localFallback(request), false);
        }

        try {
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
                                    "parts", List.of(Map.of("text", buildPrompt(request)))
                            )),
                            "generationConfig", Map.of(
                                    "temperature", 0.35,
                                    "maxOutputTokens", 500
                            )
                    ))
                    .retrieve()
                    .body(Map.class);
            String answer = extractText(response);
            return new ChatResponse(answer == null || answer.isBlank() ? localFallback(request) : answer, true);
        } catch (RuntimeException ex) {
            return new ChatResponse(localFallback(request), false);
        }
    }

    private String buildPrompt(ChatRequest request) {
        String language = request.language() == null ? "ENGLISH" : request.language().name();
        return """
                You are GramMart AI, a helpful assistant for Indian village grocery and kirana shopkeepers.
                Reply in the user's selected language: %s.
                Keep answers simple, practical, and short. Use rupees for money.
                Help with credit, customer reminders, billing, product stock, and daily shop decisions.

                Current customer: %s
                Outstanding balance: %s
                Last voice transcript: %s

                Shopkeeper question: %s
                """.formatted(
                language,
                safe(request.customerName(), "No customer selected"),
                safe(request.outstandingBalance(), "0"),
                safe(request.transcript(), "None"),
                safe(request.message(), "Give me today guidance")
        );
    }

    private String localFallback(ChatRequest request) {
        String customer = safe(request.customerName(), "this customer");
        String balance = safe(request.outstandingBalance(), "0");
        Language language = request.language() == null ? Language.ENGLISH : request.language();
        String languageName = switch (language) {
            case TAMIL -> "Tamil";
            case HINDI -> "Hindi";
            case TELUGU -> "Telugu";
            case KANNADA -> "Kannada";
            case MALAYALAM -> "Malayalam";
            default -> "English";
        };
        if (language == Language.ENGLISH) {
            return customer + " has Rs." + balance + " pending. Use Payment when money is received, or choose Product for a credit sale.";
        }
        return customer + " has Rs." + balance + " pending. Gemini will answer in " + languageName + " when GEMINI_API_KEY is configured.";
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) {
            return null;
        }
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }
        var content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            return null;
        }
        var parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            return null;
        }
        Object text = parts.get(0).get("text");
        return text == null ? null : text.toString();
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

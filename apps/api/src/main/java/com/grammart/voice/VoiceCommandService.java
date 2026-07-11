package com.grammart.voice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grammart.common.Language;
import com.grammart.voice.VoiceDtos.VoiceCommandResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class VoiceCommandService {
    private static final Pattern MONEY = Pattern.compile("(?:rs\\.?|rupees?|₹)?\\s*(\\d+(?:\\.\\d{1,2})?)", Pattern.CASE_INSENSITIVE);

    private final String geminiApiKey;
    private final String geminiModel;
    private final RestClient restClient;

    public VoiceCommandService() {
        this.restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = "";
        this.geminiModel = "gemini-1.5-flash";
    }

    public VoiceCommandService(
            RestClient.Builder restClientBuilder,
            @Value("${app.ai.gemini-api-key:}") String geminiApiKey,
            @Value("${app.ai.gemini-model:gemini-1.5-flash}") String geminiModel
    ) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
    }

    public VoiceCommandResponse parse(String transcript) {
        return parse(transcript, Language.ENGLISH);
    }

    public VoiceCommandResponse parse(String transcript, Language language) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return localParse(transcript);
        }

        try {
            String prompt = String.format("""
                    You are an expert NLP parser for an Indian kirana/grocery credit book app.
                    Analyze the following voice command transcript spoken by a shopkeeper.
                    Transcript: "%s"
                    Selected language context: %s

                    Identify the user intent. Supported intents:
                    - OPEN_CUSTOMER: Open/view a customer's account/details (e.g. "open Kumar Stores", "கணக்கை திற குமார்")
                    - ASK_BALANCE: Find out how much a customer owes (e.g. "Kumar stores owes how much?", "குமார் எவ்வளவு நிலுவை வைத்துள்ளார்?")
                    - RECEIVE_PAYMENT: Settle balance/receive money from a customer (e.g. "Kumar Stores paid 500 rupees", "குமார் கணக்கு 500 ரூபாய் பணம் பெற்றேன்")
                    - ADD_PURCHASE: Record a new credit sale purchase (e.g. "Add 2 kg sugar for Kumar Stores", "குமார் கணக்கில் 500 ரூபாய் சர்க்கரை கடன் சேர்")
                    - SEND_REMINDER: Send a payment reminder to a customer (e.g. "send sms to Kumar", "நினைவூட்டல் அனுப்பு குமார்")
                    - SHOW_REPORT: View today sales report (e.g. "show today report", "இன்று விற்பனை அறிக்கை காட்டு")
                    - UNDO: Revert last action/delete last item (e.g. "undo last", "தவறு")
                    - CANCEL: Cancel current billing/transaction (e.g. "cancel", "வேண்டாம்")
                    - CONFIRM: Confirm payment or save credit bill (e.g. "confirm", "சேமி", "சரி")

                    Extract these properties if applicable:
                    - customerName: The name of the customer mentioned (e.g., "Kumar Stores", "குமார்"). Do not include verbs or stop words.
                    - productAlias: If recording a purchase, specify the product (choose one: "rice", "sugar", "oil", "dal" or null). Map local terms (e.g. "சர்க்கரை" or "चीनी" -> "sugar", "அரிசி" or "चावल" -> "rice", "எண்ணெய்" or "तेल" -> "oil").
                    - amount: The monetary value/rupees mentioned in the transcript as a decimal number (e.g., 500.00) or null.
                    - quantity: The quantity of product mentioned (e.g. "2 kg", "1 liter") or null.

                    Return ONLY a valid JSON object matching this schema:
                    {
                      "intent": "OPEN_CUSTOMER" | "ASK_BALANCE" | "RECEIVE_PAYMENT" | "ADD_PURCHASE" | "SEND_REMINDER" | "SHOW_REPORT" | "UNDO" | "CANCEL" | "CONFIRM" | "UNKNOWN",
                      "customerName": string | null,
                      "productAlias": string | null,
                      "amount": number | null,
                      "quantity": string | null
                    }
                    """, transcript, language.name());

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
                                    "parts", List.of(Map.of("text", prompt))
                            )),
                            "generationConfig", Map.of(
                                    "temperature", 0.1,
                                    "maxOutputTokens", 200
                            )
                    ))
                    .retrieve()
                    .body(Map.class);

            String text = extractText(response);
            if (text == null || text.isBlank()) {
                return localParse(transcript);
            }

            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> map = mapper.readValue(text, Map.class);
            String intentStr = (String) map.get("intent");
            VoiceIntent intent = VoiceIntent.UNKNOWN;
            try {
                intent = VoiceIntent.valueOf(intentStr);
            } catch (Exception e) {}
            String customerName = (String) map.get("customerName");
            String productAlias = (String) map.get("productAlias");
            BigDecimal amount = null;
            Object amountObj = map.get("amount");
            if (amountObj != null) {
                amount = new BigDecimal(amountObj.toString());
            }
            String quantity = (String) map.get("quantity");
            return response(intent, customerName, productAlias, amount, quantity);
        } catch (Exception e) {
            return localParse(transcript);
        }
    }

    private VoiceCommandResponse localParse(String transcript) {
        String normalized = transcript.toLowerCase(Locale.ROOT).trim();
        if (containsAny(normalized, "undo", "last item remove", "delete last")) {
            return response(VoiceIntent.UNDO, null, null, null, null);
        }
        if (containsAny(normalized, "confirm", "ok bill", "bill podu", "save bill")) {
            return response(VoiceIntent.CONFIRM, null, null, null, null);
        }
        if (containsAny(normalized, "cancel", "vendam", "raddhu")) {
            return response(VoiceIntent.CANCEL, null, null, null, null);
        }
        if (containsAny(normalized, "receive", "payment", "paid", "vasool", "கட்டணம்", "भुगतान")) {
            return response(VoiceIntent.RECEIVE_PAYMENT, extractName(normalized), null, extractMoney(normalized), null);
        }
        if (containsAny(normalized, "price", "rate", "cost", "mrp")) {
            return response(VoiceIntent.GET_PRODUCT_PRICE, null, extractProduct(normalized), null, extractQuantity(normalized));
        }
        if (containsAny(normalized, "stock", "available", "availability")) {
            return response(VoiceIntent.GET_STOCK, null, extractProduct(normalized), null, extractQuantity(normalized));
        }
        if (containsAny(normalized, "owe", "balance", "evlo", "kitna", "எவ்வளவு", "कितना")) {
            return response(VoiceIntent.ASK_BALANCE, extractName(normalized), null, null, null);
        }
        if (containsAny(normalized, "open", "account", "கணக்கு", "khata")) {
            return response(VoiceIntent.OPEN_CUSTOMER, extractName(normalized), null, null, null);
        }
        if (containsAny(normalized, "add", "kg", "packet", "liter", "litre", "milk", "paal", "doodh", "arisi", "rice", "chawal")) {
            return response(VoiceIntent.ADD_PURCHASE, extractName(normalized), extractProduct(normalized), extractMoney(normalized), extractQuantity(normalized));
        }
        if (containsAny(normalized, "reminder", "sms", "message")) {
            return response(VoiceIntent.SEND_REMINDER, extractName(normalized), null, null, null);
        }
        if (containsAny(normalized, "sales", "report", "today")) {
            return response(VoiceIntent.SHOW_REPORT, null, null, null, null);
        }
        return response(VoiceIntent.UNKNOWN, null, null, null, null);
    }

    private VoiceCommandResponse response(VoiceIntent intent, String customerName, String productAlias, BigDecimal amount, String quantity) {
        return new VoiceCommandResponse(intent, customerName, productAlias, amount, quantity, Map.of("confidence", intent == VoiceIntent.UNKNOWN ? 0.2 : 0.82));
    }

    private boolean containsAny(String text, String... tokens) {
        for (String token : tokens) {
            if (text.contains(token)) {
                return true;
            }
        }
        return false;
    }

    private BigDecimal extractMoney(String text) {
        Matcher matcher = MONEY.matcher(text);
        return matcher.find() ? new BigDecimal(matcher.group(1)) : null;
    }

    private String extractQuantity(String text) {
        Matcher matcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(kg|kilogram|packet|liter|litre|l)").matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractProduct(String text) {
        for (String alias : new String[]{"milk", "paal", "doodh", "arisi", "rice", "chawal", "sugar", "oil", "dal", "noodles", "maggi"}) {
            if (text.contains(alias)) {
                if (alias.equals("paal") || alias.equals("doodh")) return "milk";
                if (alias.equals("arisi") || alias.equals("chawal")) return "rice";
                if (alias.equals("maggi")) return "noodles";
                return alias;
            }
        }
        return null;
    }

    private String extractName(String text) {
        String[] stopWords = {"open", "account", "receive", "payment", "paid", "balance", "owe", "add", "send", "reminder"};
        String candidate = text;
        for (String stopWord : stopWords) {
            candidate = candidate.replace(stopWord, " ");
        }
        candidate = candidate.replaceAll("\\d+(?:\\.\\d+)?", " ").replaceAll("\\s+", " ").trim();
        return candidate.isBlank() ? null : candidate;
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
}

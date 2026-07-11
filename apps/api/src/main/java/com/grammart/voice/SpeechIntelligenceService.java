package com.grammart.voice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grammart.catalog.Product;
import com.grammart.catalog.ProductRepository;
import com.grammart.common.Language;
import com.grammart.customer.Customer;
import com.grammart.customer.CustomerRepository;
import com.grammart.voice.VoiceDtos.VoiceCommandResponse;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SpeechIntelligenceService {
    private final Map<String, Map<String, Object>> languagePacks = new HashMap<>();
    private final ShopAliasRepository shopAliasRepository;
    private final VoiceLogRepository voiceLogRepository;
    private final SpeechCommandRepository speechCommandRepository;
    private final LearningHistoryRepository learningHistoryRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    private final String geminiApiKey;
    private final String geminiModel;
    private final RestClient restClient;

    public SpeechIntelligenceService(
            ShopAliasRepository shopAliasRepository,
            VoiceLogRepository voiceLogRepository,
            SpeechCommandRepository speechCommandRepository,
            LearningHistoryRepository learningHistoryRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            RestClient.Builder restClientBuilder,
            @Value("${app.ai.gemini-api-key:}") String geminiApiKey,
            @Value("${app.ai.gemini-model:gemini-1.5-flash}") String geminiModel
    ) {
        this.shopAliasRepository = shopAliasRepository;
        this.voiceLogRepository = voiceLogRepository;
        this.speechCommandRepository = speechCommandRepository;
        this.learningHistoryRepository = learningHistoryRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
    }

    public SpeechIntelligenceService() {
        this.shopAliasRepository = null;
        this.voiceLogRepository = null;
        this.speechCommandRepository = null;
        this.learningHistoryRepository = null;
        this.customerRepository = null;
        this.productRepository = null;
        this.restClient = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiApiKey = "";
        this.geminiModel = "gemini-1.5-flash";
    }

    @PostConstruct
    public void loadLanguagePacks() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath*:knowledge/**/*.json");
            for (Resource resource : resources) {
                String path = resource.getURL().getPath();
                if (!path.contains("knowledge/")) {
                    continue;
                }
                String[] segments = path.split("knowledge/")[1].split("/");
                String language = segments[0].toUpperCase();
                String filename = segments[1].replace(".json", "");

                try (InputStream is = resource.getInputStream()) {
                    Object data = mapper.readValue(is, Object.class);
                    languagePacks.computeIfAbsent(language, k -> new HashMap<>()).put(filename, data);
                }
            }
            System.out.println("Speech Intelligence Layer: Loaded " + languagePacks.size() + " language packs.");
        } catch (Exception e) {
            System.err.println("Speech Intelligence Layer: Failed to load language packs: " + e.getMessage());
        }
    }

    public Map<String, Map<String, Object>> getLanguagePacks() {
        return languagePacks;
    }

    public VoiceCommandResponse parse(String transcript) {
        return parse(transcript, Language.ENGLISH);
    }

    public VoiceCommandResponse parse(String transcript, Language language) {
        long startTime = System.currentTimeMillis();
        
        // 1. LLM parsing (primary production-grade parsing) if api-key is configured
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                VoiceCommandResponse response = parseWithLLM(transcript, language);
                logToDb(transcript, response, System.currentTimeMillis() - startTime);
                return response;
            } catch (Exception e) {
                System.err.println("Gemini Voice Parse failed, falling back to local pipeline: " + e.getMessage());
            }
        }

        // 2. Local fallback pipeline execution
        VoiceCommandResponse response = executeLocalPipeline(transcript, language);
        logToDb(transcript, response, System.currentTimeMillis() - startTime);
        return response;
    }

    private VoiceCommandResponse parseWithLLM(String transcript, Language language) throws Exception {
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
                - UNDO: Revert last action/delete last item (e.g. "undo last", "തവറു")
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
            throw new RuntimeException("Empty response from Gemini API");
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
        
        double confidence = intent == VoiceIntent.UNKNOWN ? 0.35 : 0.98;

        return new VoiceCommandResponse(intent, customerName, productAlias, amount, quantity, Map.of(
            "confidence", confidence,
            "detectedLanguage", language.name(),
            "normalizedText", transcript,
            "raw", transcript
        ));
    }

    private VoiceCommandResponse executeLocalPipeline(String transcript, Language fallbackLang) {
        // Step 1: Language Detection
        String detectedLang = detectLanguage(transcript, fallbackLang);
        Map<String, Object> pack = languagePacks.get(detectedLang);
        if (pack == null) {
            pack = languagePacks.get("ENGLISH");
        }

        // Step 2: Text Normalization
        String normalized = transcript.toLowerCase(Locale.ROOT).trim();
        normalized = normalized.replaceAll("[.,!?_\\-]", " ");

        // Step 3: Suffix Stripping
        if (pack != null && pack.containsKey("grammar")) {
            Map<String, Object> grammar = (Map<String, Object>) pack.get("grammar");
            List<String> suffixes = (List<String>) grammar.get("suffixesToStrip");
            if (suffixes != null) {
                String[] words = normalized.split("\\s+");
                for (int i = 0; i < words.length; i++) {
                    for (String suffix : suffixes) {
                        if (words[i].endsWith(suffix) && words[i].length() > suffix.length() + 2) {
                            words[i] = words[i].substring(0, words[i].length() - suffix.length());
                        }
                    }
                }
                normalized = String.join(" ", words);
            }
        }

        // Step 4: Slang translation
        if (pack != null && pack.containsKey("slang")) {
            Map<String, String> slangs = (Map<String, String>) pack.get("slang");
            for (Map.Entry<String, String> slang : slangs.entrySet()) {
                normalized = normalized.replaceAll("\\b" + slang.getKey() + "\\b", slang.getValue());
            }
        }

        // Step 5: Intent Recognition
        VoiceIntent intent = VoiceIntent.UNKNOWN;
        if (containsAny(normalized, "price", "rate", "cost", "mrp")) {
            intent = VoiceIntent.GET_PRODUCT_PRICE;
        } else if (containsAny(normalized, "stock", "available", "availability")) {
            intent = VoiceIntent.GET_STOCK;
        }
        if (pack != null && pack.containsKey("actions")) {
            Map<String, List<String>> actions = (Map<String, List<String>>) pack.get("actions");
            if (intent == VoiceIntent.UNKNOWN) {
                for (Map.Entry<String, List<String>> action : actions.entrySet()) {
                    for (String trigger : action.getValue()) {
                        if (normalized.contains(trigger)) {
                            try {
                                intent = VoiceIntent.valueOf(action.getKey());
                                break;
                            } catch (Exception e) {}
                        }
                    }
                    if (intent != VoiceIntent.UNKNOWN) break;
                }
            }
        }

        // Step 6: Entity Extraction
        BigDecimal amount = extractAmount(normalized, pack);
        String quantity = extractQuantity(normalized, pack);
        ProductResolution productResolution = resolveProduct(normalized, pack);
        String productAlias = productResolution.productAlias();
        String customerName = extractCustomerName(normalized, pack, intent);

        // Step 7: Confidence scoring
        double confidence = productResolution.confidence();
        if (intent != VoiceIntent.UNKNOWN && confidence < 0.5) {
            confidence += 0.25;
        }
        if (intent == VoiceIntent.ADD_PURCHASE && productAlias != null && quantity != null) confidence = Math.max(confidence, 0.92);
        if ((intent == VoiceIntent.GET_PRODUCT_PRICE || intent == VoiceIntent.GET_STOCK) && productAlias != null) confidence = Math.max(confidence, 0.99);
        if (intent == VoiceIntent.RECEIVE_PAYMENT && amount != null) confidence = Math.max(confidence, 0.9);
        if (productAlias == null && (intent == VoiceIntent.GET_PRODUCT_PRICE || intent == VoiceIntent.GET_STOCK || intent == VoiceIntent.ADD_PURCHASE)) {
            confidence = Math.min(confidence, 0.89);
        }
        confidence = Math.min(confidence, 0.99);

        return new VoiceCommandResponse(intent, customerName, productAlias, amount, quantity, Map.of(
            "confidence", confidence,
            "detectedLanguage", detectedLang,
            "normalizedText", normalized,
            "raw", transcript,
            "unit", Optional.ofNullable(extractUnit(normalized)).orElse(""),
            "alternatives", productResolution.alternatives()
        ));
    }

    private String detectLanguage(String transcript, Language fallbackLang) {
        String match = fallbackLang.name();
        int maxHits = 0;
        String normalized = transcript.toLowerCase(Locale.ROOT);

        for (Map.Entry<String, Map<String, Object>> packEntry : languagePacks.entrySet()) {
            int hits = 0;
            Map<String, Object> pack = packEntry.getValue();

            // Check Actions
            if (pack.containsKey("actions")) {
                Map<String, List<String>> actions = (Map<String, List<String>>) pack.get("actions");
                for (List<String> triggers : actions.values()) {
                    for (String trigger : triggers) {
                        if (normalized.contains(trigger)) hits++;
                    }
                }
            }

            // Check Slang
            if (pack.containsKey("slang")) {
                Map<String, String> slangs = (Map<String, String>) pack.get("slang");
                for (String slangKey : slangs.keySet()) {
                    if (normalized.contains(slangKey)) hits++;
                }
            }

            if (hits > maxHits) {
                maxHits = hits;
                match = packEntry.getKey();
            }
        }

        return match;
    }

    private BigDecimal extractAmount(String text, Map<String, Object> pack) {
        Matcher matcher = Pattern.compile("(?:rs\\.?|rupees?|₹|రూപాయలు|रुपये|ரூபாய்|കട്ടണം)?\\s*(\\d+(?:\\.\\d{1,2})?)", Pattern.CASE_INSENSITIVE).matcher(text);
        if (matcher.find()) {
            return new BigDecimal(matcher.group(1));
        }
        return null;
    }

    private String extractQuantity(String text, Map<String, Object> pack) {
        Matcher matcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(kg|kilo|kilogram|packet|liter|litre|l|பாக்கெட்|லிட்டர்|കിലോ|ಲೀಟರ್)").matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractUnit(String text) {
        Matcher matcher = Pattern.compile("\\b(kg|kilo|kilogram|g|gram|packet|pack|liter|litre|litres|liters|l|ml|piece|pc)\\b").matcher(text);
        return matcher.find() ? matcher.group(1) : null;
    }

    private boolean containsAny(String text, String... tokens) {
        for (String token : tokens) {
            if (text.contains(token)) return true;
        }
        return false;
    }

    private ProductResolution resolveProduct(String text, Map<String, Object> pack) {
        List<ProductCandidate> candidates = new ArrayList<>();
        if (productRepository != null) {
            try {
                for (Product product : productRepository.findAll()) {
                    if (!product.isEnabled()) continue;
                    ProductCandidate candidate = scoreProduct(text, product.getNameEn(), productTerms(product));
                    if (candidate.score() > 0) candidates.add(candidate);
                }
            } catch (RuntimeException ignored) {
            }
        }
        if (candidates.isEmpty() && pack != null && pack.containsKey("products")) {
            List<Map<String, Object>> productsList = (List<Map<String, Object>>) pack.get("products");
            for (Map<String, Object> product : productsList) {
                String id = String.valueOf(product.get("id"));
                List<String> aliases = (List<String>) product.get("aliases");
                ProductCandidate candidate = scoreProduct(text, id, aliases == null ? List.of(id) : aliases);
                if (candidate.score() > 0) candidates.add(candidate);
            }
        }
        candidates.sort(Comparator.comparingDouble(ProductCandidate::score).reversed());
        if (candidates.isEmpty()) return new ProductResolution(null, 0.0, List.of());
        ProductCandidate best = candidates.get(0);
        List<String> alternatives = candidates.stream()
                .filter(candidate -> !candidate.name().equals(best.name()) && best.score() - candidate.score() < 0.04)
                .map(ProductCandidate::name)
                .limit(3)
                .toList();
        if (best.score() < 0.9 || !alternatives.isEmpty()) {
            List<String> allAlternatives = new ArrayList<>();
            allAlternatives.add(best.name());
            allAlternatives.addAll(alternatives);
            return new ProductResolution(null, best.score(), allAlternatives);
        }
        return new ProductResolution(best.name(), best.score(), alternatives);
    }

    private ProductCandidate scoreProduct(String text, String productName, List<String> terms) {
        double score = 0.0;
        for (String rawTerm : terms) {
            if (rawTerm == null || rawTerm.isBlank()) continue;
            String term = normalizeTerm(rawTerm);
            if (term.length() < 2) continue;
            boolean exact = Pattern.compile("(^|\\s)" + Pattern.quote(term) + "(\\s|$)").matcher(text).find();
            if (exact) {
                score = Math.max(score, Math.min(0.99, 0.93 + Math.min(term.length(), 20) / 400.0));
                continue;
            }
            List<String> termTokens = Arrays.stream(term.split("\\s+")).filter(token -> token.length() > 2).toList();
            if (!termTokens.isEmpty() && termTokens.stream().allMatch(token -> Pattern.compile("(^|\\s)" + Pattern.quote(token) + "(\\s|$)").matcher(text).find())) {
                score = Math.max(score, termTokens.size() > 1 ? 0.92 : 0.9);
            }
        }
        return new ProductCandidate(productName, score);
    }

    private List<String> productTerms(Product product) {
        List<String> terms = new ArrayList<>();
        terms.add(product.getNameEn());
        terms.add(product.getNameTa());
        terms.add(product.getNameHi());
        terms.add(product.getNameTe());
        terms.add(product.getNameKn());
        terms.add(product.getNameMl());
        if (product.getBrand() != null) terms.add(product.getBrand() + " " + product.getNameEn());
        if (product.getAliases() != null) {
            terms.addAll(Arrays.stream(product.getAliases().replace("[", " ").replace("]", " ").replace("\"", " ").split("[,|;]"))
                    .map(String::trim)
                    .filter(alias -> !alias.isBlank())
                    .toList());
        }
        String normalizedName = normalizeTerm(product.getNameEn());
        if (normalizedName.contains("milk")) terms.addAll(List.of("milk", "paal", "doodh", "aavin milk", "amul milk", "nandini milk", "பால்"));
        if (normalizedName.contains("rice")) terms.addAll(List.of("rice", "arisi", "chawal", "அரிசி"));
        if (normalizedName.contains("sugar")) terms.addAll(List.of("sugar", "sakkarai", "chini", "cheeni", "சர்க்கரை"));
        if (normalizedName.contains("noodles") || normalizedName.contains("maggi")) terms.addAll(List.of("noodles", "maggi", "magi", "instant noodles"));
        return terms;
    }

    private String normalizeTerm(String text) {
        return text.toLowerCase(Locale.ROOT).trim().replaceAll("[.,!?_\\-]", " ").replaceAll("\\s+", " ");
    }

    private record ProductCandidate(String name, double score) {}
    private record ProductResolution(String productAlias, double confidence, List<String> alternatives) {}

    private String extractProductAlias(String text, Map<String, Object> pack) {
        if (pack != null && pack.containsKey("products")) {
            List<Map<String, Object>> productsList = (List<Map<String, Object>>) pack.get("products");
            for (Map<String, Object> prod : productsList) {
                List<String> aliases = (List<String>) prod.get("aliases");
                for (String alias : aliases) {
                    if (text.contains(alias)) {
                        return (String) prod.get("id");
                    }
                }
            }
        }
        return null;
    }

    private String extractCustomerName(String text, Map<String, Object> pack, VoiceIntent intent) {
        String clean = text;
        
        // Remove known numbers, units, amount values, and actions
        clean = clean.replaceAll("\\d+(?:\\.\\d+)?", " ");
        if (pack != null && pack.containsKey("actions")) {
            Map<String, List<String>> actions = (Map<String, List<String>>) pack.get("actions");
            for (List<String> triggers : actions.values()) {
                for (String trigger : triggers) {
                    clean = clean.replaceAll("\\b" + trigger + "\\b", " ");
                }
            }
        }
        
        clean = clean.replaceAll("\\b(kg|kilo|kilogram|packet|liter|litre|l|rs|rupees|rupee|₹|kilos|liters|packets)\\b", " ");
        clean = clean.replaceAll("\\s+", " ").trim();
        
        if (clean.isBlank()) return null;

        // Strip grammar stop words/suffix leftovers
        if (pack != null && pack.containsKey("grammar")) {
            Map<String, Object> grammar = (Map<String, Object>) pack.get("grammar");
            List<String> suffixes = (List<String>) grammar.get("suffixesToStrip");
            if (suffixes != null) {
                for (String suffix : suffixes) {
                    if (clean.endsWith(suffix) && clean.length() > suffix.length()) {
                        clean = clean.substring(0, clean.length() - suffix.length());
                    }
                }
            }
        }

        // Match against database customer names
        if (customerRepository != null) {
            List<Customer> allCustomers = customerRepository.findAll();
            for (Customer c : allCustomers) {
                if (c.getName().toLowerCase().contains(clean.toLowerCase()) || clean.toLowerCase().contains(c.getName().toLowerCase())) {
                    return c.getName();
                }
            }
        }

        return clean;
    }

    private void logToDb(String raw, VoiceCommandResponse response, long elapsedMs) {
        if (voiceLogRepository == null || speechCommandRepository == null) return;
        try {
            double confScoreObj = (Double) response.slots().getOrDefault("confidence", 0.5);
            BigDecimal conf = BigDecimal.valueOf(confScoreObj);
            String lang = (String) response.slots().getOrDefault("detectedLanguage", "ENGLISH");

            VoiceLog log = new VoiceLog("demo-shop", raw, lang, conf, (int) elapsedMs);
            SpeechCommand cmd = new SpeechCommand(
                response.intent().name(),
                response.customerName(),
                response.productAlias(),
                response.amount(),
                response.quantity(),
                (String) response.slots().getOrDefault("unit", null),
                confScoreObj >= 0.95 ? "EXECUTED" : "PENDING_CONFIRMATION"
            );
            log.addSpeechCommand(cmd);

            voiceLogRepository.save(log);
            
            // Log to learning history if confidence is low and intent/words are unrecognizable
            if (response.intent() == VoiceIntent.UNKNOWN && learningHistoryRepository != null) {
                String normalized = (String) response.slots().getOrDefault("normalizedText", raw);
                learningHistoryRepository.save(new LearningHistory("demo-shop", normalized, null, false));
            }
        } catch (Exception e) {
            System.err.println("Speech Intelligence Layer: Failed to log voice transaction: " + e.getMessage());
        }
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

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
}

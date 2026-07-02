package com.grammart.voice;

import com.grammart.voice.VoiceDtos.VoiceCommandResponse;
import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class VoiceCommandService {
    private static final Pattern MONEY = Pattern.compile("(?:rs\\.?|rupees?|₹)?\\s*(\\d+(?:\\.\\d{1,2})?)", Pattern.CASE_INSENSITIVE);

    public VoiceCommandResponse parse(String transcript) {
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
        if (containsAny(normalized, "owe", "balance", "evlo", "kitna", "எவ்வளவு", "कितना")) {
            return response(VoiceIntent.ASK_BALANCE, extractName(normalized), null, null, null);
        }
        if (containsAny(normalized, "open", "account", "கணக்கு", "khata")) {
            return response(VoiceIntent.OPEN_CUSTOMER, extractName(normalized), null, null, null);
        }
        if (containsAny(normalized, "add", "kg", "packet", "liter", "arisi", "rice", "chawal")) {
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
        for (String alias : new String[]{"arisi", "rice", "chawal", "sugar", "oil", "dal"}) {
            if (text.contains(alias)) {
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
}


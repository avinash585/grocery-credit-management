package com.grammart.notification;

import com.grammart.common.Language;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class SmsTemplateService {
    public String paymentReceived(Language language, String shopName, BigDecimal amount, BigDecimal balance) {
        return switch (language) {
            case TAMIL -> shopName + ": Rs." + amount + " received. Balance Rs." + balance + ".";
            case HINDI -> shopName + ": Rs." + amount + " payment received. Balance Rs." + balance + ".";
            default -> shopName + ": Payment received Rs." + amount + ". Updated balance Rs." + balance + ".";
        };
    }
}


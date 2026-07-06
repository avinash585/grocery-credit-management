package com.grammart.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
@Primary
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "whatsapp")
public class WhatsAppSmsProvider implements SmsProvider {
    private static final Logger log = LoggerFactory.getLogger(WhatsAppSmsProvider.class);
    
    private final String phoneNumberId;
    private final String accessToken;
    private final RestTemplate restTemplate;

    public WhatsAppSmsProvider(
            @Value("${app.sms.whatsapp.phone-number-id}") String phoneNumberId,
            @Value("${app.sms.whatsapp.access-token}") String accessToken
    ) {
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void send(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.warn("Cannot send WhatsApp message: Target phone number is empty");
            return;
        }

        // WhatsApp numbers must be in international format without "+" (e.g. 919876543210)
        String cleanPhone = phoneNumber.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            log.warn("Cannot send WhatsApp message: Phone number '{}' is invalid", phoneNumber);
            return;
        }

        // Auto prepend India's code "91" if it is a local 10-digit number
        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }
        
        String url = "https://graph.facebook.com/v17.0/" + phoneNumberId + "/messages";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> body = Map.of(
            "messaging_product", "whatsapp",
            "recipient_type", "individual",
            "to", cleanPhone,
            "type", "text",
            "text", Map.of("preview_url", false, "body", message)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            var response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp message sent successfully to {}", cleanPhone);
            } else {
                log.error("Failed to send WhatsApp message to {}. Status: {}, Body: {}", 
                          cleanPhone, response.getStatusCode(), response.getBody());
            }
        } catch (Exception ex) {
            log.error("Exception occurred while sending WhatsApp message to {}", cleanPhone, ex);
        }
    }
}

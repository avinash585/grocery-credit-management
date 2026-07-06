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
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
@Primary
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "twilio")
public class TwilioSmsProvider implements SmsProvider {
    private static final Logger log = LoggerFactory.getLogger(TwilioSmsProvider.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final String contentSid;
    private final RestTemplate restTemplate;

    public TwilioSmsProvider(
            @Value("${app.sms.twilio.account-sid}") String accountSid,
            @Value("${app.sms.twilio.auth-token}") String authToken,
            @Value("${app.sms.twilio.from-number}") String fromNumber,
            @Value("${app.sms.twilio.content-sid:}") String contentSid
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.contentSid = contentSid;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void send(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.warn("Cannot send Twilio message: Target phone number is empty");
            return;
        }

        // Format to international format
        String cleanPhone = phoneNumber.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            log.warn("Cannot send Twilio message: Phone number '{}' is invalid", phoneNumber);
            return;
        }

        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }

        String toFormatted = "whatsapp:+" + cleanPhone;
        String fromFormatted = fromNumber.startsWith("whatsapp:") ? fromNumber : "whatsapp:" + fromNumber;

        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(accountSid, authToken);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("To", toFormatted);
        map.add("From", fromFormatted);

        if (contentSid != null && !contentSid.isBlank()) {
            map.add("ContentSid", contentSid);
            map.add("ContentVariables", extractVariables(message));
            log.info("Sending Twilio WhatsApp template message using ContentSid: {}", contentSid);
        } else {
            map.add("Body", message);
            log.info("Sending Twilio WhatsApp raw text message");
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            var response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Twilio WhatsApp message sent successfully to {}", toFormatted);
            } else {
                log.error("Failed to send Twilio WhatsApp message to {}. Status: {}, Body: {}", 
                          toFormatted, response.getStatusCode(), response.getBody());
            }
        } catch (Exception ex) {
            log.error("Exception occurred while sending Twilio WhatsApp message to {}", toFormatted, ex);
        }
    }

    private String extractVariables(String message) {
        try {
            int colonIdx = message.indexOf(":");
            String shopName = colonIdx != -1 ? message.substring(0, colonIdx).trim() : "GramMart Shop";

            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+(\\.\\d+)?").matcher(message);
            String amount = "0";
            String balance = "0";
            if (m.find()) {
                amount = m.group();
            }
            if (m.find()) {
                balance = m.group();
            }
            
            // Format ContentVariables: {"1":"shopName", "2":"amount", "3":"balance"}
            return String.format("{\"1\":\"%s\",\"2\":\"%s\",\"3\":\"%s\"}", shopName, amount, balance);
        } catch (Exception ex) {
            log.warn("Failed to parse variables from message: {}", message, ex);
            return "{}";
        }
    }
}

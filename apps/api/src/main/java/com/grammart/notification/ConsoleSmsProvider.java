package com.grammart.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ConsoleSmsProvider implements SmsProvider {
    private static final Logger log = LoggerFactory.getLogger(ConsoleSmsProvider.class);

    @Override
    public void send(String phoneNumber, String message) {
        log.info("SMS to {}: {}", phoneNumber, message);
    }
}


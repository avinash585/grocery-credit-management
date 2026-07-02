package com.grammart.notification;

public interface SmsProvider {
    void send(String phoneNumber, String message);
}


package com.grammart.common;

/**
 * Supported languages for the multilingual AI assistant.
 * TANGLISH = Tamil + English mixed code-switching.
 * HINGLISH  = Hindi  + English mixed code-switching.
 * AUTO      = detect automatically from transcript.
 */
public enum Language {
    ENGLISH,
    TAMIL,
    HINDI,
    TELUGU,
    KANNADA,
    MALAYALAM,
    TANGLISH,
    HINGLISH,
    AUTO
}

package com.grammart.ai;

import com.grammart.common.Language;

public final class AiDtos {
    private AiDtos() {
    }

    public record ChatRequest(
            String message,
            Language language,
            String customerName,
            String outstandingBalance,
            String transcript
    ) {
    }

    public record ChatResponse(String answer, boolean live) {
    }
}

package com.grammart.voice;

import com.grammart.common.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public final class VoiceDtos {
    private VoiceDtos() {
    }

    public record VoiceCommandRequest(@NotBlank String transcript, @NotNull Language language) {
    }

    public record VoiceCommandResponse(VoiceIntent intent, String customerName, String productAlias, BigDecimal amount, String quantity, Map<String, Object> slots) {
    }
}


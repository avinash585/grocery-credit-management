package com.grammart.auth;

import com.grammart.common.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank String shopName,
            @NotBlank String ownerName,
            @NotBlank @Size(min = 10, max = 15) String phone,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotNull Language preferredLanguage,
            String address,
            String village,
            String district,
            String state
    ) {
    }

    public record LoginRequest(@NotBlank String phone, @NotBlank String password) {
    }

    public record AuthResponse(String accessToken, String tokenType) {
    }
}


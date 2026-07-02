package com.grammart.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.grammart.auth.AuthDtos.RegisterRequest;
import com.grammart.common.Language;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

class AuthDtosValidationTest {
    @Test
    void rejectsShortPasswords() {
        var validator = Validation.buildDefaultValidatorFactory().getValidator();

        var violations = validator.validate(new RegisterRequest(
                "Shop", "Owner", "9876543210", "short", Language.ENGLISH,
                "Street", "Village", "District", "State"));

        assertThat(violations).isNotEmpty();
    }
}


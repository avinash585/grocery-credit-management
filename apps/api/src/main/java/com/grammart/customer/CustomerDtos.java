package com.grammart.customer;

import com.grammart.common.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public final class CustomerDtos {
    private CustomerDtos() {
    }

    public record CreateCustomerRequest(@NotBlank String name, String phone, @NotNull Language preferredLanguage, String notes) {
    }

    public record CustomerResponse(UUID id, String name, String phone, Language preferredLanguage, BigDecimal outstandingBalance) {
        static CustomerResponse from(Customer customer) {
            return new CustomerResponse(customer.getId(), customer.getName(), customer.getPhone(),
                    customer.getPreferredLanguage(), customer.getOutstandingBalance());
        }
    }
}


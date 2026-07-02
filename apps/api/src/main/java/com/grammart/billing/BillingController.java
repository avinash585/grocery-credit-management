package com.grammart.billing;

import com.grammart.billing.BillingDtos.BillResponse;
import com.grammart.billing.BillingDtos.CreateBillRequest;
import com.grammart.security.AppUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bills")
public class BillingController {
    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    BillResponse create(@AuthenticationPrincipal AppUser user, @Valid @RequestBody CreateBillRequest request) {
        return billingService.createAndConfirm(user, request);
    }

    @GetMapping("/{billId}")
    BillResponse get(@AuthenticationPrincipal AppUser user, @PathVariable UUID billId) {
        return billingService.get(user, billId);
    }
}


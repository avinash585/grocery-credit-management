package com.grammart.ledger;

import com.grammart.ledger.LedgerDtos.CreditRequest;
import com.grammart.ledger.LedgerDtos.LedgerResponse;
import com.grammart.ledger.LedgerDtos.PaymentRequest;
import com.grammart.security.AppUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ledger")
public class LedgerController {
    private final LedgerService ledgerService;

    public LedgerController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @PostMapping("/credit")
    LedgerResponse addCredit(@AuthenticationPrincipal AppUser user, @Valid @RequestBody CreditRequest request) {
        return ledgerService.addCredit(user, request.customerId(), request.amount(), request.note());
    }

    @PostMapping("/payment")
    LedgerResponse receivePayment(@AuthenticationPrincipal AppUser user, @Valid @RequestBody PaymentRequest request) {
        return ledgerService.receivePayment(user, request.customerId(), request.amount(), request.note());
    }
}


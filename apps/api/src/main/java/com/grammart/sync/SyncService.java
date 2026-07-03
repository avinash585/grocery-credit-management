package com.grammart.sync;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grammart.billing.BillingDtos.CreateBillRequest;
import com.grammart.billing.BillingService;
import com.grammart.customer.CustomerDtos.CreateCustomerRequest;
import com.grammart.customer.CustomerService;
import com.grammart.ledger.LedgerDtos.PaymentRequest;
import com.grammart.ledger.LedgerService;
import com.grammart.security.AppUser;
import com.grammart.sync.SyncDtos.SyncOperationResult;
import com.grammart.sync.SyncDtos.SyncPushRequest;
import com.grammart.sync.SyncDtos.SyncPushResponse;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class SyncService {
    private final SyncOperationRepository operations;
    private final CustomerService customerService;
    private final BillingService billingService;
    private final LedgerService ledgerService;
    private final ObjectMapper objectMapper;

    public SyncService(
            SyncOperationRepository operations,
            CustomerService customerService,
            BillingService billingService,
            LedgerService ledgerService,
            ObjectMapper objectMapper
    ) {
        this.operations = operations;
        this.customerService = customerService;
        this.billingService = billingService;
        this.ledgerService = ledgerService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SyncPushResponse push(AppUser user, SyncPushRequest request) {
        var results = request.operations().stream().map(operation -> {
            boolean exists = operations.findByShopIdAndClientOperationId(user.getShop().getId(), operation.clientOperationId()).isPresent();
            if (exists) {
                return new SyncOperationResult(operation.clientOperationId(), "DUPLICATE_IGNORED");
            }
            operations.save(new SyncOperation(user.getShop(), user, operation.clientOperationId(), operation.type(), operation.payload()));
            
            try {
                replayOperation(user, operation.type(), operation.payload());
                return new SyncOperationResult(operation.clientOperationId(), "ACCEPTED");
            } catch (Exception ex) {
                return new SyncOperationResult(operation.clientOperationId(), "FAILED: " + ex.getMessage());
            }
        }).toList();
        return new SyncPushResponse(results);
    }

    private void replayOperation(AppUser user, String type, String payloadJson) throws Exception {
        switch (type) {
            case "CREATE_CUSTOMER" -> {
                var request = objectMapper.readValue(payloadJson, CreateCustomerRequest.class);
                customerService.create(user, request);
            }
            case "CREATE_BILL" -> {
                var request = objectMapper.readValue(payloadJson, CreateBillRequest.class);
                billingService.createAndConfirm(user, request);
            }
            case "RECEIVE_PAYMENT" -> {
                var request = objectMapper.readValue(payloadJson, PaymentRequest.class);
                ledgerService.receivePayment(user, request.customerId(), request.amount(), request.note());
            }
            default -> throw new IllegalArgumentException("Unknown sync operation type: " + type);
        }
    }
}


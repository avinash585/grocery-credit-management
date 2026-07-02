package com.grammart.ledger;

import com.grammart.customer.Customer;
import com.grammart.customer.CustomerRepository;
import com.grammart.ledger.LedgerDtos.LedgerResponse;
import com.grammart.notification.SmsProvider;
import com.grammart.notification.SmsTemplateService;
import com.grammart.security.AppUser;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class LedgerService {
    private final CustomerRepository customers;
    private final LedgerEntryRepository ledgerEntries;
    private final SmsProvider smsProvider;
    private final SmsTemplateService smsTemplateService;

    public LedgerService(CustomerRepository customers, LedgerEntryRepository ledgerEntries, SmsProvider smsProvider, SmsTemplateService smsTemplateService) {
        this.customers = customers;
        this.ledgerEntries = ledgerEntries;
        this.smsProvider = smsProvider;
        this.smsTemplateService = smsTemplateService;
    }

    @Transactional
    public LedgerResponse addCredit(AppUser user, java.util.UUID customerId, BigDecimal amount, String note) {
        Customer customer = customers.findByIdAndShopIdAndDeletedAtIsNull(customerId, user.getShop().getId()).orElseThrow();
        customer.applyCredit(amount);
        ledgerEntries.save(new LedgerEntry(user.getShop(), customer, LedgerEntryType.PURCHASE, amount, customer.getOutstandingBalance(), jsonNote(note)));
        return new LedgerResponse(customer.getId(), customer.getOutstandingBalance());
    }

    @Transactional
    public LedgerResponse receivePayment(AppUser user, java.util.UUID customerId, BigDecimal amount, String note) {
        Customer customer = customers.findByIdAndShopIdAndDeletedAtIsNull(customerId, user.getShop().getId()).orElseThrow();
        customer.applyPayment(amount);
        ledgerEntries.save(new LedgerEntry(user.getShop(), customer, LedgerEntryType.PAYMENT, amount, customer.getOutstandingBalance(), jsonNote(note)));
        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {
            String message = smsTemplateService.paymentReceived(customer.getPreferredLanguage(), customer.getShop().getName(), amount, customer.getOutstandingBalance());
            smsProvider.send(customer.getPhone(), message);
        }
        return new LedgerResponse(customer.getId(), customer.getOutstandingBalance());
    }

    private String jsonNote(String note) {
        String safe = note == null ? "" : note.replace("\"", "\\\"");
        return "{\"note\":\"" + safe + "\"}";
    }
}

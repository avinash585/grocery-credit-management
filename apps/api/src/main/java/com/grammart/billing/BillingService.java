package com.grammart.billing;

import com.grammart.billing.BillingDtos.BillResponse;
import com.grammart.billing.BillingDtos.CreateBillRequest;
import com.grammart.catalog.Product;
import com.grammart.catalog.ProductRepository;
import com.grammart.customer.Customer;
import com.grammart.customer.CustomerRepository;
import com.grammart.ledger.LedgerService;
import com.grammart.security.AppUser;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class BillingService {
    private final BillRepository bills;
    private final CustomerRepository customers;
    private final ProductRepository products;
    private final LedgerService ledgerService;

    public BillingService(BillRepository bills, CustomerRepository customers, ProductRepository products, LedgerService ledgerService) {
        this.bills = bills;
        this.customers = customers;
        this.products = products;
        this.ledgerService = ledgerService;
    }

    @Transactional
    public BillResponse createAndConfirm(AppUser user, CreateBillRequest request) {
        Customer customer = customers.findByIdAndShopIdAndDeletedAtIsNull(request.customerId(), user.getShop().getId()).orElseThrow();
        Bill bill = new Bill(user.getShop(), customer, request.creditBill());
        for (var item : request.items()) {
            Product product = products.findById(item.productId()).filter(Product::isEnabled).orElseThrow();
            bill.addItem(new BillItem(product, item.quantity(), product.getSellingPrice()));
        }
        bill.confirm();
        Bill saved = bills.save(bill);
        if (saved.isCreditBill()) {
            ledgerService.addCredit(user, customer.getId(), saved.getTotalAmount(), "Bill " + saved.getId());
        }
        return BillResponse.from(saved);
    }

    public BillResponse get(AppUser user, UUID billId) {
        Bill bill = bills.findById(billId).filter(found -> found.getCustomer().getShop().getId().equals(user.getShop().getId())).orElseThrow();
        return BillResponse.from(bill);
    }
}


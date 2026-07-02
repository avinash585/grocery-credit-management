package com.grammart.customer;

import com.grammart.customer.CustomerDtos.CreateCustomerRequest;
import com.grammart.customer.CustomerDtos.CustomerResponse;
import com.grammart.security.AppUser;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {
    private final CustomerRepository customers;

    public CustomerService(CustomerRepository customers) {
        this.customers = customers;
    }

    @Transactional
    public CustomerResponse create(AppUser user, CreateCustomerRequest request) {
        Customer customer = customers.save(new Customer(user.getShop(), request.name(), request.phone(), request.preferredLanguage(), request.notes()));
        return CustomerResponse.from(customer);
    }

    public List<CustomerResponse> search(AppUser user, String query) {
        return customers.findTop20ByShopIdAndNameContainingIgnoreCaseAndDeletedAtIsNull(user.getShop().getId(), query == null ? "" : query)
                .stream()
                .map(CustomerResponse::from)
                .toList();
    }
}


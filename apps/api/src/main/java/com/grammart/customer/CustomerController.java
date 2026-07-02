package com.grammart.customer;

import com.grammart.customer.CustomerDtos.CreateCustomerRequest;
import com.grammart.customer.CustomerDtos.CustomerResponse;
import com.grammart.security.AppUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    CustomerResponse create(@AuthenticationPrincipal AppUser user, @Valid @RequestBody CreateCustomerRequest request) {
        return customerService.create(user, request);
    }

    @GetMapping
    List<CustomerResponse> search(@AuthenticationPrincipal AppUser user, @RequestParam(defaultValue = "") String query) {
        return customerService.search(user, query);
    }
}


package com.grammart.auth;

import com.grammart.auth.AuthDtos.AuthResponse;
import com.grammart.auth.AuthDtos.LoginRequest;
import com.grammart.auth.AuthDtos.RegisterRequest;
import com.grammart.security.AppUser;
import com.grammart.security.AppUserRepository;
import com.grammart.security.JwtService;
import com.grammart.security.Role;
import com.grammart.shop.Shop;
import com.grammart.shop.ShopRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final ShopRepository shops;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(ShopRepository shops, AppUserRepository users, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.shops = shops;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.findByPhone(request.phone()).isPresent()) {
            throw new IllegalArgumentException("Phone number is already registered");
        }
        Shop shop = shops.save(new Shop(request.shopName(), request.ownerName(), request.phone(), request.preferredLanguage(),
                request.address(), request.village(), request.district(), request.state()));
        AppUser user = users.save(new AppUser(shop, request.phone(), passwordEncoder.encode(request.password()), Role.SHOP_OWNER));
        return new AuthResponse(jwtService.generateAccessToken(user), "Bearer");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.phone(), request.password()));
        AppUser user = users.findByPhone(request.phone()).orElseThrow();
        return new AuthResponse(jwtService.generateAccessToken(user), "Bearer");
    }
}


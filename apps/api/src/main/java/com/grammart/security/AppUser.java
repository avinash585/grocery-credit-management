package com.grammart.security;

import com.grammart.common.BaseEntity;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_users_phone", columnList = "phone", unique = true))
public class AppUser extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    protected AppUser() {
    }

    public AppUser(Shop shop, String phone, String passwordHash, Role role) {
        this.shop = shop;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public Shop getShop() {
        return shop;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return phone;
    }
}


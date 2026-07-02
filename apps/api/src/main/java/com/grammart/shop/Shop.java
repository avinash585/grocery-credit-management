package com.grammart.shop;

import com.grammart.common.BaseEntity;
import com.grammart.common.Language;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "shops")
public class Shop extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false)
    private Language preferredLanguage = Language.ENGLISH;

    private String address;
    private String village;
    private String district;
    private String state;

    protected Shop() {
    }

    public Shop(String name, String ownerName, String phone, Language preferredLanguage, String address, String village, String district, String state) {
        this.name = name;
        this.ownerName = ownerName;
        this.phone = phone;
        this.preferredLanguage = preferredLanguage;
        this.address = address;
        this.village = village;
        this.district = district;
        this.state = state;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getPhone() {
        return phone;
    }

    public Language getPreferredLanguage() {
        return preferredLanguage;
    }
}


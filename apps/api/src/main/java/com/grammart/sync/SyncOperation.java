package com.grammart.sync;

import com.grammart.common.BaseEntity;
import com.grammart.security.AppUser;
import com.grammart.shop.Shop;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "sync_operations", indexes = {
        @Index(name = "idx_sync_shop_client", columnList = "shop_id,client_operation_id", unique = true),
        @Index(name = "idx_sync_shop_created", columnList = "shop_id,created_at")
})
public class SyncOperation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(name = "client_operation_id", nullable = false, length = 80)
    private String clientOperationId;

    @Column(nullable = false, length = 80)
    private String type;

    @Column(columnDefinition = "json", nullable = false)
    private String payload;

    protected SyncOperation() {
    }

    public SyncOperation(Shop shop, AppUser user, String clientOperationId, String type, String payload) {
        this.shop = shop;
        this.user = user;
        this.clientOperationId = clientOperationId;
        this.type = type;
        this.payload = payload;
    }

    public String getClientOperationId() {
        return clientOperationId;
    }

    public String getType() {
        return type;
    }
}


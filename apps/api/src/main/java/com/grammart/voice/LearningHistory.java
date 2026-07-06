package com.grammart.voice;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_history")
public class LearningHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_id", nullable = false)
    private String shopId;

    @Column(name = "unknown_word", nullable = false)
    private String unknownWord;

    @Column(name = "mapped_canonical")
    private String mappedCanonical;

    @Column(name = "is_approved")
    private boolean isApproved = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public LearningHistory() {}

    public LearningHistory(String shopId, String unknownWord, String mappedCanonical, boolean isApproved) {
        this.shopId = shopId;
        this.unknownWord = unknownWord;
        this.mappedCanonical = mappedCanonical;
        this.isApproved = isApproved;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShopId() { return shopId; }
    public void setShopId(String shopId) { this.shopId = shopId; }
    public String getUnknownWord() { return unknownWord; }
    public void setUnknownWord(String unknownWord) { this.unknownWord = unknownWord; }
    public String getMappedCanonical() { return mappedCanonical; }
    public void setMappedCanonical(String mappedCanonical) { this.mappedCanonical = mappedCanonical; }
    public boolean isApproved() { return isApproved; }
    public void setApproved(boolean approved) { isApproved = approved; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

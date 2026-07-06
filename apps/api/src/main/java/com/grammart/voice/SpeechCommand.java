package com.grammart.voice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "speech_commands")
public class SpeechCommand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voice_log_id")
    @JsonIgnore
    private VoiceLog voiceLog;

    @Column(name = "intent", nullable = false)
    private String intent;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "product_alias")
    private String productAlias;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "quantity")
    private String quantity;

    @Column(name = "unit")
    private String unit;

    @Column(name = "status")
    private String status = "PENDING_CONFIRMATION"; // 'EXECUTED', 'PENDING_CONFIRMATION', 'REJECTED'

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public SpeechCommand() {}

    public SpeechCommand(String intent, String customerName, String productAlias, BigDecimal amount, String quantity, String unit, String status) {
        this.intent = intent;
        this.customerName = customerName;
        this.productAlias = productAlias;
        this.amount = amount;
        this.quantity = quantity;
        this.unit = unit;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public VoiceLog getVoiceLog() { return voiceLog; }
    public void setVoiceLog(VoiceLog voiceLog) { this.voiceLog = voiceLog; }
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getProductAlias() { return productAlias; }
    public void setProductAlias(String productAlias) { this.productAlias = productAlias; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

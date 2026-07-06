package com.grammart.voice;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "voice_logs")
public class VoiceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_id")
    private String shopId;

    @Column(name = "raw_transcript", nullable = false, columnDefinition = "TEXT")
    private String rawTranscript;

    @Column(name = "detected_language")
    private String detectedLanguage;

    @Column(name = "confidence_score")
    private BigDecimal confidenceScore;

    @Column(name = "processed_ms")
    private Integer processedMs;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "voiceLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpeechCommand> speechCommands = new ArrayList<>();

    public VoiceLog() {}

    public VoiceLog(String shopId, String rawTranscript, String detectedLanguage, BigDecimal confidenceScore, Integer processedMs) {
        this.shopId = shopId;
        this.rawTranscript = rawTranscript;
        this.detectedLanguage = detectedLanguage;
        this.confidenceScore = confidenceScore;
        this.processedMs = processedMs;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShopId() { return shopId; }
    public void setShopId(String shopId) { this.shopId = shopId; }
    public String getRawTranscript() { return rawTranscript; }
    public void setRawTranscript(String rawTranscript) { this.rawTranscript = rawTranscript; }
    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }
    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
    public Integer getProcessedMs() { return processedMs; }
    public void setProcessedMs(Integer processedMs) { this.processedMs = processedMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<SpeechCommand> getSpeechCommands() { return speechCommands; }
    public void addSpeechCommand(SpeechCommand command) {
        speechCommands.add(command);
        command.setVoiceLog(this);
    }
}

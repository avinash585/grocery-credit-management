package com.grammart.voice;

import com.grammart.voice.VoiceDtos.VoiceCommandRequest;
import com.grammart.voice.VoiceDtos.VoiceCommandResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/voice")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SpeechIntelligenceController {
    private final SpeechIntelligenceService speechIntelligenceService;
    private final ShopAliasRepository shopAliasRepository;
    private final VoiceLogRepository voiceLogRepository;
    private final LearningHistoryRepository learningHistoryRepository;

    public SpeechIntelligenceController(
            SpeechIntelligenceService speechIntelligenceService,
            ShopAliasRepository shopAliasRepository,
            VoiceLogRepository voiceLogRepository,
            LearningHistoryRepository learningHistoryRepository
    ) {
        this.speechIntelligenceService = speechIntelligenceService;
        this.shopAliasRepository = shopAliasRepository;
        this.voiceLogRepository = voiceLogRepository;
        this.learningHistoryRepository = learningHistoryRepository;
    }

    @PostMapping("/normalize")
    public VoiceCommandResponse normalize(@Valid @RequestBody VoiceCommandRequest request) {
        return speechIntelligenceService.parse(request.transcript(), request.language());
    }

    @PostMapping("/learn")
    public ShopAlias learn(@RequestBody Map<String, String> request) {
        String shopId = request.getOrDefault("shopId", "demo-shop");
        String category = request.get("category"); // 'CUSTOMER' or 'PRODUCT'
        String canonicalId = request.get("canonicalId");
        String aliasValue = request.get("aliasValue").toLowerCase().trim();
        boolean isGlobal = Boolean.parseBoolean(request.getOrDefault("isGlobal", "false"));

        // Save alias
        ShopAlias alias = new ShopAlias(shopId, category, canonicalId, aliasValue, isGlobal);
        ShopAlias saved = shopAliasRepository.save(alias);

        // Resolve active learning history
        List<LearningHistory> learnings = learningHistoryRepository.findByShopId(shopId);
        for (LearningHistory lh : learnings) {
            if (lh.getUnknownWord().equalsIgnoreCase(aliasValue)) {
                lh.setMappedCanonical(canonicalId);
                lh.setApproved(true);
                learningHistoryRepository.save(lh);
            }
        }

        return saved;
    }

    @GetMapping("/aliases")
    public List<ShopAlias> getAliases(@RequestParam(name = "shopId", defaultValue = "demo-shop") String shopId) {
        return shopAliasRepository.findByShopId(shopId);
    }

    @GetMapping("/language-packs")
    public Map<String, Map<String, Object>> getLanguagePacks() {
        return speechIntelligenceService.getLanguagePacks();
    }

    @GetMapping("/logs")
    public List<VoiceLog> getLogs(@RequestParam(name = "shopId", defaultValue = "demo-shop") String shopId) {
        return voiceLogRepository.findByShopId(shopId);
    }
}

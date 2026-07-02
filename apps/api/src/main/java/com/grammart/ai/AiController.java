package com.grammart.ai;

import com.grammart.ai.AiDtos.ChatRequest;
import com.grammart.ai.AiDtos.ChatResponse;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AiController {
    private final AiAssistantService assistantService;

    public AiController(AiAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @GetMapping("/daily-summary")
    Map<String, Object> dailySummary(
            @RequestParam(defaultValue = "0") BigDecimal sales,
            @RequestParam(defaultValue = "0") BigDecimal credit,
            @RequestParam(defaultValue = "0") BigDecimal payments
    ) {
        return assistantService.summarizeDailyBusiness(sales, credit, payments);
    }

    @PostMapping("/chat")
    ChatResponse chat(@RequestBody ChatRequest request) {
        return assistantService.chat(request);
    }
}

package com.grammart.voice;

import com.grammart.voice.VoiceDtos.VoiceCommandRequest;
import com.grammart.voice.VoiceDtos.VoiceCommandResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/voice")
public class VoiceCommandController {
    private final VoiceCommandService voiceCommandService;

    public VoiceCommandController(VoiceCommandService voiceCommandService) {
        this.voiceCommandService = voiceCommandService;
    }

    @PostMapping("/commands")
    VoiceCommandResponse parse(@Valid @RequestBody VoiceCommandRequest request) {
        return voiceCommandService.parse(request.transcript(), request.language());
    }
}


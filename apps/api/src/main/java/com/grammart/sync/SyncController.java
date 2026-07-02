package com.grammart.sync;

import com.grammart.security.AppUser;
import com.grammart.sync.SyncDtos.SyncPushRequest;
import com.grammart.sync.SyncDtos.SyncPushResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/push")
    SyncPushResponse push(@AuthenticationPrincipal AppUser user, @Valid @RequestBody SyncPushRequest request) {
        return syncService.push(user, request);
    }
}


package com.grammart.voice;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoiceLogRepository extends JpaRepository<VoiceLog, Long> {
    List<VoiceLog> findByShopId(String shopId);
}

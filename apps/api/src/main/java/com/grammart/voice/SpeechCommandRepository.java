package com.grammart.voice;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpeechCommandRepository extends JpaRepository<SpeechCommand, Long> {
    List<SpeechCommand> findByStatus(String status);
}

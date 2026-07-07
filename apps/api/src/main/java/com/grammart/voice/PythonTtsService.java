package com.grammart.voice;

import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PythonTtsService {
    private final RestClient restClient;

    public PythonTtsService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("http://localhost:5002").build();
    }

    public void speak(String text, String languageCode) {
        try {
            // Post payload to Python HTTP wrapper running pyttsx3
            restClient.post()
                    .uri("/speak")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "text", text,
                            "lang", languageCode != null ? languageCode.toLowerCase().substring(0, 2) : "en"
                    ))
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("Python TTS: Spoke text: " + text);
        } catch (Exception e) {
            System.err.println("Python TTS: External speech engine not running: " + e.getMessage());
        }
    }
}

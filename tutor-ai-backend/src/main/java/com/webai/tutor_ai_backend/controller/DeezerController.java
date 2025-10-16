package com.webai.tutor_ai_backend.controller;

import com.webai.tutor_ai_backend.service.DeezerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/music")
@CrossOrigin(origins = "http://localhost:4200")
public class DeezerController {

    private final DeezerService deezerService;

    public DeezerController(DeezerService deezerService) {
        this.deezerService = deezerService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations() {
        try {
            List<Map<String, String>> songs = deezerService.getRecommendations();
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao buscar recomendações musicais.");
        }
    }
}

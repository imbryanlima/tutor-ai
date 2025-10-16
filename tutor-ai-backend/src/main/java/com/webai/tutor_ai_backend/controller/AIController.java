package com.webai.tutor_ai_backend.controller;

import com.webai.tutor_ai_backend.dto.ChatMessageRequest;
import com.webai.tutor_ai_backend.model.User;
import com.webai.tutor_ai_backend.model.UserProfile;
import com.webai.tutor_ai_backend.repository.UserProfileRepository;
import com.webai.tutor_ai_backend.repository.UserRepository;
import com.webai.tutor_ai_backend.service.AIService;

import jakarta.servlet.http.HttpSession;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    private final AIService aiService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public AIController(AIService aiService, UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.aiService = aiService;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<String> handleMessage(@RequestBody ChatMessageRequest request,
                                                Authentication authentication,
                                                HttpSession session) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
            UserProfile userProfile = userProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User Profile not found for user: " + userEmail));
            String userLevel = userProfile.getEnglishLevel();

            if (userLevel == null || userLevel.isBlank()){
                return ResponseEntity.badRequest().body("Por favor, defina seu nível de inglês no perfil.");
            }

            List<String> history = (List<String>) session.getAttribute("chatHistory");
            if (history == null) history = new ArrayList<>();

            history.add("Usuário: " + request.getMessage());

            String aiResponse = aiService.processConversationWithHistory(userLevel, history);

            history.add("IA: " + aiResponse);
            session.setAttribute("chatHistory", history);

            return ResponseEntity.ok(aiResponse);

        } catch (Exception e) {
            logger.error("Erro inesperado ao processar a mensagem do usuário {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<String>> getHistory(HttpSession session) {
        List<String> history = (List<String>) session.getAttribute("chatHistory");
        return ResponseEntity.ok(history != null ? history : List.of());
    }
}
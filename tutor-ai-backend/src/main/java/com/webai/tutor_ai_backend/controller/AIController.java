package com.webai.tutor_ai_backend.controller;

import com.webai.tutor_ai_backend.dto.ChatMessageRequest;
import com.webai.tutor_ai_backend.dto.MessageDTO;
import com.webai.tutor_ai_backend.model.ChatMessage;
import com.webai.tutor_ai_backend.model.User;
import com.webai.tutor_ai_backend.model.UserProfile;
import com.webai.tutor_ai_backend.repository.ChatMessageRepository;
import com.webai.tutor_ai_backend.repository.UserProfileRepository;
import com.webai.tutor_ai_backend.repository.UserRepository;
import com.webai.tutor_ai_backend.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    private final AIService aiService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    public AIController(AIService aiService, UserProfileRepository userProfileRepository,
            UserRepository userRepository, ChatMessageRepository chatMessageRepository) {
        this.aiService = aiService;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<String> handleMessage(@RequestBody ChatMessageRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
            UserProfile userProfile = userProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User Profile not found for user: " + userEmail));
            String userLevel = userProfile.getEnglishLevel();

            if (userLevel == null || userLevel.isBlank()) {
                return ResponseEntity.badRequest().body("Por favor, defina seu nível de inglês no perfil.");
            }

            List<ChatMessage> chatHistoryFromDb = chatMessageRepository
                    .findByUserIdOrderByTimestampAsc(currentUser.getId());

            int historyLimit = 20;
            List<ChatMessage> recentHistory = chatHistoryFromDb
                    .subList(Math.max(0, chatHistoryFromDb.size() - historyLimit), chatHistoryFromDb.size());

            List<MessageDTO> historyDTO = recentHistory.stream()
                    .map(msg -> new MessageDTO(msg.getRole(), msg.getContent()))
                    .collect(Collectors.toList());

            String aiResponse = aiService.processGeneralMessage(userLevel, historyDTO, request.getMessage());

            ChatMessage userChatMessage = new ChatMessage();
            userChatMessage.setUserId(currentUser.getId());
            userChatMessage.setRole("user");
            userChatMessage.setContent(request.getMessage());
            userChatMessage.setTimestamp(LocalDateTime.now());
            chatMessageRepository.save(userChatMessage);

            ChatMessage aiChatMessage = new ChatMessage();
            aiChatMessage.setUserId(currentUser.getId());
            aiChatMessage.setRole("ia");
            aiChatMessage.setContent(aiResponse);
            aiChatMessage.setTimestamp(LocalDateTime.now());
            chatMessageRepository.save(aiChatMessage);

            return ResponseEntity.ok(aiResponse);

        } catch (Exception e) {
            logger.error("Erro inesperado ao processar a mensagem do usuário {}: {}", authentication.getName(),
                    e.getMessage(), e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<MessageDTO>> getChatHistory(Authentication authentication) { // HttpSession is removed
        try {
            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

            List<ChatMessage> chatHistoryFromDb = chatMessageRepository
                    .findByUserIdOrderByTimestampAsc(currentUser.getId());

            List<MessageDTO> historyDTO = chatHistoryFromDb.stream()
                    .map(msg -> new MessageDTO(msg.getRole(), msg.getContent()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(historyDTO);

        } catch (Exception e) {
            logger.error("Erro ao buscar histórico do usuário {}: {}", authentication.getName(), e.getMessage(), e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }
}
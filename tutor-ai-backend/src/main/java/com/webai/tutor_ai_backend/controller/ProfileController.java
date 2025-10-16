package com.webai.tutor_ai_backend.controller;

import com.webai.tutor_ai_backend.dto.ProfileRequest;
import com.webai.tutor_ai_backend.model.User;
import com.webai.tutor_ai_backend.model.UserProfile;
import com.webai.tutor_ai_backend.repository.UserRepository;
import com.webai.tutor_ai_backend.repository.UserProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // Import necessário

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200") // Permite o Front-end Angular se conectar
public class ProfileController {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public ProfileController(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    // Rota PROTEGIDA: POST http://localhost:8080/api/profile/save
    @PostMapping("/save")
    public ResponseEntity<?> saveProfile(@RequestBody ProfileRequest request) {
        
        // --- 1. Extrair o usuário autenticado via JWT ---
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName(); 
        
        User currentUser = userRepository.findByEmail(userEmail)
                            .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado."));
        
        // --- 2. Cria ou Atualiza o Perfil ---
        UserProfile profile = userProfileRepository.findByUserId(currentUser.getId()).orElse(new UserProfile());
        
        if (profile.getId() == null) {
            profile.setUser(currentUser);
        }
        
        profile.setEnglishLevel(request.getEnglishLevel());
        profile.setLearningGoal(request.getLearningGoal());
        profile.setMusicGenres(request.getMusicGenres());
        
        userProfileRepository.save(profile);
        
        // CORREÇÃO FINAL: Retornar um JSON Map.of para garantir que o Angular receba o contrato esperado (200 OK).
        return ResponseEntity.ok(
            Map.of("message", "Perfil atualizado! Você está pronto para conversar!", 
                   "englishLevel", request.getEnglishLevel())
        );
    }
    @GetMapping("/get")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado."));

        UserProfile profile = userProfileRepository.findByUserId(currentUser.getId())
                .orElse(null);

        if (profile == null) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Perfil não encontrado."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Perfil carregado com sucesso.",
            "profile", Map.of(
                "englishLevel", profile.getEnglishLevel(),
                "learningGoal", profile.getLearningGoal(),
                "musicGenres", profile.getMusicGenres()
            )
        ));
    }
}

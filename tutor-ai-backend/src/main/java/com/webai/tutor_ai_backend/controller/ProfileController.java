package com.webai.tutor_ai_backend.controller;

import com.webai.tutor_ai_backend.dto.ProfileRequest;
import com.webai.tutor_ai_backend.model.User;
import com.webai.tutor_ai_backend.model.UserProfile;
import com.webai.tutor_ai_backend.repository.UserRepository;

import jakarta.validation.Valid;

import com.webai.tutor_ai_backend.repository.UserProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public ProfileController(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveProfile(@Valid @RequestBody ProfileRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado."));

        UserProfile profile = userProfileRepository.findByUserId(currentUser.getId()).orElse(new UserProfile());

        if (profile.getId() == null) {
            profile.setUser(currentUser);
        }

        profile.setEnglishLevel(request.getEnglishLevel());
        profile.setLearningGoal(request.getLearningGoal());
        profile.setMusicGenres(request.getMusicGenres());

        userProfileRepository.save(profile);

        return ResponseEntity.ok(
                Map.of("message", "Perfil atualizado! Você está pronto para conversar!",
                        "englishLevel", request.getEnglishLevel()));
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
                    "message", "Perfil não encontrado."));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Perfil carregado com sucesso.",
                "profile", Map.of(
                        "englishLevel", profile.getEnglishLevel(),
                        "learningGoal", profile.getLearningGoal(),
                        "musicGenres", profile.getMusicGenres())));
    }
}

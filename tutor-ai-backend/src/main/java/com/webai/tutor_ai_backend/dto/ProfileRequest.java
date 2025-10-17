package com.webai.tutor_ai_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {

    @NotBlank(message = "Nível de inglês é obrigatório.")
    private String englishLevel;

    @NotBlank(message = "Objetivo de aprendizado é obrigatório.")
    @Size(min = 10, max = 500, message = "Objetivo deve ter entre 10 e 500 caracteres.")
    private String learningGoal;

    private List<String> musicGenres;

}
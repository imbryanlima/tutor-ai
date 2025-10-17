package com.webai.tutor_ai_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Formato de e-mail inválido.")
    private String email;

    @NotBlank(message = "Senha não pode estar em branco.")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracters.")
    private String password;
}
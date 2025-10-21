package com.webai.tutor_ai_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    private String role;
    private String content;

}
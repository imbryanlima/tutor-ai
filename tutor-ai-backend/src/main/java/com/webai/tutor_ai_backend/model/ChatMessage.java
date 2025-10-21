package com.webai.tutor_ai_backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;
    private String userId;
    private String role;
    private String content;
    private LocalDateTime timestamp;

}

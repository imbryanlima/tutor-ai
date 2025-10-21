package com.webai.tutor_ai_backend.repository;

import com.webai.tutor_ai_backend.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByUserIdOrderByTimestampAsc(String userId);
}

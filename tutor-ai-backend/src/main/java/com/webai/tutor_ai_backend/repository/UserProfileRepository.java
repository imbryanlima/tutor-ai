package com.webai.tutor_ai_backend.repository;

import com.webai.tutor_ai_backend.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
   Optional<UserProfile> findByUserId(String userId); 
}
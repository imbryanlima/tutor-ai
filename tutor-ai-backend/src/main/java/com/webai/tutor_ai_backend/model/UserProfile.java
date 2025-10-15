package com.webai.tutor_ai_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data 
@Document(collection = "user_profiles") 
public class UserProfile {

    @Id
    private String id;

    @DBRef 
    private User user;

    private String englishLevel;
    private String learningGoal;
    
    public UserProfile() {}

    public UserProfile(User user, String englishLevel, String learningGoal) {
        this.user = user;
        this.englishLevel = englishLevel;
        this.learningGoal = learningGoal;
    }

}
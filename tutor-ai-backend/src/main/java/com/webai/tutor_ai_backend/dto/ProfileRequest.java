package com.webai.tutor_ai_backend.dto; 

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {

    private String englishLevel;
    private String learningGoal;
    private List    <String> musicGenres;
    
}
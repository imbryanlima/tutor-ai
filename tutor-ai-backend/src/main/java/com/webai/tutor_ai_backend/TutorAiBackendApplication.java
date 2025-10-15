package com.webai.tutor_ai_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; 

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class TutorAiBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TutorAiBackendApplication.class, args);
    }
}

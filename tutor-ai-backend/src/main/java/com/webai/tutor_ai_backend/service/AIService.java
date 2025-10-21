package com.webai.tutor_ai_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webai.tutor_ai_backend.dto.MessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model-name}")
    private String modelName;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AIService(WebClient webClient) {
        this.webClient = webClient;
        this.objectMapper = new ObjectMapper();
    }

    public String processGeneralMessage(String userLevel, List<MessageDTO> history, String newMessage)
            throws IOException {

        String systemInstructionText = "Você é a inteligência artificial do 'Tutor AI', um aplicativo web para aprendizado de inglês. "
                + "Aja sempre como um tutor amigável e paciente. "
                + "Você está conversando com um estudante de nível '" + userLevel + "'. "
                + "Use formatação markdown (como **negrito**) para destacar pontos importantes.";

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", systemInstructionText)));

        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            contents = history.stream()
                    .map(msg -> {
                        Map<String, Object> textPart = Map.of("text", msg.getContent());
                        String role = "ia".equalsIgnoreCase(msg.getRole()) || "model".equalsIgnoreCase(msg.getRole())
                                ? "model"
                                : "user";
                        return Map.of("role", role, "parts", List.of(textPart));
                    })
                    .collect(Collectors.toList());
        }
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", newMessage))));

        logger.info("Enviando conversa com {} mensagens (incluindo a nova) para o Gemini...", contents.size());

        return this.callGenerativeApi(systemInstruction, contents);
    }

    private String callGenerativeApi(Map<String, Object> systemInstruction, List<Map<String, Object>> contents)
            throws IOException {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key="
                + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);
        if (systemInstruction != null) {
            requestBody.put("systemInstruction", systemInstruction);
        }

        List<Map<String, String>> safetySettings = List.of(
                Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_MEDIUM_AND_ABOVE"),
                Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_MEDIUM_AND_ABOVE"),
                Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_MEDIUM_AND_ABOVE"),
                Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_MEDIUM_AND_ABOVE"));
        requestBody.put("safetySettings", safetySettings);

        long startTime = System.currentTimeMillis();
        String jsonResponse = webClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        long endTime = System.currentTimeMillis();
        logger.info(">>> Tempo de resposta da API do Gemini: {} ms", (endTime - startTime));

        if (jsonResponse == null) {
            throw new IOException("No response from API");
        }

        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
        if (textNode.isMissingNode()) {
            JsonNode finishReasonNode = root.at("/candidates/0/finishReason");
            if ("SAFETY".equals(finishReasonNode.asText())) {
                logger.warn("A resposta da IA foi bloqueada pelos filtros de segurança.");
                return "Não posso gerar uma resposta para isso. Vamos tentar outro tópico?";
            }
            JsonNode promptFeedback = root.at("/promptFeedback/blockReason");
            if (!promptFeedback.isMissingNode()) {
                String reason = promptFeedback.asText();
                logger.warn("A IA se recusou a responder por motivos de segurança do prompt: {}", reason);
                return "Não posso responder a essa pergunta. Por favor, tente reformular.";
            }
            logger.error("Não foi possível encontrar o texto na resposta da API: {}", jsonResponse);
            throw new IOException("Could not find text in API response");
        }
        return textNode.asText();
    }
}
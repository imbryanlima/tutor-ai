package com.webai.tutor_ai_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;
import java.util.List;
import java.util.Map;

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

    public String processGeneralMessage(String userLevel, String userMessage) throws IOException {

        String megaPrompt = "Você é o Tutor AI, um professor de inglês paciente e amigável. "
                + "Você está ajudando um estudante de nível '" + userLevel + "'. "
                + "Suas principais funções são: criar exercícios, avaliar frases, simular cenários ou apenas conversar. "
                + "Com base na mensagem do usuário, escolha a ação mais útil. Se não tiver certeza, apenas converse. "
                + "Use **negrito** para destacar pontos importantes. Mensagem do usuário: \"" + userMessage + "\"";

        logger.info("Enviando Mega Prompt para o Gemini...");

        String aiResponse = this.callGenerativeApi(megaPrompt);
        return aiResponse;
    }

    private String callGenerativeApi(String prompt) throws IOException {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key="
                + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", new Object[] { textPart });
        Map<String, Object> requestBody = Map.of("contents", new Object[] { content });

        String jsonResponse = webClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (jsonResponse == null) {
            throw new IOException("No response from API");
        }

        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode textNode = root.at("/candidates/0/content/parts/0/text");

        if (textNode.isMissingNode()) {
            JsonNode promptFeedback = root.at("/promptFeedback/blockReason");
            if (!promptFeedback.isMissingNode()) {
                String reason = promptFeedback.asText();
                logger.warn("A IA se recusou a responder por motivos de segurança: {}", reason);
                return "Não posso responder a essa pergunta. Por favor, tente reformular.";
            }
            logger.error("Não foi possível encontrar o texto na resposta da API: {}", jsonResponse);
            throw new IOException("Could not find text in API response");
        }

        return textNode.asText();
    }

    public String processConversationWithHistory(String userLevel, List<String> history) throws IOException {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Você é o Tutor AI, um professor de inglês paciente e amigável. ");
        prompt.append("Você está ajudando um estudante de nível '").append(userLevel).append("'. ");
        prompt.append("Suas funções são: criar exercícios, avaliar frases, simular diálogos ou apenas conversar. ");
        prompt.append("Com base na conversa abaixo, continue respondendo de forma natural e educativa.\n\n");

        for (String linha : history) {
            prompt.append(linha).append("\n");
        }

        prompt.append("IA: ");

        logger.info("Enviando histórico para a IA. Total de mensagens: {}", history.size());

        return callGenerativeApi(prompt.toString());
    }
}
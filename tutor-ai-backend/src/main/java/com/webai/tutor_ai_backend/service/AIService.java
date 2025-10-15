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
import java.util.Map;

@Service
public class AIService {

    // Adicionando um logger para registrar informações e erros internos
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

        String megaPrompt = "Você é a inteligência artificial do 'Tutor AI', um aplicativo web para aprendizado de inglês. "
                + "Aja sempre como um tutor amigável e paciente. "
                + "Você está conversando com um estudante de nível '" + userLevel + "'. "
                + "Analise a mensagem do usuário e siga estas regras em ordem: "
                + "1. Se a mensagem parecer um pedido para criar um exercício de gramática, extraia o tópico e gere o exercício com as perguntas e alternativas de forma clara e legível, como um professor faria em um chat. NÃO use formato JSON. "
                + "2. Se a mensagem for uma pergunta sobre uma frase em inglês ou pedir para avaliar a naturalidade, avalie a frase e dê uma sugestão. "
                + "3. Se a mensagem parecer um pedido para simular um cenário (role-play), extraia o cenário e inicie a conversa como o outro personagem. "
                + "4. Se nenhuma das regras acima se aplicar, trate a mensagem como uma conversa geral: responda amigavelmente, corrija erros e faça uma pergunta para continuar. "
                + "\n\nA mensagem do usuário é: \"" + userMessage + "\"";

        logger.info("Enviando Mega Prompt para o Gemini...");
        return this.callGenerativeApi(megaPrompt);
    }

    private String callGenerativeApi(String prompt) throws IOException {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", new Object[]{textPart});
        Map<String, Object> requestBody = Map.of("contents", new Object[]{content});

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
}
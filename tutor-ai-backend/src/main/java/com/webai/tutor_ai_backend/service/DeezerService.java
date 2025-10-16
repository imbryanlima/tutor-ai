package com.webai.tutor_ai_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webai.tutor_ai_backend.model.User;
import com.webai.tutor_ai_backend.model.UserProfile;
import com.webai.tutor_ai_backend.repository.UserProfileRepository;
import com.webai.tutor_ai_backend.repository.UserRepository;
import com.webai.tutor_ai_backend.utils.LanguageUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeezerService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final Map<String, Integer> GENRE_MAP = Map.of(
            "pop", 132,
            "rock", 152,
            "electronic", 106,
            "hip hop", 116,
            "reggae", 144,
            "metal", 464
    );

    public DeezerService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<Map<String, String>> getRecommendations() throws IOException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseThrow();

        List<String> userGenres = profile.getMusicGenres();
        if (userGenres == null || userGenres.isEmpty()) {
            throw new IllegalStateException("Usuário não possui estilos musicais definidos.");
        }

        List<Integer> genreIds = userGenres.stream()
                .map(String::toLowerCase)
                .map(GENRE_MAP::get)
                .filter(Objects::nonNull)
                .distinct()
                .limit(3)
                .toList();

        if (genreIds.isEmpty()) {
            throw new IllegalArgumentException("Nenhum gênero válido encontrado para o usuário.");
        }

        List<Map<String, String>> allTracks = new ArrayList<>();

        for (Integer genreId : genreIds) {
            List<Map<String, String>> genreTracks = new ArrayList<>();

            String artistUrl = "https://api.deezer.com/genre/" + genreId + "/artists";
            HttpRequest artistRequest = HttpRequest.newBuilder()
                    .uri(URI.create(artistUrl))
                    .GET()
                    .build();

            HttpResponse<String> artistResponse = httpClient.send(artistRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode artistRoot = mapper.readTree(artistResponse.body());
            JsonNode artists = artistRoot.get("data");

            if (artists == null || !artists.isArray() || artists.isEmpty()) continue;

            // Embaralhar a lista de artistas para tentar diferentes
            List<JsonNode> artistList = new ArrayList<>();
            artists.forEach(artistList::add);
            Collections.shuffle(artistList);

            for (JsonNode artistNode : artistList) {
                if (genreTracks.size() >= 2) break; // Já coletou 2 desse gênero

                String artistId = artistNode.get("id").asText();
                String trackUrl = "https://api.deezer.com/artist/" + artistId + "/top?limit=5";
                HttpRequest trackRequest = HttpRequest.newBuilder()
                        .uri(URI.create(trackUrl))
                        .GET()
                        .build();

                HttpResponse<String> trackResponse = httpClient.send(trackRequest, HttpResponse.BodyHandlers.ofString());
                JsonNode trackRoot = mapper.readTree(trackResponse.body());
                JsonNode tracks = trackRoot.get("data");

                if (tracks == null || !tracks.isArray()) continue;

                for (JsonNode track : tracks) {
                    String title = track.get("title").asText();
                    String artist = track.get("artist").get("name").asText();
                    String url = track.get("link").asText();

                    if (LanguageUtils.isEnglish(title) && LanguageUtils.isEnglish(artist)) {
                        Map<String, String> trackInfo = Map.of(
                                "title", title,
                                "artist", artist,
                                "url", url
                        );
                        if (!genreTracks.contains(trackInfo)) {
                            genreTracks.add(trackInfo);
                        }
                    }

                    if (genreTracks.size() >= 2) break;
                }
            }

            allTracks.addAll(genreTracks);
            if (allTracks.size() >= 6) break;
        }

        return allTracks.stream()
                .distinct()
                .limit(6)
                .collect(Collectors.toList());
    }
}

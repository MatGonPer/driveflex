package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por retornar o perfil de um motorista.
 * Rota esperada: GET /api/driver/profile
 */
public class DriverProfileHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, new JsonSerializer<LocalDateTime>() {
                @Override
                public JsonElement serialize(LocalDateTime src, Type typeOfSrc, JsonSerializationContext context) {
                    return new JsonPrimitive(src.toString());
                }
            })
            .create();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // 1. Garantir que apenas GET é aceito
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use GET.\"}");
            return;
        }

        // 2. Extração e Validação do Token JWT
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        String userIdString;
        try {
            userIdString = JwtUtils.validateTokenAndGetSubject(token);
        } catch (ExpiredJwtException e) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT expirado.\"}");
            return;
        } catch (SignatureException e) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT inválido.\"}");
            return;
        } catch (Exception e) {
            sendResponse(exchange, 401, "{\"error\": \"Falha na validação do token JWT.\"}");
            return;
        }

        UUID userId;
        try {
            userId = UUID.fromString(userIdString);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"ID do usuário inválido no token.\"}");
            return;
        }

        try {
            // 3. Buscar usuário e validar se é motorista
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || !userOpt.get().getRole().equalsIgnoreCase("DRIVER")) {
                sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Apenas motoristas podem acessar este endpoint.\"}");
                return;
            }

            User driver = userOpt.get();

            // 4. Construir resposta com informações do perfil
            JsonObject profileJson = new JsonObject();
            profileJson.addProperty("id", driver.getId().toString());
            profileJson.addProperty("firstName", driver.getFirstName());
            profileJson.addProperty("lastName", driver.getLastName());
            profileJson.addProperty("email", driver.getEmail());
            if (driver.getBirthDate() != null) {
                profileJson.addProperty("birthDate", driver.getBirthDate().toString());
            }
            profileJson.addProperty("role", driver.getRole());
            profileJson.addProperty("createdAt", driver.getCreatedAt().toString());
            profileJson.addProperty("totalTrips", 0); // TODO: Implementar consulta no banco
            profileJson.addProperty("rating", 5.0); // TODO: Implementar cálculo de rating

            String jsonResponse = gson.toJson(profileJson);
            sendResponse(exchange, 200, jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao buscar perfil: " + e.getMessage() + "\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}

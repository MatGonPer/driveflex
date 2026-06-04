package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por retornar e atualizar o perfil de um usuário (cliente ou motorista).
 * Rota esperada: GET e PUT /api/users/profile
 */
public class UserProfileHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new GsonBuilder().create();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if (!"GET".equalsIgnoreCase(method) && !"PUT".equalsIgnoreCase(method)) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use GET ou PUT.\"}");
            return;
        }

        // Extração e Validação do Token JWT
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7);
        String subjectIdString;
        try {
            subjectIdString = JwtUtils.validateTokenAndGetSubject(token);
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
            userId = UUID.fromString(subjectIdString);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"ID do usuário inválido no token.\"}");
            return;
        }

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Usuário não encontrado.\"}");
                return;
            }

            User user = userOpt.get();

            if ("GET".equalsIgnoreCase(method)) {
                // Retorna os dados do perfil
                JsonObject profileJson = new JsonObject();
                profileJson.addProperty("firstName", user.getFirstName());
                profileJson.addProperty("lastName", user.getLastName());
                profileJson.addProperty("email", user.getEmail());
                
                String jsonResponse = gson.toJson(profileJson);
                sendResponse(exchange, 200, jsonResponse);
                
            } else if ("PUT".equalsIgnoreCase(method)) {
                // Atualiza os dados do perfil
                InputStream is = exchange.getRequestBody();
                JsonObject body = gson.fromJson(new InputStreamReader(is, StandardCharsets.UTF_8), JsonObject.class);
                
                if (body == null || !body.has("firstName") || !body.has("lastName")) {
                    sendResponse(exchange, 400, "{\"error\": \"firstName e lastName são obrigatórios.\"}");
                    return;
                }
                
                String firstName = body.get("firstName").getAsString();
                String lastName = body.get("lastName").getAsString();
                
                if (firstName.trim().isEmpty() || lastName.trim().isEmpty()) {
                    sendResponse(exchange, 400, "{\"error\": \"Os campos não podem ser vazios.\"}");
                    return;
                }
                
                userRepository.updateProfile(userId, firstName.trim(), lastName.trim());
                
                JsonObject response = new JsonObject();
                response.addProperty("message", "Perfil atualizado com sucesso!");
                sendResponse(exchange, 200, gson.toJson(response));
            }

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao processar perfil: " + e.getMessage() + "\"}");
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

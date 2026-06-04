package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.PasswordUtils;
import br.com.driveflex.security.JwtUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Handler responsável por validar as credenciais do usuário e emitir o Token JWT.
 */
public class LoginHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Fundamento: Login também deve ser POST para proteger os dados no corpo da requisição
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido\"}");
            return;
        }

        try {
            // 1. Ler o JSON enviado pelo Mobile (email e password)
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = gson.fromJson(body, JsonObject.class);

            String email = json.get("email").getAsString();
            String rawPassword = json.get("password").getAsString();

            // 2. Buscar o usuário no banco pelo e-mail
            Optional<User> userOpt = userRepository.findByEmail(email);

            // 3. Validação Fundamental: E-mail existe? A senha bate com o Hash?
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // O BCrypt.checkpw compara a senha pura com o hash de forma segura
                if (PasswordUtils.verifyPassword(rawPassword, user.getPasswordHash())) {
                    
                    // 4. Se tudo ok, gerar o Crachá (Token JWT)
                    String token = JwtUtils.generateToken(user.getId(), user.getRole());

                    JsonObject response = new JsonObject();
                    response.addProperty("status", "success");
                    response.addProperty("token", token);
                    response.addProperty("role", user.getRole());
                    response.addProperty("name", user.getFirstName() != null ? user.getFirstName() : "Usuário");

                    sendResponse(exchange, 200, gson.toJson(response));
                    return;
                }
            }

            // 5. Se falhar (e-mail ou senha errados), retornamos 401 (Não autorizado)
            // Dica: Nunca diga qual dos dois está errado por segurança!
            sendResponse(exchange, 401, "{\"status\": \"error\", \"message\": \"E-mail ou senha inválidos\"}");

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}

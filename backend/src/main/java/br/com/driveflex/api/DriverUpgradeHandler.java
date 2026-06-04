package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

/**
 * Handler responsável por fazer o upgrade de um usuário logado (USER) para motorista (DRIVER).
 * Rota esperada: POST /api/driver/upgrade
 */
public class DriverUpgradeHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use POST.\"}");
            return;
        }

        // 1. Extração do Token JWT do cabeçalho
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        String userIdString;
        try {
            userIdString = JwtUtils.validateTokenAndGetSubject(token);
        } catch (Exception e) {
            sendResponse(exchange, 401, "{\"error\": \"Token inválido ou expirado.\"}");
            return;
        }

        UUID userId = UUID.fromString(userIdString);

        try {
            // 2. Ler o corpo da requisição (CPF e CNH)
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = gson.fromJson(body, JsonObject.class);

            String cpf = json.has("cpf") && !json.get("cpf").isJsonNull() ? json.get("cpf").getAsString() : "";
            String cnh = json.has("cnh") && !json.get("cnh").isJsonNull() ? json.get("cnh").getAsString() : "";
            String cnhCategory = json.has("cnhCategory") && !json.get("cnhCategory").isJsonNull() ? json.get("cnhCategory").getAsString() : "B";

            // Limpeza de caracteres não-numéricos
            cpf = cpf.replaceAll("\\D", "");
            cnh = cnh.replaceAll("\\D", "");

            if (cpf.length() != 11 || cnh.length() != 11) {
                sendResponse(exchange, 400, "{\"error\": \"CPF e CNH devem conter exatamente 11 dígitos numéricos.\"}");
                return;
            }

            // 3. Buscar usuário no banco e validar existência
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Usuário não encontrado.\"}");
                return;
            }

            User user = userOpt.get();

            // 4. Atualizar a Role para DRIVER no banco
            userRepository.updateRole(userId, "DRIVER");

            // 5. Salvar na tabela drivers_info as informações de motorista
            userRepository.saveDriverInfo(userId, cpf, cnh, cnhCategory);

            // 6. Gerar um novo Token JWT atualizado com a Role de DRIVER
            String newToken = JwtUtils.generateToken(userId, "DRIVER");

            JsonObject responseJson = new JsonObject();
            responseJson.addProperty("status", "success");
            responseJson.addProperty("message", "Usuário promovido a motorista com sucesso!");
            responseJson.addProperty("token", newToken);
            responseJson.addProperty("role", "DRIVER");

            sendResponse(exchange, 200, gson.toJson(responseJson));

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro ao processar upgrade para motorista: " + e.getMessage() + "\"}");
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

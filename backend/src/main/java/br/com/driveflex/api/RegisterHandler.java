package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.PasswordUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handler responsável por processar novas requisições de cadastro.
 * Ele traduz o JSON recebido para o modelo Java e aciona a persistência.
 */
public class RegisterHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Fundamento: APIs REST usam POST para criação de recursos
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "Método não permitido. Use POST.");
            return;
        }

        try {
            // 1. Ler o corpo da requisição (JSON vindo do Mobile)
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            // 2. Converter o JSON para um objeto temporário (JsonObject)
            JsonObject json = gson.fromJson(body, JsonObject.class);

            // 3. Criar e Popular a Entidade User
            User newUser = new User();
            newUser.setId(UUID.randomUUID()); // Geramos o ID único aqui
            newUser.setFirstName(json.get("firstName").getAsString());
            newUser.setLastName(json.get("lastName").getAsString());
            newUser.setEmail(json.get("email").getAsString());
            
            // SEGURANÇA: Hasheamos a senha antes de qualquer outra coisa
            String rawPassword = json.get("password").getAsString();
            newUser.setPasswordHash(PasswordUtils.hashPassword(rawPassword));

            newUser.setBirthDate(LocalDate.parse(json.get("birthDate").getAsString()));
            
            String role = "USER"; // Default role
            if (json.has("role") && !json.get("role").isJsonNull()) {
                String requestedRole = json.get("role").getAsString().toUpperCase();
                if (requestedRole.equals("USER") || requestedRole.equals("DRIVER")) {
                    role = requestedRole;
                }
            }
            newUser.setRole(role); // Set the determined role
            newUser.setCreatedAt(LocalDateTime.now());

            // 4. Persistir no Banco de Dados via Repositório
            userRepository.save(newUser);

            // 4.1 Se for motorista, salvar informações adicionais na tabela drivers_info
            if ("DRIVER".equals(role)) {
                String cpf = json.has("cpf") && !json.get("cpf").isJsonNull() ? json.get("cpf").getAsString() : "";
                String cnh = json.has("cnh") && !json.get("cnh").isJsonNull() ? json.get("cnh").getAsString() : "";
                String cnhCategory = json.has("cnhCategory") && !json.get("cnhCategory").isJsonNull() ? json.get("cnhCategory").getAsString() : "B";
                
                // Remove caracteres não numéricos caso existam por precaução
                cpf = cpf.replaceAll("\\D", "");
                cnh = cnh.replaceAll("\\D", "");
                
                if (cpf.length() != 11 || cnh.length() != 11) {
                    throw new IllegalArgumentException("CPF e CNH devem conter exatamente 11 dígitos numéricos.");
                }
                
                userRepository.saveDriverInfo(newUser.getId(), cpf, cnh, cnhCategory);
            }

            // 5. Responder Sucesso (201 Created)
            JsonObject responseJson = new JsonObject();
            responseJson.addProperty("status", "success");
            responseJson.addProperty("message", "Usuário cadastrado com sucesso!");
            
            sendResponse(exchange, 201, gson.toJson(responseJson));

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("status", "error");
            errorJson.addProperty("message", "Erro ao processar cadastro: " + e.getMessage());
            
            sendResponse(exchange, 400, gson.toJson(errorJson));
        }
    }

    /**
     * Método utilitário para enviar respostas HTTP.
     */
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}

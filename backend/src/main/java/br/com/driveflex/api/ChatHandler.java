package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Message;
import br.com.driveflex.repository.MessageRepository;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonPrimitive;

public class ChatHandler implements HttpHandler {

    private final MessageRepository messageRepository = new MessageRepository();
    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson;

    public ChatHandler() {
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, (JsonSerializer<LocalDateTime>) (src, typeOfSrc, context) -> new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))
                .create();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        // /api/contracts/{id}/messages
        String[] parts = path.split("/");
        if (parts.length < 5) {
            sendResponse(exchange, 400, "{\"error\": \"ID do contrato não fornecido.\"}");
            return;
        }

        UUID contractId;
        try {
            contractId = UUID.fromString(parts[3]);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"ID do contrato inválido.\"}");
            return;
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7);
        String subjectIdString;
        try {
            subjectIdString = JwtUtils.validateTokenAndGetSubject(token);
        } catch (Exception e) {
            sendResponse(exchange, 401, "{\"error\": \"Falha na validação do token JWT.\"}");
            return;
        }
        UUID userId = UUID.fromString(subjectIdString);

        if ("GET".equalsIgnoreCase(method)) {
            List<Message> messages = messageRepository.findByContractId(contractId);
            sendResponse(exchange, 200, gson.toJson(messages));
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            JsonObject body = gson.fromJson(new InputStreamReader(is, StandardCharsets.UTF_8), JsonObject.class);
            if (body == null || !body.has("message") || body.get("message").getAsString().trim().isEmpty()) {
                sendResponse(exchange, 400, "{\"error\": \"Mensagem não pode ser vazia.\"}");
                return;
            }
            
            Message msg = new Message(contractId, userId, body.get("message").getAsString());
            Message savedMsg = messageRepository.save(msg);
            
            sendResponse(exchange, 201, gson.toJson(savedMsg));
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido.\"}");
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

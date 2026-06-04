package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Contract;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonPrimitive;

public class ContractByIdHandler implements HttpHandler {

    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson;

    public ContractByIdHandler() {
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, (JsonSerializer<LocalDateTime>) (src, typeOfSrc, context) -> new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))
                .create();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido.\"}");
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");
        if (parts.length < 4) {
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

        try {
            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Contrato não encontrado.\"}");
                return;
            }

            sendResponse(exchange, 200, gson.toJson(contractOpt.get()));
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno: " + e.getMessage() + "\"}");
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

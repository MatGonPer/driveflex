package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Contract;
import br.com.driveflex.model.User;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por cancelar um contrato.
 * Rota esperada: PATCH /api/contracts/{id}/cancel
 */
public class CancelContractHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final ContractRepository contractRepository = new ContractRepository();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"PATCH".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use PATCH.\"}");
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

            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Contrato não encontrado.\"}");
                return;
            }

            Contract contract = contractOpt.get();
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Usuário não encontrado.\"}");
                return;
            }
            User user = userOpt.get();

            // Check permissions: only the client or the assigned driver can cancel
            boolean isClient = contract.getClientId().equals(userId);
            boolean isDriver = contract.getDriverId() != null && contract.getDriverId().equals(userId);

            if (!isClient && !isDriver) {
                sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Apenas o cliente ou o motorista do contrato podem cancelá-lo.\"}");
                return;
            }

            if (contract.getStatus().equalsIgnoreCase("CANCELLED")) {
                sendResponse(exchange, 400, "{\"error\": \"Contrato já está cancelado.\"}");
                return;
            }

            boolean updated = contractRepository.updateStatus(contractId, "CANCELLED");
            if (!updated) {
                sendResponse(exchange, 500, "{\"error\": \"Falha ao cancelar contrato.\"}");
                return;
            }

            String jsonResponse = "{\"message\": \"Contrato cancelado com sucesso.\", \"contractId\": \"" + contractId + "\", \"newStatus\": \"CANCELLED\"}";
            sendResponse(exchange, 200, jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao cancelar contrato: " + e.getMessage() + "\"}");
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

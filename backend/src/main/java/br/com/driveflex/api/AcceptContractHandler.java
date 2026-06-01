package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
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
 * Handler responsável por aceitar um contrato.
 * Rota esperada: PATCH /api/contracts/{id}/accept
 */
public class AcceptContractHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // 1. Garantir que apenas PATCH é aceito
        if (!"PATCH".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use PATCH.\"}");
            return;
        }

        // 2. Extração e Validação do Token JWT
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        String driverIdString;
        try {
            driverIdString = JwtUtils.validateTokenAndGetSubject(token);
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

        UUID driverId;
        try {
            driverId = UUID.fromString(driverIdString);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"ID do usuário inválido no token.\"}");
            return;
        }

        try {
            // 3. Validar se o usuário autenticado é motorista
            Optional<User> driverOpt = userRepository.findById(driverId);
            if (driverOpt.isEmpty() || !driverOpt.get().getRole().equalsIgnoreCase("DRIVER")) {
                sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Apenas motoristas podem aceitar contratos.\"}");
                return;
            }

            // 4. Extrair ID do contrato da URL
            // Esperado: /api/contracts/{contractId}/accept
            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");
            
            if (parts.length < 4) {
                sendResponse(exchange, 400, "{\"error\": \"ID do contrato não fornecido.\"}");
                return;
            }

            UUID contractId;
            try {
                contractId = UUID.fromString(parts[3]); // parts[0]="", parts[1]="api", parts[2]="contracts", parts[3]=contractId
            } catch (IllegalArgumentException e) {
                sendResponse(exchange, 400, "{\"error\": \"ID do contrato inválido.\"}");
                return;
            }

            // 5. Buscar contrato e validar
            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                sendResponse(exchange, 404, "{\"error\": \"Contrato não encontrado.\"}");
                return;
            }

            Contract contract = contractOpt.get();
            
            // Validar que o motorista é o mesmo do contrato
            if (!contract.getDriverId().equals(driverId)) {
                sendResponse(exchange, 403, "{\"error\": \"Você não tem permissão para aceitar este contrato.\"}");
                return;
            }

            // Validar que o contrato está em status PENDING
            if (!contract.getStatus().equalsIgnoreCase("PENDING")) {
                sendResponse(exchange, 400, "{\"error\": \"Contrato não está em status PENDING. Status atual: " + contract.getStatus() + "\"}");
                return;
            }

            // 6. Atualizar status do contrato
            boolean updated = contractRepository.updateStatus(contractId, "ACCEPTED");
            if (!updated) {
                sendResponse(exchange, 500, "{\"error\": \"Falha ao atualizar status do contrato.\"}");
                return;
            }

            // 7. Retornar sucesso
            String jsonResponse = "{\"message\": \"Contrato aceito com sucesso.\", \"contractId\": \"" + contractId + "\", \"newStatus\": \"ACCEPTED\"}";
            sendResponse(exchange, 200, jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao aceitar contrato: " + e.getMessage() + "\"}");
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

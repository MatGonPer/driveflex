package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Contract;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por excluir um contrato pendente.
 * Rota esperada: DELETE /api/contracts/{id}
 */
public class DeleteContractHandler implements HttpHandler {

    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson = new GsonBuilder().create();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if (!"DELETE".equalsIgnoreCase(method)) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use DELETE.\"}");
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

        // Extrair o ID do contrato da URL (/api/contracts/{id})
        String path = exchange.getRequestURI().getPath();
        String[] pathParts = path.split("/");
        
        if (pathParts.length < 4) {
            sendResponse(exchange, 400, "{\"error\": \"ID do contrato não fornecido.\"}");
            return;
        }
        
        UUID contractId;
        try {
            contractId = UUID.fromString(pathParts[3]);
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

            Contract contract = contractOpt.get();

            // Verifica se o usuário é o cliente ou o motorista do contrato
            if (!contract.getClientId().equals(userId) && (contract.getDriverId() == null || !contract.getDriverId().equals(userId))) {
                sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Apenas o cliente ou motorista podem excluir o contrato.\"}");
                return;
            }
            
            // Removida a verificação de status PENDENTE a pedido do usuário

            boolean deleted = contractRepository.deleteById(contractId);
            
            if (deleted) {
                JsonObject response = new JsonObject();
                response.addProperty("message", "Contrato excluído com sucesso!");
                sendResponse(exchange, 200, gson.toJson(response));
            } else {
                sendResponse(exchange, 500, "{\"error\": \"Falha ao excluir o contrato no banco de dados.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor: " + e.getMessage() + "\"}");
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

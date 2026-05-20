package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Contract;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public class ContractManageHandler implements HttpHandler {

    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            sendResponse(exchange, 204, "");
            return;
        }

        if (!"PUT".equalsIgnoreCase(method) && !"DELETE".equalsIgnoreCase(method)) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use PUT ou DELETE.\"}");
            return;
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7);
        String clientIdString;
        try {
            clientIdString = JwtUtils.validateTokenAndGetSubject(token);
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
        
        UUID clientId = UUID.fromString(clientIdString);

        // Extrair ID da URL: /api/contracts/1234-abcd
        String path = exchange.getRequestURI().getPath();
        String idParam = path.substring("/api/contracts/".length());
        
        if (idParam.isEmpty()) {
            sendResponse(exchange, 400, "{\"error\": \"ID do contrato ausente.\"}");
            return;
        }

        UUID contractId;
        try {
            contractId = UUID.fromString(idParam);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"ID do contrato inválido.\"}");
            return;
        }

        // Buscar contrato para garantir que existe e pertence ao usuário
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        
        if (contractOpt.isEmpty()) {
            sendResponse(exchange, 404, "{\"error\": \"Contrato não encontrado.\"}");
            return;
        }
        
        Contract contract = contractOpt.get();
        if (!contract.getClientId().equals(clientId)) {
            sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Você não é dono deste contrato.\"}");
            return;
        }
        
        if (!"PENDING".equals(contract.getStatus())) {
            sendResponse(exchange, 400, "{\"error\": \"Apenas contratos pendentes podem ser alterados ou excluídos.\"}");
            return;
        }

        if ("DELETE".equalsIgnoreCase(method)) {
            boolean deleted = contractRepository.delete(contractId, clientId);
            if (deleted) {
                sendResponse(exchange, 200, "{\"status\": \"success\", \"message\": \"Contrato excluído.\"}");
            } else {
                sendResponse(exchange, 500, "{\"error\": \"Falha ao excluir contrato.\"}");
            }
        } else if ("PUT".equalsIgnoreCase(method)) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = gson.fromJson(body, JsonObject.class);

                if (json.has("vehicleCategory")) {
                    contract.setVehicleCategory(json.get("vehicleCategory").getAsString());
                }
                if (json.has("origin")) {
                    contract.setOrigin(json.get("origin").getAsString());
                }
                if (json.has("destination")) {
                    contract.setDestination(json.get("destination").getAsString());
                }
                if (json.has("passengerName")) {
                    contract.setPassengerName(json.get("passengerName").getAsString());
                }
                if (json.has("startTime")) {
                    contract.setStartTime(LocalDateTime.parse(json.get("startTime").getAsString()));
                }
                if (json.has("endTime") && !json.get("endTime").isJsonNull()) {
                    String end = json.get("endTime").getAsString();
                    if (!end.isEmpty()) {
                        contract.setEndTime(LocalDateTime.parse(end));
                    } else {
                        contract.setEndTime(null);
                    }
                }
                
                contract.setUpdatedAt(LocalDateTime.now());
                contractRepository.update(contract);
                
                sendResponse(exchange, 200, "{\"status\": \"success\", \"message\": \"Contrato atualizado com sucesso.\"}");
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"Erro interno ao atualizar contrato.\"}");
            }
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        // Traefik cuida do CORS, mas pode ser adicionado aqui caso seja chamado diretamente
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}

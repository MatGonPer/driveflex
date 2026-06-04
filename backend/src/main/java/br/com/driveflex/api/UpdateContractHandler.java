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
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por atualizar um contrato pendente.
 * Rota esperada: PUT /api/contracts/{id}
 */
public class UpdateContractHandler implements HttpHandler {

    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson = new GsonBuilder().create();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if (!"PUT".equalsIgnoreCase(method)) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use PUT.\"}");
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
        
        // Exemplo: /api/contracts/123-abc
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

            // Verifica permissões: cliente dono ou motorista
            boolean isClient = contract.getClientId().equals(userId);
            
            // Verificar se o usuário é motorista (para permitir propor mudanças em PENDING ou ACCEPTED)
            Optional<br.com.driveflex.model.User> userOpt = new br.com.driveflex.repository.UserRepository().findById(userId);
            boolean isDriver = userOpt.isPresent() && "DRIVER".equalsIgnoreCase(userOpt.get().getRole());

            if (!isClient && !isDriver) {
                sendResponse(exchange, 403, "{\"error\": \"Acesso negado. Apenas o criador ou um motorista podem editar o contrato.\"}");
                return;
            }
            
            // Impede edição de contratos cancelados
            if ("CANCELLED".equalsIgnoreCase(contract.getStatus())) {
                sendResponse(exchange, 400, "{\"error\": \"Contratos CANCELADOS não podem ser editados.\"}");
                return;
            }

            // Lê os dados
            InputStream is = exchange.getRequestBody();
            JsonObject body = gson.fromJson(new InputStreamReader(is, StandardCharsets.UTF_8), JsonObject.class);
            
            if (body == null) {
                sendResponse(exchange, 400, "{\"error\": \"Corpo da requisição inválido.\"}");
                return;
            }
            
            String pickupLocation = body.has("pickupLocation") && !body.get("pickupLocation").isJsonNull() ? body.get("pickupLocation").getAsString() : contract.getPickupLocation();
            String dropoffLocation = body.has("dropoffLocation") && !body.get("dropoffLocation").isJsonNull() ? body.get("dropoffLocation").getAsString() : contract.getDropoffLocation();
            
            LocalDateTime startTime = contract.getStartTime();
            if (body.has("startTime") && !body.get("startTime").isJsonNull()) {
                try {
                    startTime = LocalDateTime.parse(body.get("startTime").getAsString().replace("Z", ""));
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"error\": \"Formato de startTime inválido.\"}");
                    return;
                }
            }
            
            LocalDateTime endTime = contract.getEndTime();
            if (body.has("endTime") && !body.get("endTime").isJsonNull()) {
                try {
                    endTime = LocalDateTime.parse(body.get("endTime").getAsString().replace("Z", ""));
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"error\": \"Formato de endTime inválido.\"}");
                    return;
                }
            }
            
            Double estimatedFare = contract.getEstimatedFare();
            if (body.has("estimatedFare") && !body.get("estimatedFare").isJsonNull()) {
                estimatedFare = body.get("estimatedFare").getAsDouble();
            }
            
            contractRepository.updateContractDetails(contractId, pickupLocation, dropoffLocation, startTime, endTime, estimatedFare);
            
            // Sempre que houver uma edição (nova proposta), volta para PENDING
            contractRepository.updateStatus(contractId, "PENDING");
            
            JsonObject response = new JsonObject();
            response.addProperty("message", "Contrato atualizado com sucesso!");
            sendResponse(exchange, 200, gson.toJson(response));

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

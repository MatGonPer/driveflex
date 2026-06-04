package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.Contract;
import br.com.driveflex.model.User;
import br.com.driveflex.repository.ContractRepository;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

/**
 * Handler responsável por processar a contratação de um motorista por um cliente.
 * Requer autenticação via JWT.
 */
public class HireDriverHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final ContractRepository contractRepository = new ContractRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use POST.\"}");
            return;
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
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

        try {
            // 1. Ler o corpo da requisição (JSON com driverId, startTime, endTime, pickupLocation, dropoffLocation, estimatedFare)
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = gson.fromJson(body, JsonObject.class);

            UUID driverId = null;
            if (json.has("driverId") && !json.get("driverId").isJsonNull() && !json.get("driverId").getAsString().isEmpty()) {
                driverId = UUID.fromString(json.get("driverId").getAsString());
            }
            
            LocalDateTime startTime = LocalDateTime.parse(json.get("startTime").getAsString());
            LocalDateTime endTime = null; // Opcional
            if (json.has("endTime") && !json.get("endTime").isJsonNull() && !json.get("endTime").getAsString().isEmpty()) {
                endTime = LocalDateTime.parse(json.get("endTime").getAsString());
            }

            String pickupLocation = null;
            if (json.has("pickupLocation") && !json.get("pickupLocation").isJsonNull()) {
                pickupLocation = json.get("pickupLocation").getAsString();
            }

            String dropoffLocation = null;
            if (json.has("dropoffLocation") && !json.get("dropoffLocation").isJsonNull()) {
                dropoffLocation = json.get("dropoffLocation").getAsString();
            }

            Double estimatedFare = null;
            if (json.has("estimatedFare") && !json.get("estimatedFare").isJsonNull()) {
                estimatedFare = json.get("estimatedFare").getAsDouble();
            }

            // 2. Validar existência e papéis (roles) de cliente e motorista (se houver motorista)
            Optional<User> clientOpt = userRepository.findById(clientId);
            Optional<User> driverOpt = Optional.empty();
            if (driverId != null) {
                driverOpt = userRepository.findById(driverId);
            }

            if (clientOpt.isEmpty() || (!clientOpt.get().getRole().equalsIgnoreCase("USER") && !clientOpt.get().getRole().equalsIgnoreCase("DRIVER"))) {
                sendResponse(exchange, 403, "{\"error\": \"Cliente não encontrado ou sem permissão.\"}");
                return;
            }
            if (driverId != null && (driverOpt.isEmpty() || !driverOpt.get().getRole().equalsIgnoreCase("DRIVER"))) {
                sendResponse(exchange, 400, "{\"error\": \"Motorista não encontrado ou sem permissão para ser contratado.\"}");
                return;
            }

            // 3. Criar e Popular a Entidade Contract
            Contract newContract = new Contract();
            newContract.setId(UUID.randomUUID());
            newContract.setClientId(clientId);
            newContract.setDriverId(driverId);
            newContract.setStatus("PENDING"); // Status inicial
            newContract.setStartTime(startTime);
            newContract.setEndTime(endTime);
            newContract.setPickupLocation(pickupLocation);
            newContract.setDropoffLocation(dropoffLocation);
            newContract.setEstimatedFare(estimatedFare);
            newContract.setCreatedAt(LocalDateTime.now());
            newContract.setUpdatedAt(LocalDateTime.now());

            // 4. Persistir no Banco de Dados via Repositório
            contractRepository.save(newContract);

            // 5. Responder Sucesso (201 Created)
            JsonObject responseJson = new JsonObject();
            responseJson.addProperty("status", "success");
            responseJson.addProperty("message", "Contrato de contratação criado com sucesso!");
            responseJson.addProperty("contractId", newContract.getId().toString());
            
            sendResponse(exchange, 201, gson.toJson(responseJson));

        } catch (DateTimeParseException e) {
            sendResponse(exchange, 400, "{\"error\": \"Formato de data/hora inválido. Use ISO-8601 (ex: '2024-05-15T10:30:00').\"}");
        } catch (IllegalArgumentException e) {
             sendResponse(exchange, 400, "{\"error\": \"ID de motorista inválido ou dados ausentes.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao criar contrato: " + e.getMessage() + "\"}");
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
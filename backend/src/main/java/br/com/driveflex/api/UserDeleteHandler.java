package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Handler responsável por deletar um usuário pelo ID.
 * Requer autenticação via JWT e autoriza apenas a auto-exclusão.
 */
public class UserDeleteHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use DELETE.\"}");
            return;
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        UUID authenticatedUserId;
        try {
            authenticatedUserId = UUID.fromString(JwtUtils.validateTokenAndGetSubject(token));
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

        // Extrai o ID do usuário a ser deletado da URL (ex: /api/users/{id})
        String path = exchange.getRequestURI().getPath();
        String[] pathSegments = path.split("/");
        if (pathSegments.length < 4) { // /api/users/{id} -> 4 segments
            sendResponse(exchange, 400, "{\"error\": \"ID do usuário não fornecido na URL.\"}");
            return;
        }

        UUID userIdToDelete;
        try {
            userIdToDelete = UUID.fromString(pathSegments[3]);
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\": \"Formato de ID de usuário inválido.\"}");
            return;
        }

        // Autorização: Permite que um usuário delete apenas a sua própria conta
        // Em um cenário real, um ADMIN também poderia deletar outras contas.
        if (!authenticatedUserId.equals(userIdToDelete)) {
            sendResponse(exchange, 403, "{\"error\": \"Não autorizado a deletar a conta de outro usuário.\"}");
            return;
        }

        try {
            boolean deleted = userRepository.deleteById(userIdToDelete);
            if (deleted) {
                sendResponse(exchange, 200, "{\"status\": \"success\", \"message\": \"Usuário deletado com sucesso.\"}");
            } else {
                sendResponse(exchange, 404, "{\"status\": \"error\", \"message\": \"Usuário não encontrado.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao deletar usuário: " + e.getMessage() + "\"}");
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
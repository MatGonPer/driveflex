package br.com.driveflex.api;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

import br.com.driveflex.model.User;
import br.com.driveflex.repository.UserRepository;
import br.com.driveflex.security.JwtUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Handler responsável por listar todos os usuários.
 * Requer autenticação via JWT.
 */
public class UserListHandler implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    // Gson configurado para serializar LocalDate e LocalDateTime
    private final Gson gson = new GsonBuilder()
        .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
        .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
        .create();


    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"error\": \"Método não permitido. Use GET.\"}");
            return;
        }

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, "{\"error\": \"Token JWT ausente ou malformatado.\"}");
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        try {
            // Apenas valida o token, não precisamos do subject para listar todos os usuários
            JwtUtils.validateTokenAndGetSubject(token); 
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

        try {
            List<User> users = userRepository.findAll();
            // Por segurança, não queremos retornar o passwordHash em uma lista de usuários
            // Precisa de um DTO ou @Expose no User model se quisermos Gson
            // Por simplicidade para dev, vou setar null nos hashes
            users.forEach(user -> user.setPasswordHash(null)); 

            String jsonResponse = gson.toJson(users);
            sendResponse(exchange, 200, jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\": \"Erro interno no servidor ao listar usuários.\"}");
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

// Adaptadores para Gson lidar com LocalDate e LocalDateTime
// Nota: Em um projeto maior, essas classes seriam globais ou em um pacote util
class LocalDateAdapter extends com.google.gson.TypeAdapter<LocalDate> {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public void write(com.google.gson.stream.JsonWriter out, LocalDate value) throws IOException {
        if (value == null) {
            out.nullValue();
        } else {
            out.value(formatter.format(value));
        }
    }

    @Override
    public LocalDate read(com.google.gson.stream.JsonReader in) throws IOException {
        if (in.peek() == com.google.gson.stream.JsonToken.NULL) {
            in.nextNull();
            return null;
        }
        return LocalDate.parse(in.nextString(), formatter);
    }
}

class LocalDateTimeAdapter extends com.google.gson.TypeAdapter<LocalDateTime> {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public void write(com.google.gson.stream.JsonWriter out, LocalDateTime value) throws IOException {
        if (value == null) {
            out.nullValue();
        } else {
            out.value(formatter.format(value));
        }
    }

    @Override
    public LocalDateTime read(com.google.gson.stream.JsonReader in) throws IOException {
        if (in.peek() == com.google.gson.stream.JsonToken.NULL) {
            in.nextNull();
            return null;
        }
        return LocalDateTime.parse(in.nextString(), formatter);
    }
}
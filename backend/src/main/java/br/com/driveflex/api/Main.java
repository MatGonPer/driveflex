package br.com.driveflex.api;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import br.com.driveflex.config.DBSetup;

public class Main {

    public static void main(String[] args) throws Exception {
        // 1. Inicializa o banco (Sua lógica de Retry funcionou!)
        DBSetup.init();

        System.out.println("------------------------------------");
        System.out.println("Driveflex API v1.0 - Java 25 Native");
        System.out.println("------------------------------------");

        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);

        // 2. REGISTRO DAS ROTAS (Crucial!)
        server.createContext("/health", new HealthCheckHandler());
        
        // Esta linha PRECISA estar aqui para o cadastro funcionar:
        server.createContext("/auth/register", new RegisterHandler());
        server.createContext("/auth/login", new LoginHandler());

        server.setExecutor(null);
        server.start();

        System.out.println("[INFO] Servidor rodando na porta 8081.");
        System.out.println("[INFO] Rota registrada: /auth/register");
        System.out.println("[INFO] Pronto para receber conexões.");

        // Mantém o processo vivo no Docker
        Thread.currentThread().join();
    }

    static class HealthCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String jsonResponse = "{\"status\": \"UP\", \"message\": \"Driveflex operacional\"}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(jsonResponse.getBytes());
            }
        }
    }
}

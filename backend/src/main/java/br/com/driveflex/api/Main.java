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
        server.createContext("/health", new CorsHandler(new HealthCheckHandler()));
        
        // Esta linha PRECISA estar aqui para o cadastro funcionar:
        server.createContext("/auth/register", new CorsHandler(new RegisterHandler()));
        server.createContext("/auth/login", new CorsHandler(new LoginHandler()));
        server.createContext("/api/contracts/hire", new CorsHandler(new HireDriverHandler()));
        server.createContext("/api/users", new CorsHandler(new UserListHandler()));
        // For DELETE /api/users/{id}, the context path needs to be just /api/users
        // The handler itself will parse the {id} from the request URI
        server.createContext("/api/users/", new CorsHandler(new UserDeleteHandler())); 
        server.createContext("/api/users/profile", new CorsHandler(new UserProfileHandler()));
        
        // Contracts
        server.createContext("/api/contracts/pending", new CorsHandler(new PendingContractsHandler()));
        server.createContext("/api/contracts/active", new CorsHandler(new ActiveContractsHandler()));
        server.createContext("/api/contracts/history", new CorsHandler(new HistoryContractsHandler()));
        server.createContext("/api/driver/profile", new CorsHandler(new DriverProfileHandler()));
        
        // Contracts (using prefix match for dynamic IDs like /api/contracts/{id}/accept or /cancel)
        server.createContext("/api/contracts/", new CorsHandler((exchange) -> {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            if ("PATCH".equalsIgnoreCase(method)) {
                if (path.endsWith("/accept")) {
                    new AcceptContractHandler().handle(exchange);
                } else if (path.endsWith("/cancel")) {
                    new CancelContractHandler().handle(exchange);
                } else {
                    exchange.sendResponseHeaders(404, -1);
                }
            } else if ("PUT".equalsIgnoreCase(method)) {
                new UpdateContractHandler().handle(exchange);
            } else if ("DELETE".equalsIgnoreCase(method)) {
                new DeleteContractHandler().handle(exchange);
            } else if ("GET".equalsIgnoreCase(method)) {
                if (path.endsWith("/messages")) {
                    new ChatHandler().handle(exchange);
                } else {
                    new ContractByIdHandler().handle(exchange);
                }
            } else if ("POST".equalsIgnoreCase(method)) {
                if (path.endsWith("/messages")) {
                    new ChatHandler().handle(exchange);
                } else {
                    exchange.sendResponseHeaders(404, -1);
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }));
        server.createContext("/api/driver/upgrade", new CorsHandler(new DriverUpgradeHandler()));


        server.setExecutor(null);
        server.start();

        System.out.println("[INFO] Servidor rodando na porta 8081.");
        System.out.println("[INFO] Rota registrada: /auth/register");
        System.out.println("[INFO] Rota registrada: /auth/login");
        System.out.println("[INFO] Rota registrada: /api/contracts/hire");
        System.out.println("[INFO] Rota registrada: GET /api/contracts/pending");
        System.out.println("[INFO] Rota registrada: GET /api/users (List all users)");
        System.out.println("[INFO] Rota registrada: DELETE /api/users/{id} (Delete user)");
        System.out.println("[INFO] Rota registrada: GET /api/driver/profile (Driver profile)");
        System.out.println("[INFO] Rota registrada: PATCH /api/contracts/{id}/accept (Accept contract)");
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

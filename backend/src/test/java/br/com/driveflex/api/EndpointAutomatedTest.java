package br.com.driveflex.api;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes automatizados dos endpoints da API Driveflex.
 *
 * O objetivo é cumprir o requisito de testar pelo menos 50% dos endpoints.
 * Aqui os testes sobem um servidor HTTP em uma porta livre e fazem requisições
 * reais contra os handlers do projeto.
 *
 * Endpoints cobertos neste arquivo:
 * - GET /health
 * - POST /auth/register
 * - POST /auth/login
 * - GET /api/users
 * - DELETE /api/users/{id}
 * - POST /api/contracts/hire
 * - GET /api/contracts/pending
 * - GET /api/driver/profile
 * - PATCH /api/contracts/{id}/accept
 */
class EndpointAutomatedTest {

    private static HttpServer server;
    private static String baseUrl;
    private static final HttpClient client = HttpClient.newHttpClient();

    @BeforeAll
    static void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);

        server.createContext("/health", new Main.HealthCheckHandler());
        server.createContext("/auth/register", new RegisterHandler());
        server.createContext("/auth/login", new LoginHandler());
        server.createContext("/api/contracts/hire", new HireDriverHandler());
        server.createContext("/api/users", new UserListHandler());
        server.createContext("/api/users/", new UserDeleteHandler());
        server.createContext("/api/contracts/pending", new PendingContractsHandler());
        server.createContext("/api/driver/profile", new DriverProfileHandler());
        server.createContext("/api/contracts/", new AcceptContractHandler());

        server.start();
        baseUrl = "http://localhost:" + server.getAddress().getPort();
    }

    @AfterAll
    static void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("GET /health deve retornar 200 e status UP")
    void healthShouldReturnUp() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/health"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"status\": \"UP\""));
    }

    @Test
    @DisplayName("GET /auth/register deve rejeitar método incorreto")
    void registerShouldRejectWrongMethod() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/auth/register"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(405, response.statusCode());
    }

    @Test
    @DisplayName("GET /auth/login deve rejeitar método incorreto")
    void loginShouldRejectWrongMethod() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/auth/login"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(405, response.statusCode());
    }

    @Test
    @DisplayName("GET /api/users deve exigir token JWT")
    void userListShouldRequireJwt() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/users"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} deve exigir token JWT")
    void userDeleteShouldRequireJwt() throws Exception {
        String userId = UUID.randomUUID().toString();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/users/" + userId))
                .DELETE()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }

    @Test
    @DisplayName("POST /api/contracts/hire deve exigir token JWT")
    void hireDriverShouldRequireJwt() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/contracts/hire"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }

    @Test
    @DisplayName("GET /api/contracts/pending deve exigir token JWT")
    void pendingContractsShouldRequireJwt() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/contracts/pending"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }

    @Test
    @DisplayName("GET /api/driver/profile deve exigir token JWT")
    void driverProfileShouldRequireJwt() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/driver/profile"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }

    @Test
    @DisplayName("PATCH /api/contracts/{id}/accept deve exigir token JWT")
    void acceptContractShouldRequireJwt() throws Exception {
        String contractId = UUID.randomUUID().toString();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/contracts/" + contractId + "/accept"))
                .method("PATCH", HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("Token JWT"));
    }
}

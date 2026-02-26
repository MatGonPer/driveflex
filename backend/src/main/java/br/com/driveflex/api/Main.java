package br.com.driveflex.api;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("Iniciando o sistema Driveflex...");

        // 1. Teste de Conexão com o Banco de Dados
        try (Connection conn = DatabaseConfig.getConnection()) {
            System.out.println("Conexao com PostgreSQL Master: OK");
        } catch (SQLException e) {
            System.err.println("ERRO CRITICO: Nao foi possivel conectar ao banco de dados.");
            e.printStackTrace();
            // Opcional: System.exit(1); se quiser que o container pare caso falhe o banco
        }

        // 2. Configuracao do Servidor HTTP Nativo
        // Escutando na porta 8081 conforme configurado no Dockerfile e Traefik
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);

        // Define a rota de teste
        server.createContext("/", new RootHandler());

        server.setExecutor(null);
        server.start();

        System.out.println("Servidor HTTP rodando na porta 8081.");
        System.out.println("Acesse via Traefik em: http://localhost");
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String htmlResponse = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Driveflex API</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
                        .status { color: green; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Driveflex Backend</h1>
                    <p class='status'>Servidor e Banco de Dados conectados com sucesso!</p>
                </body>
                </html>
                """;

            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, htmlResponse.getBytes().length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(htmlResponse.getBytes());
            }
        }
    }
}

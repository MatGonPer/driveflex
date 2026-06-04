package br.com.driveflex.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

/**
 * Middleware/Decorator responsável por interceptar as requisições HTTP e 
 * aplicar as configurações de CORS (Cross-Origin Resource Sharing).
 * Essencial para permitir a comunicação estável com navegadores web (Metro do Expo).
 */
public class CorsHandler implements HttpHandler {
    
    private final HttpHandler delegate;

    public CorsHandler(HttpHandler delegate) {
        this.delegate = delegate;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // 1. Configurar cabeçalhos CORS de resposta universal
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // 2. Tratar a pré-requisição OPTIONS (Preflight Request do navegador)
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            // Navegadores esperam resposta de sucesso rápido (204 ou 200) para autorizar CORS
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // 3. Encaminhar a requisição real para o handler correspondente
        delegate.handle(exchange);
    }
}

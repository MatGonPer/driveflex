package br.com.driveflex.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

/**
 * Utilitário para geração e validação de Tokens JWT (Versão JJWT 0.12+).
 */
public class JwtUtils {

    // Chave secreta fixa para os tokens não expirarem quando o servidor reiniciar
    private static final String SECRET_STRING = "driveflex-super-secret-key-for-jwt-tokens-12345";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    
    // O token expira em 24 horas
    private static final long EXPIRATION_TIME = 86_400_000;

    /**
     * Gera um Token para um usuário.
     */
    public static String generateToken(UUID userId, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Valida o token e extrai o ID do usuário.
     */
    public static String validateTokenAndGetSubject(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}

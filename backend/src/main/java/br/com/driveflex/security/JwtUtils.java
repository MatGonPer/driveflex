package br.com.driveflex.security;

import io.jsonwebtoken.Jwts;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

/**
 * Utilitário para geração e validação de Tokens JWT (Versão JJWT 0.12+).
 */
public class JwtUtils {

    // Gerando uma chave segura compatível com a nova API
    private static final SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    
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

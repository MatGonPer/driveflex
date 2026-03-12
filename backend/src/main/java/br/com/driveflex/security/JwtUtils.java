package br.com.driveflex.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

/**
 * Utilitário para geração e validação de Tokens JWT.
 * O JWT funciona como um "selo de autenticidade" assinado pelo servidor.
 */
public class JwtUtils {

    // FUNDAMENTO: A Secret Key deve ser protegida. 
    // Em produção, ela viria de uma variável de ambiente.
    // Aqui geramos uma chave segura para o algoritmo HS256.
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // O token expira em 24 horas (em milissegundos)
    private static final long EXPIRATION_TIME = 86_400_000;

    /**
     * Gera um Token para um usuário recém-logado.
     * @param userId ID do usuário vindo do banco.
     * @param role Papel do usuário (USER ou DRIVER).
     * @return String do Token JWT.
     */
    public static String generateToken(UUID userId, String role) {
        return Jwts.builder()
                .setSubject(userId.toString()) // O "dono" do token
                .claim("role", role)           // Informação extra (Payload)
                .setIssuedAt(new Date())       // Data de criação
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Expiração
                .signWith(SECRET_KEY)          // Assinatura digital
                .compact();
    }

    /**
     * Valida o token e extrai o ID do usuário.
     */
    public static String validateTokenAndGetSubject(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}

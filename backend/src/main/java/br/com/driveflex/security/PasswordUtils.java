package br.com.driveflex.security;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utilitário de segurança para tratamento de senhas.
 * Baseado no algoritmo BCrypt, que é o padrão da indústria para Hashing.
 */
public class PasswordUtils {

    /**
     * Transforma uma senha em texto puro em um hash criptográfico.
     * @param password Senha vinda do usuário (ex: "123456")
     * @return String contendo o hash seguro para salvar no banco.
     */
    public static String hashPassword(String password) {
        // O gensalt(12) define o "custo" do processamento. 
        // 12 é um equilíbrio excelente entre segurança e velocidade no Java 25.
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    /**
     * Verifica se a senha digitada no login bate com o hash guardado no banco.
     * @param password Senha digitada agora.
     * @param hashed Hash recuperado do banco de dados.
     * @return true se as senhas coincidirem.
     */
    public static boolean verifyPassword(String password, String hashed) {
        try {
            return BCrypt.checkpw(password, hashed);
        } catch (Exception e) {
            // Caso o hash esteja corrompido ou em formato inválido
            return false;
        }
    }
}

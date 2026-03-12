package br.com.driveflex.config;

import java.sql.Connection;
import java.sql.Statement;
import java.sql.SQLException;

public class DBSetup {

    /**
     * Tenta inicializar o banco com lógica de repetição (Retry).
     */
    public static void init() {
        int tentativas = 0;
        int maxTentativas = 10;

        while (tentativas < maxTentativas) {
            try (Connection conn = DatabaseConfig.getConnection()) {
                System.out.println("[DBSetup] Conexão estabelecida com sucesso!");
                criarTabelas(conn);
                return; // Sucesso! Sai do método.
            } catch (SQLException e) {
                tentativas++;
                System.out.println("[DBSetup] Banco ainda não está pronto (" + tentativas + "/" + maxTentativas + ")...");
                try {
                    // Espera 3 segundos antes de tentar de novo
                    Thread.sleep(3000);
                } catch (InterruptedException ignored) {}
            }
        }

        System.err.println("[DBSetup] Erro FATAL: Não foi possível conectar ao banco após várias tentativas.");
        System.exit(1);
    }

    private static void criarTabelas(Connection conn) throws SQLException {
        String sqlUsers = """
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                birth_date DATE NOT NULL,
                role VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
            """;

        String sqlDrivers = """
            CREATE TABLE IF NOT EXISTS drivers_info (
                user_id UUID PRIMARY KEY,
                cpf CHAR(11) UNIQUE NOT NULL,
                cnh_number CHAR(11) UNIQUE NOT NULL,
                cnh_category VARCHAR(3) NOT NULL,
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """;

        try (Statement stmt = conn.createStatement()) {
            System.out.println("[DBSetup] Verificando e criando tabelas...");
            stmt.execute(sqlUsers);
            stmt.execute(sqlDrivers);
            System.out.println("[DBSetup] Estrutura de banco de dados pronta.");
        }
    }
}

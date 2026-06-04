package br.com.driveflex.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    // Ajustado para o nome do container que apareceu no seu docker ps
    private static final String URL = "jdbc:postgresql://driveflex-db-master:5432/driveflex";
    private static final String USER = "admin";
    private static final String PASSWORD = "senha_super_segura";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver do PostgreSQL não encontrado.", e);
        }
    }
}

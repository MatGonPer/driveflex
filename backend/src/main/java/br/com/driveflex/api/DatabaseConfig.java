package br.com.driveflex.api;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static final String URL = "jdbc:postgresql://postgres-master:5432/driveflex";
    private static final String USER = "admin";
    private static final String PASSWORD = "senha_super_segura";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver do PostgreSQL nao encontrado no Classpath.", e);
        }
    }
}

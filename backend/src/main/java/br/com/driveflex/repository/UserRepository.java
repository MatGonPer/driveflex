package br.com.driveflex.repository;

import br.com.driveflex.config.DatabaseConfig;
import br.com.driveflex.model.User;

import java.sql.*;
import java.util.Optional;
import java.util.UUID;

/**
 * Classe de Repositório para a entidade User.
 * Centraliza toda a lógica de persistência (SQL) utilizando JDBC puro.
 */
public class UserRepository {

    /**
     * Insere um novo usuário no banco de dados.
     * @param user Objeto contendo os dados do usuário (com a senha já hasheada).
     */
    public void save(User user) {
        String sql = """
            INSERT INTO users (id, first_name, last_name, email, password_hash, birth_date, role)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """;

        /*
         * Fundamento: PreparedStatement.
         * O uso de '?' impede ataques de SQL Injection, pois o driver do JDBC
         * trata os valores separadamente do comando SQL.
         */
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, user.getId()); // PostgreSQL aceita UUID via setObject
            stmt.setString(2, user.getFirstName());
            stmt.setString(3, user.getLastName());
            stmt.setString(4, user.getEmail());
            stmt.setString(5, user.getPasswordHash());
            stmt.setDate(6, Date.valueOf(user.getBirthDate()));
            stmt.setString(7, user.getRole());

            stmt.executeUpdate();
            System.out.println("[UserRepository] Usuário salvo com sucesso: " + user.getEmail());

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar usuário no banco", e);
        }
    }

    /**
     * Busca um usuário pelo e-mail. Essencial para o fluxo de Login.
     * @return Optional para evitar o temido NullPointerException.
     */
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    // Mapeamento manual: Linha do Banco -> Objeto Java
                    User user = new User();
                    user.setId((UUID) rs.getObject("id"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setPasswordHash(rs.getString("password_hash"));
                    user.setBirthDate(rs.getDate("birth_date").toLocalDate());
                    user.setRole(rs.getString("role"));
                    user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar usuário por e-mail", e);
        }
        return Optional.empty();
    }
}

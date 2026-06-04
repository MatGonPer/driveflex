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

    /**
     * Busca um usuário pelo ID. Essencial para validação em handlers.
     * @param id O ID do usuário.
     * @return Optional contendo o usuário, se encontrado.
     */
    public Optional<User> findById(UUID id) {
        String sql = "SELECT * FROM users WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id); // PostgreSQL aceita UUID via setObject

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
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
            throw new RuntimeException("Erro ao buscar usuário por ID", e);
        }
        return Optional.empty();
    }

    /**
     * Busca todos os usuários no banco de dados.
     * @return Uma lista de todos os usuários.
     */
    public java.util.List<User> findAll() {
        java.util.List<User> users = new java.util.ArrayList<>();
        String sql = "SELECT * FROM users;";

        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                User user = new User();
                user.setId((UUID) rs.getObject("id"));
                user.setFirstName(rs.getString("first_name"));
                user.setLastName(rs.getString("last_name"));
                user.setEmail(rs.getString("email"));
                user.setPasswordHash(rs.getString("password_hash")); // Não ideal em produção, mas ok para dev
                user.setBirthDate(rs.getDate("birth_date").toLocalDate());
                user.setRole(rs.getString("role"));
                user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                users.add(user);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os usuários", e);
        }
        return users;
    }

    /**
     * Deleta um usuário do banco de dados pelo ID.
     * @param id O ID do usuário a ser deletado.
     * @return true se o usuário foi deletado com sucesso, false caso contrário.
     */
    public boolean deleteById(UUID id) {
        String sql = "DELETE FROM users WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("[UserRepository] Usuário deletado com sucesso: " + id);
                return true;
            } else {
                System.out.println("[UserRepository] Nenhum usuário encontrado com o ID: " + id);
                return false;
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar usuário por ID", e);
        }
    }

    /**
     * Insere as informações de motorista na tabela drivers_info.
     * @param userId O ID do usuário associado (chave estrangeira para users).
     * @param cpf O CPF do motorista (11 caracteres numéricos).
     * @param cnhNumber O número da CNH do motorista (11 caracteres numéricos).
     * @param cnhCategory A categoria da CNH (ex: B, AB, etc).
     */
    public void saveDriverInfo(UUID userId, String cpf, String cnhNumber, String cnhCategory) {
        String sql = """
            INSERT INTO drivers_info (user_id, cpf, cnh_number, cnh_category)
            VALUES (?, ?, ?, ?);
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, userId);
            stmt.setString(2, cpf);
            stmt.setString(3, cnhNumber);
            stmt.setString(4, cnhCategory);

            stmt.executeUpdate();
            System.out.println("[UserRepository] Informações de motorista salvas com sucesso para o usuário: " + userId);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar informações do motorista no banco: " + e.getMessage(), e);
        }
    }

    /**
     * Atualiza o papel (role) de um usuário no banco de dados.
     * @param userId O ID do usuário.
     * @param role O novo papel ('USER' ou 'DRIVER').
     */
    public void updateRole(UUID userId, String role) {
        String sql = "UPDATE users SET role = ? WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, role);
            stmt.setObject(2, userId);

            stmt.executeUpdate();
            System.out.println("[UserRepository] Role atualizada para " + role + " do usuário: " + userId);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar role do usuário no banco: " + e.getMessage(), e);
        }
    }

    /**
     * Atualiza as informações básicas de perfil de um usuário no banco de dados.
     * @param userId O ID do usuário.
     * @param firstName O novo nome.
     * @param lastName O novo sobrenome.
     */
    public void updateProfile(UUID userId, String firstName, String lastName) {
        String sql = "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, firstName);
            stmt.setString(2, lastName);
            stmt.setObject(3, userId);

            stmt.executeUpdate();
            System.out.println("[UserRepository] Perfil atualizado com sucesso para o usuário: " + userId);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar perfil do usuário no banco: " + e.getMessage(), e);
        }
    }
}

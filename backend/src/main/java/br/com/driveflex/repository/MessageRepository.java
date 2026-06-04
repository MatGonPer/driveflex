package br.com.driveflex.repository;

import br.com.driveflex.config.DatabaseConfig;
import br.com.driveflex.model.Message;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class MessageRepository {

    public Message save(Message message) {
        String sql = "INSERT INTO contract_messages (contract_id, sender_id, message) VALUES (?, ?, ?) RETURNING id, created_at;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, message.getContractId());
            stmt.setObject(2, message.getSenderId());
            stmt.setString(3, message.getMessage());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    message.setId((UUID) rs.getObject("id"));
                    message.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                }
            }
            return message;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar mensagem", e);
        }
    }

    public List<Message> findByContractId(UUID contractId) {
        String sql = "SELECT * FROM contract_messages WHERE contract_id = ? ORDER BY created_at ASC;";
        List<Message> messages = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, contractId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Message msg = new Message();
                    msg.setId((UUID) rs.getObject("id"));
                    msg.setContractId((UUID) rs.getObject("contract_id"));
                    msg.setSenderId((UUID) rs.getObject("sender_id"));
                    msg.setMessage(rs.getString("message"));
                    msg.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    messages.add(msg);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar mensagens do contrato", e);
        }
        return messages;
    }
}

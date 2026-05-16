package br.com.driveflex.repository;

import br.com.driveflex.config.DatabaseConfig;
import br.com.driveflex.model.Contract;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Classe de Repositório para a entidade Contract.
 * Centraliza a lógica de persistência (SQL) utilizando JDBC puro.
 */
public class ContractRepository {

    /**
     * Insere um novo contrato no banco de dados.
     * @param contract Objeto contendo os dados do contrato.
     */
    public void save(Contract contract) {
        String sql = """
            INSERT INTO contracts (id, client_id, driver_id, status, start_time, end_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, contract.getId());
            stmt.setObject(2, contract.getClientId());
            stmt.setObject(3, contract.getDriverId());
            stmt.setString(4, contract.getStatus());
            stmt.setTimestamp(5, Timestamp.valueOf(contract.getStartTime()));
            
            // end_time pode ser nulo
            if (contract.getEndTime() != null) {
                stmt.setTimestamp(6, Timestamp.valueOf(contract.getEndTime()));
            } else {
                stmt.setNull(6, Types.TIMESTAMP);
            }
            
            stmt.setTimestamp(7, Timestamp.valueOf(contract.getCreatedAt()));
            stmt.setTimestamp(8, Timestamp.valueOf(contract.getUpdatedAt()));

            stmt.executeUpdate();
            System.out.println("[ContractRepository] Contrato salvo com sucesso: " + contract.getId());

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar contrato no banco", e);
        }
    }

    /**
     * Busca um contrato pelo ID.
     * @param id O ID do contrato.
     * @return Optional contendo o contrato, se encontrado.
     */
    public Optional<Contract> findById(UUID id) {
        String sql = "SELECT * FROM contracts WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Contract contract = new Contract();
                    contract.setId((UUID) rs.getObject("id"));
                    contract.setClientId((UUID) rs.getObject("client_id"));
                    contract.setDriverId((UUID) rs.getObject("driver_id"));
                    contract.setStatus(rs.getString("status"));
                    contract.setStartTime(rs.getTimestamp("start_time").toLocalDateTime());
                    
                    Timestamp endTimeStamp = rs.getTimestamp("end_time");
                    contract.setEndTime(endTimeStamp != null ? endTimeStamp.toLocalDateTime() : null);
                    
                    contract.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    contract.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

                    return Optional.of(contract);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contrato por ID", e);
        }
        return Optional.empty();
    }
}

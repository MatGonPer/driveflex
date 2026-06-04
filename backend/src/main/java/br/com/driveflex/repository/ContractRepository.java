package br.com.driveflex.repository;

import br.com.driveflex.config.DatabaseConfig;
import br.com.driveflex.model.Contract;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
            INSERT INTO contracts (id, client_id, driver_id, status, start_time, end_time, created_at, updated_at, pickup_location, dropoff_location, estimated_fare)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
            
            stmt.setString(9, contract.getPickupLocation());
            stmt.setString(10, contract.getDropoffLocation());
            if (contract.getEstimatedFare() != null) {
                stmt.setDouble(11, contract.getEstimatedFare());
            } else {
                stmt.setNull(11, Types.DOUBLE);
            }

            stmt.executeUpdate();
            System.out.println("[ContractRepository] Contrato salvo com sucesso: " + contract.getId());

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar contrato no banco", e);
        }
    }

    private Contract mapResultSetToContract(ResultSet rs) throws SQLException {
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
        
        contract.setPickupLocation(rs.getString("pickup_location"));
        contract.setDropoffLocation(rs.getString("dropoff_location"));
        double fare = rs.getDouble("estimated_fare");
        contract.setEstimatedFare(rs.wasNull() ? null : fare);
        
        try {
            contract.setClientName(rs.getString("client_name"));
            contract.setClientEmail(rs.getString("client_email"));
        } catch (SQLException ignored) {}
        
        try {
            contract.setDriverName(rs.getString("driver_name"));
            contract.setDriverEmail(rs.getString("driver_email"));
        } catch (SQLException ignored) {}
        
        return contract;
    }

    /**
     * Busca um contrato pelo ID.
     * @param id O ID do contrato.
     * @return Optional contendo o contrato, se encontrado.
     */
    public Optional<Contract> findById(UUID id) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.id = ?;
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contrato por ID", e);
        }
        return Optional.empty();
    }

    /**
     * Busca todos os contratos pendentes para um motorista específico.
     * @param driverId O ID do motorista.
     * @return Lista de contratos com status 'PENDING'.
     */
    public List<Contract> findPendingByDriverId(UUID driverId) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.driver_id = ? AND c.status = 'PENDING';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, driverId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contracts.add(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos pendentes do motorista", e);
        }
        return contracts;
    }

    /**
     * Atualiza o status de um contrato.
     * @param contractId O ID do contrato.
     * @param newStatus O novo status.
     * @return true se a atualização foi bem-sucedida, false caso contrário.
     */
    public boolean updateStatus(UUID contractId, String newStatus) {
        String sql = "UPDATE contracts SET status = ?, updated_at = ? WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newStatus);
            stmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setObject(3, contractId);

            int affectedRows = stmt.executeUpdate();
            System.out.println("[ContractRepository] Status do contrato " + contractId + " atualizado para " + newStatus);
            return affectedRows > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar status do contrato", e);
        }
    }

    /**
     * Busca todos os contratos pendentes globais no sistema.
     * @return Lista de todos os contratos com status 'PENDING'.
     */
    public List<Contract> findAllPending() {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.status = 'PENDING';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                contracts.add(mapResultSetToContract(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os contratos pendentes globais", e);
        }
        return contracts;
    }

    /**
     * Atualiza o motorista e o status de um contrato ao ser aceito.
     * @param contractId O ID do contrato.
     * @param driverId O ID do motorista que aceitou.
     * @return true se a atualização foi bem-sucedida, false caso contrário.
     */
    public boolean acceptContractByDriver(UUID contractId, UUID driverId) {
        String sql = "UPDATE contracts SET driver_id = ?, status = 'ACCEPTED', updated_at = ? WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, driverId);
            stmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setObject(3, contractId);

            int affectedRows = stmt.executeUpdate();
            System.out.println("[ContractRepository] Contrato " + contractId + " aceito pelo motorista " + driverId);
            return affectedRows > 0;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao aceitar contrato pelo motorista", e);
        }
    }

    /**
     * Busca todos os contratos pendentes criados por um cliente específico.
     * @param clientId O ID do cliente.
     * @return Lista de contratos com status 'PENDING'.
     */
    public List<Contract> findPendingByClientId(UUID clientId) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.client_id = ? AND c.status = 'PENDING';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, clientId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contracts.add(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos pendentes do cliente", e);
        }
        return contracts;
    }

    /**
     * Busca todos os contratos ativos (aceitos) criados por um cliente específico.
     * @param clientId O ID do cliente.
     * @return Lista de contratos com status 'ACCEPTED'.
     */
    public List<Contract> findActiveByClientId(UUID clientId) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.client_id = ? AND c.status = 'ACCEPTED';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, clientId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contracts.add(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos ativos do cliente", e);
        }
        return contracts;
    }

    /**
     * Busca todos os contratos ativos (aceitos) para um motorista específico.
     * @param driverId O ID do motorista.
     * @return Lista de contratos com status 'ACCEPTED'.
     */
    public List<Contract> findActiveByDriverId(UUID driverId) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.driver_id = ? AND c.status = 'ACCEPTED';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, driverId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contracts.add(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos ativos do motorista", e);
        }
        return contracts;
    }

    /**
     * Atualiza as informações de um contrato.
     * @param contractId O ID do contrato.
     * @param pickupLocation O novo endereço de partida.
     * @param dropoffLocation O novo endereço de destino.
     * @param startTime O novo horário de partida.
     * @param estimatedFare O novo valor estimado.
     */
    public void updateContractDetails(UUID contractId, String pickupLocation, String dropoffLocation, LocalDateTime startTime, LocalDateTime endTime, Double estimatedFare) {
        String sql = """
            UPDATE contracts
            SET pickup_location = ?, dropoff_location = ?, start_time = ?, end_time = ?, estimated_fare = ?, updated_at = ?
            WHERE id = ?;
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, pickupLocation);
            stmt.setString(2, dropoffLocation);
            stmt.setTimestamp(3, Timestamp.valueOf(startTime));
            
            if (endTime != null) {
                stmt.setTimestamp(4, Timestamp.valueOf(endTime));
            } else {
                stmt.setNull(4, Types.TIMESTAMP);
            }
            
            if (estimatedFare != null) {
                stmt.setDouble(5, estimatedFare);
            } else {
                stmt.setNull(5, Types.DOUBLE);
            }
            
            stmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setObject(7, contractId);

            stmt.executeUpdate();
            System.out.println("[ContractRepository] Contrato atualizado com sucesso: " + contractId);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar contrato no banco", e);
        }
    }

    /**
     * Busca todos os contratos associados a um usuário (como cliente ou motorista).
     * @param userId O ID do usuário.
     * @return Lista de contratos.
     */
    public List<Contract> findAllByUserId(UUID userId) {
        String sql = """
            SELECT c.*, 
                   u1.first_name || ' ' || u1.last_name AS client_name, 
                   u1.email AS client_email,
                   u2.first_name || ' ' || u2.last_name AS driver_name, 
                   u2.email AS driver_email
            FROM contracts c
            JOIN users u1 ON c.client_id = u1.id
            LEFT JOIN users u2 ON c.driver_id = u2.id
            WHERE c.client_id = ? OR c.driver_id = ?
            ORDER BY c.updated_at DESC;
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, userId);
            stmt.setObject(2, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contracts.add(mapResultSetToContract(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar histórico de contratos do usuário", e);
        }
        return contracts;
    }

    /**
     * Deleta um contrato do banco de dados pelo ID.
     * @param id O ID do contrato a ser deletado.
     * @return true se o contrato foi deletado com sucesso, false caso contrário.
     */
    public boolean deleteById(UUID id) {
        String sql = "DELETE FROM contracts WHERE id = ?;";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("[ContractRepository] Contrato deletado com sucesso: " + id);
                return true;
            } else {
                System.out.println("[ContractRepository] Nenhum contrato encontrado com o ID: " + id);
                return false;
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar contrato por ID", e);
        }
    }
}

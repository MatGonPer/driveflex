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
            INSERT INTO contracts (id, client_id, driver_id, vehicle_category, origin, destination, passenger_name, status, start_time, end_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, contract.getId());
            stmt.setObject(2, contract.getClientId());
            
            if (contract.getDriverId() != null) {
                stmt.setObject(3, contract.getDriverId());
            } else {
                stmt.setNull(3, Types.OTHER);
            }
            
            stmt.setString(4, contract.getVehicleCategory());
            stmt.setString(5, contract.getOrigin());
            stmt.setString(6, contract.getDestination());
            stmt.setString(7, contract.getPassengerName());
            stmt.setString(8, contract.getStatus());
            stmt.setTimestamp(9, Timestamp.valueOf(contract.getStartTime()));
            
            // end_time pode ser nulo
            if (contract.getEndTime() != null) {
                stmt.setTimestamp(10, Timestamp.valueOf(contract.getEndTime()));
            } else {
                stmt.setNull(10, Types.TIMESTAMP);
            }
            
            stmt.setTimestamp(11, Timestamp.valueOf(contract.getCreatedAt()));
            stmt.setTimestamp(12, Timestamp.valueOf(contract.getUpdatedAt()));

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
                    contract.setVehicleCategory(rs.getString("vehicle_category"));
                    contract.setOrigin(rs.getString("origin"));
                    contract.setDestination(rs.getString("destination"));
                    contract.setPassengerName(rs.getString("passenger_name"));
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

    /**
     * Busca todos os contratos pendentes para um motorista específico.
     * @param driverId O ID do motorista.
     * @return Lista de contratos com status 'PENDING'.
     */
    public List<Contract> findPendingByDriverId(UUID driverId) {
        String sql = """
            SELECT c.*, 
                   CONCAT(u_client.first_name, ' ', u_client.last_name) AS client_name,
                   CONCAT(u_driver.first_name, ' ', u_driver.last_name) AS driver_name
            FROM contracts c
            LEFT JOIN users u_client ON c.client_id = u_client.id
            LEFT JOIN users u_driver ON c.driver_id = u_driver.id
            WHERE c.driver_id = ? AND c.status = 'PENDING';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, driverId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Contract contract = new Contract();
                    contract.setId((UUID) rs.getObject("id"));
                    contract.setClientId((UUID) rs.getObject("client_id"));
                    contract.setDriverId((UUID) rs.getObject("driver_id"));
                    contract.setVehicleCategory(rs.getString("vehicle_category"));
                    contract.setOrigin(rs.getString("origin"));
                    contract.setDestination(rs.getString("destination"));
                    contract.setPassengerName(rs.getString("passenger_name"));
                    contract.setStatus(rs.getString("status"));
                    contract.setStartTime(rs.getTimestamp("start_time").toLocalDateTime());
                    
                    Timestamp endTimeStamp = rs.getTimestamp("end_time");
                    contract.setEndTime(endTimeStamp != null ? endTimeStamp.toLocalDateTime() : null);
                    
                    contract.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    contract.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
                    
                    contract.setClientName(rs.getString("client_name"));
                    contract.setDriverName(rs.getString("driver_name"));

                    contracts.add(contract);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos pendentes do motorista", e);
        }
        return contracts;
    }

    /**
     * Busca todos os contratos pendentes para um cliente específico.
     * @param clientId O ID do cliente.
     * @return Lista de contratos com status 'PENDING'.
     */
    public List<Contract> findPendingByClientId(UUID clientId) {
        String sql = """
            SELECT c.*, 
                   CONCAT(u_client.first_name, ' ', u_client.last_name) AS client_name,
                   CONCAT(u_driver.first_name, ' ', u_driver.last_name) AS driver_name
            FROM contracts c
            LEFT JOIN users u_client ON c.client_id = u_client.id
            LEFT JOIN users u_driver ON c.driver_id = u_driver.id
            WHERE c.client_id = ? AND c.status = 'PENDING';
            """;
        List<Contract> contracts = new ArrayList<>();

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, clientId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Contract contract = new Contract();
                    contract.setId((UUID) rs.getObject("id"));
                    contract.setClientId((UUID) rs.getObject("client_id"));
                    contract.setDriverId((UUID) rs.getObject("driver_id"));
                    contract.setVehicleCategory(rs.getString("vehicle_category"));
                    contract.setOrigin(rs.getString("origin"));
                    contract.setDestination(rs.getString("destination"));
                    contract.setPassengerName(rs.getString("passenger_name"));
                    contract.setStatus(rs.getString("status"));
                    contract.setStartTime(rs.getTimestamp("start_time").toLocalDateTime());
                    
                    Timestamp endTimeStamp = rs.getTimestamp("end_time");
                    contract.setEndTime(endTimeStamp != null ? endTimeStamp.toLocalDateTime() : null);
                    
                    contract.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    contract.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
                    
                    contract.setClientName(rs.getString("client_name"));
                    contract.setDriverName(rs.getString("driver_name"));

                    contracts.add(contract);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contratos pendentes do cliente", e);
        }
        return contracts;
    }

    /**
     * Atualiza um contrato existente (origin, destination, passengerName, vehicleCategory, updatedAt).
     */
    public void update(Contract contract) {
        String sql = """
            UPDATE contracts
            SET origin = ?, destination = ?, passenger_name = ?, vehicle_category = ?, updated_at = ?, start_time = ?, end_time = ?
            WHERE id = ? AND client_id = ?;
            """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, contract.getOrigin());
            stmt.setString(2, contract.getDestination());
            stmt.setString(3, contract.getPassengerName());
            stmt.setString(4, contract.getVehicleCategory());
            stmt.setTimestamp(5, Timestamp.valueOf(contract.getUpdatedAt()));
            stmt.setTimestamp(6, Timestamp.valueOf(contract.getStartTime()));
            
            if (contract.getEndTime() != null) {
                stmt.setTimestamp(7, Timestamp.valueOf(contract.getEndTime()));
            } else {
                stmt.setNull(7, Types.TIMESTAMP);
            }
            
            stmt.setObject(8, contract.getId());
            stmt.setObject(9, contract.getClientId());

            stmt.executeUpdate();
            System.out.println("[ContractRepository] Contrato atualizado: " + contract.getId());

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar contrato", e);
        }
    }

    /**
     * Deleta um contrato pelo ID.
     */
    public boolean delete(UUID id, UUID clientId) {
        String sql = "DELETE FROM contracts WHERE id = ? AND client_id = ? AND status = 'PENDING';";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, id);
            stmt.setObject(2, clientId);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("[ContractRepository] Contrato deletado: " + id);
                return true;
            }
            return false;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar contrato", e);
        }
    }
}

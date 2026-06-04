package br.com.driveflex.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Classe de Modelo que representa a entidade Contrato no sistema.
 * Estabelece a relação entre um cliente e um motorista para uma contratação.
 */
public class Contract {

    private UUID id;
    private UUID clientId;
    private UUID driverId;
    private String status; // Ex: PENDING, ACCEPTED, REJECTED, COMPLETED
    private LocalDateTime startTime;
    private LocalDateTime endTime; // Pode ser nulo se o contrato não tiver um fim definido ainda
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Novos atributos para rotas, tarifas e detalhes
    private String pickupLocation;
    private String dropoffLocation;
    private Double estimatedFare;
    private String clientName;
    private String clientEmail;
    private String driverName;
    private String driverEmail;

    public Contract() {}

    public Contract(UUID id, UUID clientId, UUID driverId, String status, 
                    LocalDateTime startTime, LocalDateTime endTime, 
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.driverId = driverId;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public UUID getDriverId() { return driverId; }
    public void setDriverId(UUID driverId) { this.driverId = driverId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }

    public Double getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(Double estimatedFare) { this.estimatedFare = estimatedFare; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverEmail() { return driverEmail; }
    public void setDriverEmail(String driverEmail) { this.driverEmail = driverEmail; }

    @Override
    public String toString() {
        return "Contract{" +
                "id=" + id +
                ", clientId=" + clientId +
                ", driverId=" + driverId +
                ", status='" + status + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", pickupLocation='" + pickupLocation + '\'' +
                ", dropoffLocation='" + dropoffLocation + '\'' +
                ", estimatedFare=" + estimatedFare +
                ", clientName='" + clientName + '\'' +
                ", clientEmail='" + clientEmail + '\'' +
                ", driverName='" + driverName + '\'' +
                ", driverEmail='" + driverEmail + '\'' +
                '}';
    }
}
package br.com.driveflex.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Message {
    private UUID id;
    private UUID contractId;
    private UUID senderId;
    private String message;
    private LocalDateTime createdAt;

    public Message() {}

    public Message(UUID contractId, UUID senderId, String message) {
        this.contractId = contractId;
        this.senderId = senderId;
        this.message = message;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

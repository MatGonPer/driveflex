package br.com.driveflex.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Classe de Modelo que representa a entidade Usuário no sistema.
 * Segue o padrão JavaBean: campos privados, construtor padrão e métodos acessores.
 */
public class User {

    // Identificador único universal. Evita a previsibilidade de IDs sequenciais (1, 2, 3...)
    private UUID id;
    
    private String firstName;
    private String lastName;
    
    // O e-mail será nosso identificador de login (Unique no banco)
    private String email;
    
    // IMPORTANTE: Nunca armazenamos a senha pura, apenas o resultado do Hashing (BCrypt)
    private String passwordHash;
    
    // API de data moderna do Java (java.time) - mais segura e intuitiva
    private LocalDate birthDate;
    
    // Define se o usuário é 'USER' ou 'DRIVER'
    private String role;
    
    // Data e hora de criação automática para auditoria
    private LocalDateTime createdAt;

    /**
     * Construtor Padrão (Sem argumentos).
     * Essencial para muitas bibliotecas de mapeamento de dados.
     */
    public User() {}

    /**
     * Construtor Completo.
     * Facilita a criação do objeto ao recuperar dados do banco (JDBC).
     */
    public User(UUID id, String firstName, String lastName, String email, 
                String passwordHash, LocalDate birthDate, String role, LocalDateTime createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.birthDate = birthDate;
        this.role = role;
        this.createdAt = createdAt;
    }

    /* * GETTERS E SETTERS (Encapsulamento)
     * Protegemos os dados internos permitindo acesso apenas via métodos controlados.
     */

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Método útil para debug no terminal. 
     * Retorna uma representação em texto do objeto (sem a senha por segurança).
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + firstName + " " + lastName + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}

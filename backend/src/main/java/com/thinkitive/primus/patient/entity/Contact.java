package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "contacts")
public class Contact extends TenantAwareEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private ContactType type;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "organization", length = 255)
    private String organization;

    @Column(name = "npi", length = 20)
    private String npi;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "fax", length = 20)
    private String fax;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "zip", length = 10)
    private String zip;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum ContactType {
        SPECIALIST, FACILITY, LAB, OTHER
    }
}

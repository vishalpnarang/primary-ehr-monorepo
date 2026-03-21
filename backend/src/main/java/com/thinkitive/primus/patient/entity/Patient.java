package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "patients",
    uniqueConstraints = @UniqueConstraint(name = "uq_patient_tenant_mrn", columnNames = {"tenant_id", "mrn"})
)
public class Patient extends TenantAwareEntity {

    @Column(name = "mrn", nullable = false, length = 20)
    private String mrn;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "preferred_name", length = 100)
    private String preferredName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "sex", length = 10)
    private String sex;

    @Column(name = "gender", length = 50)
    private String gender;

    @Column(name = "pronouns", length = 50)
    private String pronouns;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 2)
    private String state;

    @Column(name = "zip", length = 10)
    private String zip;

    @Column(name = "emergency_contact_name", length = 200)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation", length = 100)
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "primary_provider_id")
    private Long primaryProviderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PatientStatus status;

    @Column(name = "photo", length = 500)
    private String photo;

    public enum PatientStatus {
        ACTIVE, INACTIVE, DECEASED
    }
}

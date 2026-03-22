package com.thinkitive.primus.billing.entity;

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
@Table(name = "saved_payment_methods")
public class SavedPaymentMethod extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "method_type", nullable = false, length = 20)
    private MethodType methodType;

    @Column(name = "last_four", length = 4)
    private String lastFour;

    @Column(name = "brand", length = 20)
    private String brand;

    @Column(name = "exp_month")
    private Integer expMonth;

    @Column(name = "exp_year")
    private Integer expYear;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;

    @Column(name = "stripe_payment_method_id", length = 255)
    private String stripePaymentMethodId;

    public enum MethodType {
        CARD, BANK_ACCOUNT
    }
}

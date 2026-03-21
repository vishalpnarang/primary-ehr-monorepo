package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BillingService {

    Page<ClaimDto> listClaims(String status, Pageable pageable);

    ClaimDto getClaim(UUID uuid);

    ClaimDto submitClaim(UUID uuid);

    ClaimDto denyClaim(UUID uuid, ClaimDenyRequest request);

    ClaimDto appealClaim(UUID uuid, ClaimAppealRequest request);

    BillingKpiDto getBillingKpi();

    PaymentDto recordPayment(PaymentRequest request);

    PatientBalanceDto getPatientBalance(UUID patientUuid);

    ArAgingDto getArAging();
}

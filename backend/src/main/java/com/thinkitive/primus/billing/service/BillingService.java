package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface BillingService {

    Page<ClaimDto> listClaims(String status, Pageable pageable);

    ClaimDto getClaim(String uuid);

    ClaimDto submitClaim(String uuid);

    ClaimDto denyClaim(String uuid, ClaimDenyRequest request);

    ClaimDto appealClaim(String uuid, ClaimAppealRequest request);

    BillingKpiDto getBillingKpi();

    PaymentDto recordPayment(PaymentRequest request);

    PatientBalanceDto getPatientBalance(String patientUuid);

    ArAgingDto getArAging();
}

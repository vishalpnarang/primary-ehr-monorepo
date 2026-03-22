package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;

import java.util.List;

public interface PaymentService {

    PaymentTransactionDto recordPayment(RecordPaymentRequest request);

    List<PaymentTransactionDto> getPaymentHistory(Long patientId);

    SavedPaymentMethodDto savePaymentMethod(SavePaymentMethodRequest request);

    List<SavedPaymentMethodDto> getPatientMethods(Long patientId);

    ScheduledPaymentDto schedulePayment(SchedulePaymentRequest request);

    CreditDto applyCredit(ApplyCreditRequest request);

    List<CreditDto> getPatientCredits(Long patientId);
}

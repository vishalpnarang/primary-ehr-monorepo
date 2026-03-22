package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.PaymentTransactionDto;
import com.thinkitive.primus.billing.dto.RecordPaymentRequest;
import com.thinkitive.primus.billing.dto.SavePaymentMethodRequest;
import com.thinkitive.primus.billing.dto.SavedPaymentMethodDto;
import com.thinkitive.primus.billing.entity.Invoice;
import com.thinkitive.primus.billing.entity.PaymentTransaction;
import com.thinkitive.primus.billing.entity.SavedPaymentMethod;
import com.thinkitive.primus.billing.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock PaymentTransactionRepository paymentTransactionRepository;
    @Mock SavedPaymentMethodRepository savedPaymentMethodRepository;
    @Mock ScheduledPaymentRepository scheduledPaymentRepository;
    @Mock CreditRepository creditRepository;
    @Mock InvoiceRepository invoiceRepository;

    @InjectMocks
    PaymentServiceImpl paymentService;

    private Invoice testInvoice;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testInvoice = Invoice.builder()
                .tenantId(1L)
                .patientId(100L)
                .invoiceNumber("INV-202603-XYZ123")
                .subtotal(new BigDecimal("200.00"))
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(new BigDecimal("200.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("200.00"))
                .status(Invoice.InvoiceStatus.SENT)
                .build();
        testInvoice.setId(1L);
        testInvoice.setUuid(UUID.randomUUID().toString());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("recordPayment creates transaction and updates invoice balance when linked")
    void recordPayment_updatesInvoiceBalance() {
        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setPatientId(100L);
        request.setInvoiceId(1L);
        request.setAmount(new BigDecimal("200.00"));
        request.setMethod("CARD");
        request.setReferenceNumber("TXN-001");

        PaymentTransaction savedTx = PaymentTransaction.builder()
                .tenantId(1L)
                .invoiceId(1L)
                .patientId(100L)
                .amount(new BigDecimal("200.00"))
                .method(PaymentTransaction.PaymentMethod.CARD)
                .referenceNumber("TXN-001")
                .status(PaymentTransaction.PaymentStatus.COMPLETED)
                .build();
        savedTx.setId(1L);
        savedTx.setUuid(UUID.randomUUID().toString());

        when(paymentTransactionRepository.save(any(PaymentTransaction.class))).thenReturn(savedTx);
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentTransactionDto result = paymentService.recordPayment(request);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("200.00"));
        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        assertThat(result.getMethod()).isEqualTo("CARD");
        // Invoice should be updated to PAID status
        verify(invoiceRepository).save(argThat(inv ->
                inv.getStatus() == Invoice.InvoiceStatus.PAID));
    }

    @Test
    @DisplayName("recordPayment without invoice ID does not attempt invoice update")
    void recordPayment_noInvoiceId_skipsInvoiceUpdate() {
        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setPatientId(100L);
        request.setAmount(new BigDecimal("50.00"));
        request.setMethod("CASH");

        PaymentTransaction savedTx = PaymentTransaction.builder()
                .tenantId(1L)
                .patientId(100L)
                .amount(new BigDecimal("50.00"))
                .method(PaymentTransaction.PaymentMethod.CASH)
                .status(PaymentTransaction.PaymentStatus.COMPLETED)
                .build();
        savedTx.setId(2L);
        savedTx.setUuid(UUID.randomUUID().toString());

        when(paymentTransactionRepository.save(any(PaymentTransaction.class))).thenReturn(savedTx);

        PaymentTransactionDto result = paymentService.recordPayment(request);

        assertThat(result).isNotNull();
        assertThat(result.getMethod()).isEqualTo("CASH");
        verify(invoiceRepository, never()).findById(any());
    }

    @Test
    @DisplayName("savePaymentMethod clears existing default before saving new default")
    void savePaymentMethod_clearsExistingDefault() {
        SavePaymentMethodRequest request = new SavePaymentMethodRequest();
        request.setPatientId(100L);
        request.setMethodType("CARD");
        request.setLastFour("4242");
        request.setBrand("VISA");
        request.setExpMonth(12);
        request.setExpYear(2028);
        request.setDefault(true);

        SavedPaymentMethod existingDefault = SavedPaymentMethod.builder()
                .tenantId(1L)
                .patientId(100L)
                .methodType(SavedPaymentMethod.MethodType.CARD)
                .lastFour("1234")
                .brand("MASTERCARD")
                .isDefault(true)
                .build();
        existingDefault.setId(5L);
        existingDefault.setUuid(UUID.randomUUID().toString());

        SavedPaymentMethod savedMethod = SavedPaymentMethod.builder()
                .tenantId(1L)
                .patientId(100L)
                .methodType(SavedPaymentMethod.MethodType.CARD)
                .lastFour("4242")
                .brand("VISA")
                .isDefault(true)
                .build();
        savedMethod.setId(6L);
        savedMethod.setUuid(UUID.randomUUID().toString());

        when(savedPaymentMethodRepository.findByPatientIdAndTenantIdAndIsDefaultTrue(100L, 1L))
                .thenReturn(Optional.of(existingDefault));
        when(savedPaymentMethodRepository.save(any(SavedPaymentMethod.class)))
                .thenAnswer(inv -> {
                    SavedPaymentMethod m = inv.getArgument(0);
                    // Return saved method for the final save call
                    if (m.getLastFour() != null && m.getLastFour().equals("4242")) {
                        return savedMethod;
                    }
                    return m;
                });

        SavedPaymentMethodDto result = paymentService.savePaymentMethod(request);

        assertThat(result).isNotNull();
        assertThat(result.getLastFour()).isEqualTo("4242");
        assertThat(result.isDefault()).isTrue();
        // Verify the old default was cleared (save called twice — once to clear, once to save new)
        verify(savedPaymentMethodRepository, times(2)).save(any(SavedPaymentMethod.class));
    }
}

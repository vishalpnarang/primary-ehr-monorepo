package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.entity.*;
import com.thinkitive.primus.billing.repository.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final SavedPaymentMethodRepository savedPaymentMethodRepository;
    private final ScheduledPaymentRepository scheduledPaymentRepository;
    private final CreditRepository creditRepository;
    private final InvoiceRepository invoiceRepository;

    // ── Payments ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentTransactionDto recordPayment(RecordPaymentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Recording payment tenant={} patient={} amount={}", tenantId,
                request.getPatientId(), request.getAmount());

        PaymentTransaction.PaymentMethod method = parsePaymentMethod(request.getMethod());

        PaymentTransaction tx = PaymentTransaction.builder()
                .tenantId(tenantId)
                .invoiceId(request.getInvoiceId())
                .patientId(request.getPatientId())
                .amount(request.getAmount())
                .method(method)
                .referenceNumber(request.getReferenceNumber())
                .stripePaymentIntentId(request.getStripePaymentIntentId())
                .status(PaymentTransaction.PaymentStatus.COMPLETED)
                .notes(request.getNotes())
                .build();

        PaymentTransaction saved = paymentTransactionRepository.save(tx);

        // Update invoice balance if linked
        if (request.getInvoiceId() != null) {
            invoiceRepository.findById(request.getInvoiceId()).ifPresent(invoice -> {
                if (invoice.getTenantId().equals(tenantId)) {
                    invoice.setAmountPaid(invoice.getAmountPaid().add(request.getAmount()));
                    invoice.setBalanceDue(invoice.getTotal().subtract(invoice.getAmountPaid()));
                    if (invoice.getBalanceDue().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                        invoice.setStatus(Invoice.InvoiceStatus.PAID);
                    } else {
                        invoice.setStatus(Invoice.InvoiceStatus.PARTIAL);
                    }
                    invoiceRepository.save(invoice);
                }
            });
        }

        log.info("Payment recorded uuid={}", saved.getUuid());
        return toPaymentTransactionDto(saved);
    }

    @Override
    public List<PaymentTransactionDto> getPaymentHistory(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return paymentTransactionRepository
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(patientId, tenantId)
                .stream()
                .map(this::toPaymentTransactionDto)
                .toList();
    }

    // ── Saved Methods ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SavedPaymentMethodDto savePaymentMethod(SavePaymentMethodRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Saving payment method tenant={} patient={}", tenantId, request.getPatientId());

        SavedPaymentMethod.MethodType type = parseMethodType(request.getMethodType());

        // Clear existing default if this is being set as default
        if (request.isDefault()) {
            savedPaymentMethodRepository
                    .findByPatientIdAndTenantIdAndIsDefaultTrue(request.getPatientId(), tenantId)
                    .ifPresent(existing -> {
                        existing.setDefault(false);
                        savedPaymentMethodRepository.save(existing);
                    });
        }

        SavedPaymentMethod method = SavedPaymentMethod.builder()
                .tenantId(tenantId)
                .patientId(request.getPatientId())
                .methodType(type)
                .lastFour(request.getLastFour())
                .brand(request.getBrand())
                .expMonth(request.getExpMonth())
                .expYear(request.getExpYear())
                .isDefault(request.isDefault())
                .stripePaymentMethodId(request.getStripePaymentMethodId())
                .build();

        SavedPaymentMethod saved = savedPaymentMethodRepository.save(method);
        log.info("Payment method saved uuid={}", saved.getUuid());
        return toSavedMethodDto(saved);
    }

    @Override
    public List<SavedPaymentMethodDto> getPatientMethods(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return savedPaymentMethodRepository
                .findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId)
                .stream()
                .map(this::toSavedMethodDto)
                .toList();
    }

    // ── Scheduled Payments ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ScheduledPaymentDto schedulePayment(SchedulePaymentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Scheduling payment tenant={} patient={} date={}", tenantId,
                request.getPatientId(), request.getScheduledDate());

        ScheduledPayment scheduled = ScheduledPayment.builder()
                .tenantId(tenantId)
                .patientId(request.getPatientId())
                .invoiceId(request.getInvoiceId())
                .paymentMethodId(request.getPaymentMethodId())
                .amount(request.getAmount())
                .scheduledDate(request.getScheduledDate())
                .status(ScheduledPayment.ScheduledPaymentStatus.SCHEDULED)
                .build();

        ScheduledPayment saved = scheduledPaymentRepository.save(scheduled);
        log.info("Payment scheduled uuid={}", saved.getUuid());
        return toScheduledPaymentDto(saved);
    }

    // ── Credits ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CreditDto applyCredit(ApplyCreditRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Applying credit tenant={} patient={} amount={}", tenantId,
                request.getPatientId(), request.getAmount());

        Credit.CreditType type = parseCreditType(request.getType());
        Credit.CreditStatus status = request.getAppliedToInvoiceId() != null
                ? Credit.CreditStatus.APPLIED : Credit.CreditStatus.AVAILABLE;

        Credit credit = Credit.builder()
                .tenantId(tenantId)
                .patientId(request.getPatientId())
                .amount(request.getAmount())
                .reason(request.getReason())
                .type(type)
                .appliedToInvoiceId(request.getAppliedToInvoiceId())
                .status(status)
                .build();

        Credit saved = creditRepository.save(credit);
        log.info("Credit applied uuid={}", saved.getUuid());
        return toCreditDto(saved);
    }

    @Override
    public List<CreditDto> getPatientCredits(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return creditRepository
                .findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId)
                .stream()
                .map(this::toCreditDto)
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private PaymentTransaction.PaymentMethod parsePaymentMethod(String value) {
        try {
            return PaymentTransaction.PaymentMethod.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid payment method: " + value);
        }
    }

    private SavedPaymentMethod.MethodType parseMethodType(String value) {
        try {
            return SavedPaymentMethod.MethodType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid method type: " + value);
        }
    }

    private Credit.CreditType parseCreditType(String value) {
        if (value == null) return null;
        try {
            return Credit.CreditType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown credit type '{}', ignoring", value);
            return null;
        }
    }

    private PaymentTransactionDto toPaymentTransactionDto(PaymentTransaction t) {
        return PaymentTransactionDto.builder()
                .uuid(t.getUuid())
                .invoiceId(t.getInvoiceId())
                .patientId(t.getPatientId())
                .amount(t.getAmount())
                .method(t.getMethod() != null ? t.getMethod().name() : null)
                .referenceNumber(t.getReferenceNumber())
                .stripePaymentIntentId(t.getStripePaymentIntentId())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private SavedPaymentMethodDto toSavedMethodDto(SavedPaymentMethod m) {
        return SavedPaymentMethodDto.builder()
                .uuid(m.getUuid())
                .patientId(m.getPatientId())
                .methodType(m.getMethodType() != null ? m.getMethodType().name() : null)
                .lastFour(m.getLastFour())
                .brand(m.getBrand())
                .expMonth(m.getExpMonth())
                .expYear(m.getExpYear())
                .isDefault(m.isDefault())
                .createdAt(m.getCreatedAt())
                .modifiedAt(m.getModifiedAt())
                .build();
    }

    private ScheduledPaymentDto toScheduledPaymentDto(ScheduledPayment s) {
        return ScheduledPaymentDto.builder()
                .uuid(s.getUuid())
                .patientId(s.getPatientId())
                .invoiceId(s.getInvoiceId())
                .paymentMethodId(s.getPaymentMethodId())
                .amount(s.getAmount())
                .scheduledDate(s.getScheduledDate())
                .status(s.getStatus() != null ? s.getStatus().name() : null)
                .createdAt(s.getCreatedAt())
                .modifiedAt(s.getModifiedAt())
                .build();
    }

    private CreditDto toCreditDto(Credit c) {
        return CreditDto.builder()
                .uuid(c.getUuid())
                .patientId(c.getPatientId())
                .amount(c.getAmount())
                .reason(c.getReason())
                .type(c.getType() != null ? c.getType().name() : null)
                .appliedToInvoiceId(c.getAppliedToInvoiceId())
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .createdAt(c.getCreatedAt())
                .modifiedAt(c.getModifiedAt())
                .build();
    }
}

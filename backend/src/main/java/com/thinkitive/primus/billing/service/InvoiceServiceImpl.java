package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.entity.Invoice;
import com.thinkitive.primus.billing.entity.InvoiceLineItem;
import com.thinkitive.primus.billing.repository.InvoiceLineItemRepository;
import com.thinkitive.primus.billing.repository.InvoiceRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;

    @Override
    @Transactional
    public InvoiceDto create(CreateInvoiceRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating invoice tenant={} patient={}", tenantId, request.getPatientId());

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .tenantId(tenantId)
                .patientId(request.getPatientId())
                .encounterId(request.getEncounterId())
                .invoiceNumber(invoiceNumber)
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(BigDecimal.ZERO)
                .status(Invoice.InvoiceStatus.DRAFT)
                .dueDate(request.getDueDate())
                .build();

        Invoice saved = invoiceRepository.save(invoice);

        if (request.getLineItems() != null) {
            for (AddLineItemRequest li : request.getLineItems()) {
                addLineItemInternal(saved, li, tenantId);
            }
            saved = recalculate(saved, tenantId);
        }

        log.info("Invoice created uuid={} number={}", saved.getUuid(), invoiceNumber);
        return toInvoiceDto(saved, tenantId);
    }

    @Override
    @Transactional
    public InvoiceDto addLineItem(String invoiceUuid, AddLineItemRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Invoice invoice = requireInvoice(tenantId, invoiceUuid);
        addLineItemInternal(invoice, request, tenantId);
        Invoice saved = recalculate(invoice, tenantId);
        log.info("Line item added to invoice uuid={}", invoiceUuid);
        return toInvoiceDto(saved, tenantId);
    }

    @Override
    @Transactional
    public InvoiceDto send(String invoiceUuid) {
        Long tenantId = TenantContext.getTenantId();
        Invoice invoice = requireInvoice(tenantId, invoiceUuid);
        invoice.setStatus(Invoice.InvoiceStatus.SENT);
        invoice.setSentDate(LocalDate.now());
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice sent uuid={}", invoiceUuid);
        return toInvoiceDto(saved, tenantId);
    }

    @Override
    @Transactional
    public InvoiceDto markPaid(String invoiceUuid) {
        Long tenantId = TenantContext.getTenantId();
        Invoice invoice = requireInvoice(tenantId, invoiceUuid);
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setAmountPaid(invoice.getTotal());
        invoice.setBalanceDue(BigDecimal.ZERO);
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice marked paid uuid={}", invoiceUuid);
        return toInvoiceDto(saved, tenantId);
    }

    @Override
    @Transactional
    public InvoiceDto voidInvoice(String invoiceUuid) {
        Long tenantId = TenantContext.getTenantId();
        Invoice invoice = requireInvoice(tenantId, invoiceUuid);
        invoice.setStatus(Invoice.InvoiceStatus.VOID);
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice voided uuid={}", invoiceUuid);
        return toInvoiceDto(saved, tenantId);
    }

    @Override
    public List<InvoiceDto> getByPatient(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        return invoiceRepository
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(patientId, tenantId)
                .stream()
                .map(i -> toInvoiceDto(i, tenantId))
                .toList();
    }

    @Override
    public InvoiceDto getByUuid(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Invoice invoice = requireInvoice(tenantId, uuid);
        return toInvoiceDto(invoice, tenantId);
    }

    @Override
    @Transactional
    public InvoiceDto generateFromEncounter(Long encounterId) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Generating invoice from encounter tenant={} encounter={}", tenantId, encounterId);

        String invoiceNumber = generateInvoiceNumber();
        Invoice invoice = Invoice.builder()
                .tenantId(tenantId)
                .encounterId(encounterId)
                .invoiceNumber(invoiceNumber)
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(BigDecimal.ZERO)
                .status(Invoice.InvoiceStatus.DRAFT)
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice generated from encounter uuid={}", saved.getUuid());
        return toInvoiceDto(saved, tenantId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Invoice requireInvoice(Long tenantId, String uuid) {
        return invoiceRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(i -> !i.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Invoice not found: " + uuid));
    }

    private void addLineItemInternal(Invoice invoice, AddLineItemRequest req, Long tenantId) {
        int qty = req.getQuantity() != null ? req.getQuantity() : 1;
        BigDecimal amount = req.getUnitPrice().multiply(BigDecimal.valueOf(qty));

        InvoiceLineItem item = InvoiceLineItem.builder()
                .tenantId(tenantId)
                .invoiceId(invoice.getId())
                .description(req.getDescription())
                .cptCode(req.getCptCode())
                .icdCodes(req.getIcdCodes())
                .quantity(qty)
                .unitPrice(req.getUnitPrice())
                .amount(amount)
                .build();
        lineItemRepository.save(item);
    }

    private Invoice recalculate(Invoice invoice, Long tenantId) {
        List<InvoiceLineItem> items =
                lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(invoice.getId(), tenantId);

        BigDecimal subtotal = items.stream()
                .map(InvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = invoice.getTax() != null ? invoice.getTax() : BigDecimal.ZERO;
        BigDecimal discount = invoice.getDiscount() != null ? invoice.getDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax).subtract(discount);
        BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal balanceDue = total.subtract(amountPaid);

        invoice.setSubtotal(subtotal);
        invoice.setTotal(total);
        invoice.setBalanceDue(balanceDue);
        return invoiceRepository.save(invoice);
    }

    private String generateInvoiceNumber() {
        return "INV-" + DateTimeFormatter.ofPattern("yyyyMM").format(LocalDate.now())
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private InvoiceDto toInvoiceDto(Invoice i, Long tenantId) {
        List<InvoiceLineItemDto> lineItems =
                lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(i.getId(), tenantId)
                        .stream()
                        .map(this::toLineItemDto)
                        .toList();

        return InvoiceDto.builder()
                .uuid(i.getUuid())
                .patientId(i.getPatientId())
                .encounterId(i.getEncounterId())
                .invoiceNumber(i.getInvoiceNumber())
                .subtotal(i.getSubtotal())
                .tax(i.getTax())
                .discount(i.getDiscount())
                .total(i.getTotal())
                .amountPaid(i.getAmountPaid())
                .balanceDue(i.getBalanceDue())
                .status(i.getStatus() != null ? i.getStatus().name() : null)
                .dueDate(i.getDueDate())
                .sentDate(i.getSentDate())
                .lineItems(lineItems)
                .createdAt(i.getCreatedAt())
                .modifiedAt(i.getModifiedAt())
                .build();
    }

    private InvoiceLineItemDto toLineItemDto(InvoiceLineItem li) {
        return InvoiceLineItemDto.builder()
                .uuid(li.getUuid())
                .invoiceId(li.getInvoiceId())
                .description(li.getDescription())
                .cptCode(li.getCptCode())
                .icdCodes(li.getIcdCodes())
                .quantity(li.getQuantity())
                .unitPrice(li.getUnitPrice())
                .amount(li.getAmount())
                .createdAt(li.getCreatedAt())
                .modifiedAt(li.getModifiedAt())
                .build();
    }
}

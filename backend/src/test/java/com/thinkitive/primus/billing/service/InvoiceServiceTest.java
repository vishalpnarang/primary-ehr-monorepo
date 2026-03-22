package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.AddLineItemRequest;
import com.thinkitive.primus.billing.dto.CreateInvoiceRequest;
import com.thinkitive.primus.billing.dto.InvoiceDto;
import com.thinkitive.primus.billing.entity.Invoice;
import com.thinkitive.primus.billing.entity.InvoiceLineItem;
import com.thinkitive.primus.billing.repository.InvoiceLineItemRepository;
import com.thinkitive.primus.billing.repository.InvoiceRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock InvoiceRepository invoiceRepository;
    @Mock InvoiceLineItemRepository lineItemRepository;

    @InjectMocks
    InvoiceServiceImpl invoiceService;

    private Invoice testInvoice;
    private final String invoiceUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testInvoice = Invoice.builder()
                .tenantId(1L)
                .patientId(100L)
                .encounterId(200L)
                .invoiceNumber("INV-202603-ABCDEF")
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(BigDecimal.ZERO)
                .status(Invoice.InvoiceStatus.DRAFT)
                .dueDate(LocalDate.now().plusDays(30))
                .build();
        testInvoice.setId(1L);
        testInvoice.setUuid(invoiceUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createInvoice persists a DRAFT invoice and returns DTO")
    void createInvoice_persistsDraftAndReturnsDto() {
        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setPatientId(100L);
        request.setEncounterId(200L);
        request.setDueDate(LocalDate.now().plusDays(30));

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            i.setId(1L);
            i.setUuid(invoiceUuid);
            return i;
        });
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(1L, 1L)).thenReturn(List.of());

        InvoiceDto result = invoiceService.create(request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        assertThat(result.getInvoiceNumber()).startsWith("INV-");
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    @DisplayName("addLineItem recalculates invoice total based on line items")
    void addLineItem_recalculatesTotal() {
        AddLineItemRequest lineRequest = new AddLineItemRequest();
        lineRequest.setDescription("Office Visit - Level 3");
        lineRequest.setCptCode("99213");
        lineRequest.setUnitPrice(new BigDecimal("150.00"));
        lineRequest.setQuantity(1);

        InvoiceLineItem savedLine = InvoiceLineItem.builder()
                .tenantId(1L)
                .invoiceId(1L)
                .description("Office Visit - Level 3")
                .cptCode("99213")
                .quantity(1)
                .unitPrice(new BigDecimal("150.00"))
                .amount(new BigDecimal("150.00"))
                .build();
        savedLine.setId(10L);
        savedLine.setUuid(UUID.randomUUID().toString());

        Invoice recalculated = Invoice.builder()
                .tenantId(1L)
                .patientId(100L)
                .invoiceNumber("INV-202603-ABCDEF")
                .subtotal(new BigDecimal("150.00"))
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(new BigDecimal("150.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("150.00"))
                .status(Invoice.InvoiceStatus.DRAFT)
                .build();
        recalculated.setId(1L);
        recalculated.setUuid(invoiceUuid);

        when(invoiceRepository.findByTenantIdAndUuid(1L, invoiceUuid)).thenReturn(Optional.of(testInvoice));
        when(lineItemRepository.save(any(InvoiceLineItem.class))).thenReturn(savedLine);
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(1L, 1L))
                .thenReturn(List.of(savedLine));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(recalculated);

        InvoiceDto result = invoiceService.addLineItem(invoiceUuid, lineRequest);

        assertThat(result).isNotNull();
        assertThat(result.getTotal()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(result.getBalanceDue()).isEqualByComparingTo(new BigDecimal("150.00"));
    }

    @Test
    @DisplayName("sendInvoice transitions status from DRAFT to SENT")
    void sendInvoice_transitionsToSent() {
        when(invoiceRepository.findByTenantIdAndUuid(1L, invoiceUuid)).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(1L, 1L)).thenReturn(List.of());

        InvoiceDto result = invoiceService.send(invoiceUuid);

        assertThat(result.getStatus()).isEqualTo("SENT");
        assertThat(result.getSentDate()).isNotNull();
    }

    @Test
    @DisplayName("voidInvoice transitions status to VOID")
    void voidInvoice_transitionsToVoid() {
        when(invoiceRepository.findByTenantIdAndUuid(1L, invoiceUuid)).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(1L, 1L)).thenReturn(List.of());

        InvoiceDto result = invoiceService.voidInvoice(invoiceUuid);

        assertThat(result.getStatus()).isEqualTo("VOID");
    }

    @Test
    @DisplayName("getByPatient returns all invoices for a patient ordered by created date")
    void getByPatient_returnsInvoiceList() {
        Invoice secondInvoice = Invoice.builder()
                .tenantId(1L)
                .patientId(100L)
                .invoiceNumber("INV-202603-XYZABC")
                .subtotal(new BigDecimal("75.00"))
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(new BigDecimal("75.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("75.00"))
                .status(Invoice.InvoiceStatus.SENT)
                .dueDate(LocalDate.now().plusDays(15))
                .build();
        secondInvoice.setId(2L);
        secondInvoice.setUuid(UUID.randomUUID().toString());

        when(invoiceRepository.findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
                100L, 1L))
                .thenReturn(List.of(testInvoice, secondInvoice));
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(eq(1L), eq(1L)))
                .thenReturn(List.of());
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(eq(2L), eq(1L)))
                .thenReturn(List.of());

        List<InvoiceDto> result = invoiceService.getByPatient(100L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStatus()).isEqualTo("DRAFT");
        assertThat(result.get(1).getStatus()).isEqualTo("SENT");
        verify(invoiceRepository)
                .findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(100L, 1L);
    }

    @Test
    @DisplayName("getByUuid throws NOT_FOUND when invoice UUID does not exist")
    void getByUuid_notFound_throws() {
        String unknownUuid = UUID.randomUUID().toString();
        when(invoiceRepository.findByTenantIdAndUuid(1L, unknownUuid))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.getByUuid(unknownUuid))
                .isInstanceOf(com.thinkitive.primus.shared.exception.PrimusException.class)
                .hasMessageContaining("Invoice not found");
    }

    @Test
    @DisplayName("markPaid sets status to PAID and zeroes out balance due")
    void markPaid_updatesStatusAndBalance() {
        testInvoice.setTotal(new BigDecimal("200.00"));
        testInvoice.setAmountPaid(BigDecimal.ZERO);
        testInvoice.setBalanceDue(new BigDecimal("200.00"));
        testInvoice.setStatus(Invoice.InvoiceStatus.SENT);

        when(invoiceRepository.findByTenantIdAndUuid(1L, invoiceUuid))
                .thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));
        when(lineItemRepository.findByInvoiceIdAndTenantIdAndArchiveFalse(1L, 1L))
                .thenReturn(List.of());

        InvoiceDto result = invoiceService.markPaid(invoiceUuid);

        assertThat(result.getStatus()).isEqualTo("PAID");
        assertThat(result.getBalanceDue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getAmountPaid()).isEqualByComparingTo(new BigDecimal("200.00"));
        verify(invoiceRepository).save(argThat(i ->
                i.getStatus() == Invoice.InvoiceStatus.PAID
                && i.getBalanceDue().compareTo(BigDecimal.ZERO) == 0));
    }
}

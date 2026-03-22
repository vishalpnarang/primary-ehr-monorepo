package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;

import java.util.List;

public interface InvoiceService {

    InvoiceDto create(CreateInvoiceRequest request);

    InvoiceDto addLineItem(String invoiceUuid, AddLineItemRequest request);

    InvoiceDto send(String invoiceUuid);

    InvoiceDto markPaid(String invoiceUuid);

    InvoiceDto voidInvoice(String invoiceUuid);

    List<InvoiceDto> getByPatient(Long patientId);

    InvoiceDto getByUuid(String uuid);

    InvoiceDto generateFromEncounter(Long encounterId);
}

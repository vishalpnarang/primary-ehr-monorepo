package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderDto createLabOrder(LabOrderRequest request);

    OrderDto createImagingOrder(ImagingOrderRequest request);

    OrderDto createReferral(ReferralRequest request);

    OrderDto getOrder(UUID uuid);

    List<OrderDto> getOrdersByPatient(UUID patientUuid);

    OrderDto receiveLabResult(UUID orderUuid, LabResultRequest request);

    OrderDto reviewResult(UUID orderUuid, OrderReviewRequest request);
}

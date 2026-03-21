package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;

import java.util.List;

public interface OrderService {

    OrderDto createLabOrder(LabOrderRequest request);

    OrderDto createImagingOrder(ImagingOrderRequest request);

    OrderDto createReferral(ReferralRequest request);

    OrderDto getOrder(String uuid);

    List<OrderDto> getOrdersByPatient(String patientUuid);

    OrderDto receiveLabResult(String orderUuid, LabResultRequest request);

    OrderDto reviewResult(String orderUuid, OrderReviewRequest request);
}

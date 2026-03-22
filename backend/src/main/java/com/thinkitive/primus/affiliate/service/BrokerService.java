package com.thinkitive.primus.affiliate.service;

import com.thinkitive.primus.affiliate.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BrokerService {

    Page<BrokerDto> getBrokers(String status, Pageable pageable);

    BrokerDto getBroker(String uuid);

    BrokerDto createBroker(CreateBrokerRequest request);

    BrokerDto updateBroker(String uuid, UpdateBrokerRequest request);

    void deleteBroker(String uuid);
}

package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.*;

import java.util.List;

public interface PrescriptionService {

    PrescriptionDto createPrescription(CreatePrescriptionRequest request);

    PrescriptionDto getPrescription(String uuid);

    List<PrescriptionDto> getPrescriptionsByPatient(String patientUuid);

    PrescriptionDto sendToPharmacy(String uuid);

    PrescriptionDto cancelPrescription(String uuid);

    InteractionResult checkInteractions(InteractionCheckRequest request);
}

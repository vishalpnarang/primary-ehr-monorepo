package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.*;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {

    PrescriptionDto createPrescription(CreatePrescriptionRequest request);

    PrescriptionDto getPrescription(UUID uuid);

    List<PrescriptionDto> getPrescriptionsByPatient(UUID patientUuid);

    PrescriptionDto sendToPharmacy(UUID uuid);

    PrescriptionDto cancelPrescription(UUID uuid);

    InteractionResult checkInteractions(InteractionCheckRequest request);
}

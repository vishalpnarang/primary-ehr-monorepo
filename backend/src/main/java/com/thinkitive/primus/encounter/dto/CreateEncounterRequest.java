package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateEncounterRequest {

    @NotNull private UUID patientUuid;
    @NotNull private UUID appointmentUuid;
    private String providerId;
    private String encounterType; // OFFICE_VISIT | TELEHEALTH | PREVENTIVE | URGENT
    private String chiefComplaint;
}

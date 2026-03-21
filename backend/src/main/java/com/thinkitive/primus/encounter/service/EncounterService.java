package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;

import java.util.List;
import java.util.UUID;

public interface EncounterService {

    EncounterDto createEncounter(CreateEncounterRequest request);

    EncounterDto getEncounter(UUID uuid);

    EncounterDto updateEncounter(UUID uuid, UpdateEncounterRequest request);

    EncounterDto signEncounter(UUID uuid);

    EncounterDto addAddendum(UUID uuid, AddendumRequest request);

    List<EncounterDto> getEncountersByPatient(UUID patientUuid);
}

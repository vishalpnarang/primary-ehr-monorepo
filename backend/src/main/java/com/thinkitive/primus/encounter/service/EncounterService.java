package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;

import java.util.List;

public interface EncounterService {

    EncounterDto createEncounter(CreateEncounterRequest request);

    EncounterDto getEncounter(String uuid);

    EncounterDto updateEncounter(String uuid, UpdateEncounterRequest request);

    EncounterDto signEncounter(String uuid);

    EncounterDto addAddendum(String uuid, AddendumRequest request);

    List<EncounterDto> getEncountersByPatient(String patientUuid);
}

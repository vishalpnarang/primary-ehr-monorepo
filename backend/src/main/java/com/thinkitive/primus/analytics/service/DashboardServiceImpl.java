package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.*;
import com.thinkitive.primus.billing.entity.Claim;
import com.thinkitive.primus.billing.repository.ClaimRepository;
import com.thinkitive.primus.encounter.entity.Encounter;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.notification.repository.NotificationRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.CareGapRepository;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.tenant.entity.Location;
import com.thinkitive.primus.tenant.entity.Room;
import com.thinkitive.primus.tenant.repository.LocationRepository;
import com.thinkitive.primus.tenant.repository.RoomRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Phase-9 aggregation layer. Queries real JPA repositories for all dashboard KPIs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final AppointmentRepository  appointmentRepository;
    private final EncounterRepository    encounterRepository;
    private final PatientRepository      patientRepository;
    private final ClaimRepository        claimRepository;
    private final NotificationRepository notificationRepository;
    private final CareGapRepository      careGapRepository;
    private final LocationRepository     locationRepository;
    private final RoomRepository         roomRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");

    // ── Provider dashboard ────────────────────────────────────────────────────

    @Override
    public ProviderDashboardDto getProviderDashboard(String providerId) {
        Long tenantId = TenantContext.getTenantId();
        Long userId   = currentUserId();
        LocalDate today = LocalDate.now();

        // Resolve provider's numeric DB id from the path param (may be "PRV-XXXXX" or a Long string)
        Long providerDbId = resolveProviderId(providerId, userId);

        List<Appointment> todayAppts = appointmentRepository
                .findByTenantIdAndDateAndProviderId(tenantId, today, providerDbId);

        int total     = todayAppts.size();
        int completed = (int) todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED).count();
        int pending   = total - completed;

        // Inbox unread count
        long inboxUnread = notificationRepository
                .countByTenantIdAndUserIdAndReadFalse(tenantId, userId);

        // Pending signatures: encounters in DRAFT or IN_PROGRESS for this provider today
        List<Encounter> unsignedEncounters = encounterRepository
                .findByTenantIdAndProviderIdAndStatusIn(tenantId, providerDbId,
                        List.of(Encounter.EncounterStatus.DRAFT, Encounter.EncounterStatus.IN_PROGRESS));

        // Upcoming appointments (next 3 that are not completed/cancelled)
        List<ProviderDashboardDto.AppointmentSummary> upcoming = todayAppts.stream()
                .filter(a -> a.getStatus() != Appointment.AppointmentStatus.COMPLETED
                          && a.getStatus() != Appointment.AppointmentStatus.CANCELLED
                          && a.getStatus() != Appointment.AppointmentStatus.NO_SHOW)
                .limit(3)
                .map(a -> {
                    Patient patient = patientRepository.findById(a.getPatientId()).orElse(null);
                    String patientName = patient != null
                            ? patient.getFirstName() + " " + patient.getLastName() : "Unknown";
                    return ProviderDashboardDto.AppointmentSummary.builder()
                            .patientName(patientName)
                            .time(a.getStartTime() != null ? a.getStartTime().format(TIME_FMT) : "")
                            .type(a.getType() != null ? a.getType().name() : "")
                            .status(a.getStatus() != null ? a.getStatus().name() : "")
                            .chiefComplaint(a.getReason())
                            .build();
                })
                .toList();

        return ProviderDashboardDto.builder()
                .todayAppointmentsTotal(total)
                .todayAppointmentsCompleted(completed)
                .todayAppointmentsPending(pending)
                .inboxItemsUnread((int) inboxUnread)
                .pendingSignatures(unsignedEncounters.size())
                .labResultsPending(0)       // Phase 4: lab order result queue
                .refillRequestsPending(0)   // Phase 5: prescription refill queue
                .upcomingAppointments(upcoming)
                .build();
    }

    // ── Nurse dashboard ───────────────────────────────────────────────────────

    @Override
    public NurseDashboardDto getNurseDashboard() {
        Long tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();

        // Patients who have arrived and need rooming
        List<Appointment> arrived = appointmentRepository.findByTenantIdAndDate(tenantId, today)
                .stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.ARRIVED
                          || a.getStatus() == Appointment.AppointmentStatus.IN_ROOM)
                .toList();

        int patientsToRoom = (int) arrived.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.ARRIVED).count();
        int vitalsNeeded   = patientsToRoom; // proxy: every ARRIVED patient needs vitals

        // Build rooming queue
        List<NurseDashboardDto.RoomingTask> queue = arrived.stream()
                .map(a -> {
                    Patient patient = patientRepository.findById(a.getPatientId()).orElse(null);
                    String patientName = patient != null
                            ? patient.getFirstName() + " " + patient.getLastName() : "Unknown";
                    String mrn = patient != null ? patient.getMrn() : "";

                    String assignedRoom = "";
                    if (a.getRoomId() != null) {
                        assignedRoom = roomRepository.findById(a.getRoomId())
                                .map(Room::getName)
                                .orElse("Unassigned");
                    }

                    String roomStatus = a.getStatus() == Appointment.AppointmentStatus.IN_ROOM
                            ? "ROOMING" : "WAITING";

                    return NurseDashboardDto.RoomingTask.builder()
                            .patientName(patientName)
                            .mrn(mrn)
                            .checkedInAt(a.getStartTime() != null ? a.getStartTime().format(TIME_FMT) : "")
                            .appointmentType(a.getType() != null ? a.getType().name() : "")
                            .assignedRoom(assignedRoom)
                            .status(roomStatus)
                            .build();
                })
                .toList();

        return NurseDashboardDto.builder()
                .patientsToRoom(patientsToRoom)
                .vitalsNeeded(vitalsNeeded)
                .medicationTasksPending(0)  // Phase 4: medication administration tasks
                .roomingQueue(queue)
                .build();
    }

    // ── Front desk dashboard ──────────────────────────────────────────────────

    @Override
    public FrontDeskDashboardDto getFrontDeskDashboard() {
        Long tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();

        List<Appointment> todayAppts = appointmentRepository.findByTenantIdAndDate(tenantId, today);

        int scheduledToday = todayAppts.size();
        int checkedIn      = (int) todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.ARRIVED
                          || a.getStatus() == Appointment.AppointmentStatus.IN_ROOM
                          || a.getStatus() == Appointment.AppointmentStatus.IN_PROGRESS
                          || a.getStatus() == Appointment.AppointmentStatus.COMPLETED).count();
        int noShows        = (int) todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.NO_SHOW).count();
        int cancellations  = (int) todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED).count();
        int pendingCheckIn = (int) todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.SCHEDULED
                          || a.getStatus() == Appointment.AppointmentStatus.CONFIRMED).count();

        List<FrontDeskDashboardDto.CheckInItem> checkInQueue = todayAppts.stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.SCHEDULED
                          || a.getStatus() == Appointment.AppointmentStatus.CONFIRMED
                          || a.getStatus() == Appointment.AppointmentStatus.ARRIVED)
                .limit(10)
                .map(a -> {
                    Patient patient = patientRepository.findById(a.getPatientId()).orElse(null);
                    String patientName = patient != null
                            ? patient.getFirstName() + " " + patient.getLastName() : "Unknown";
                    String mrn = patient != null ? patient.getMrn() : "";
                    return FrontDeskDashboardDto.CheckInItem.builder()
                            .patientName(patientName)
                            .mrn(mrn)
                            .appointmentTime(a.getStartTime() != null ? a.getStartTime().format(TIME_FMT) : "")
                            .provider("Provider " + a.getProviderId())
                            .insurancePlanName("")   // Phase 2: join patient_insurance
                            .status(a.getStatus() != null ? a.getStatus().name() : "")
                            .build();
                })
                .toList();

        return FrontDeskDashboardDto.builder()
                .scheduledToday(scheduledToday)
                .checkedIn(checkedIn)
                .noShows(noShows)
                .cancellations(cancellations)
                .pendingCheckIn(pendingCheckIn)
                .coPaysDue(0)       // Phase 6: co-pay queue from billing
                .checkInQueue(checkInQueue)
                .build();
    }

    // ── Billing dashboard ─────────────────────────────────────────────────────

    @Override
    public BillingDashboardDto getBillingDashboard() {
        Long tenantId = TenantContext.getTenantId();
        List<Claim> allClaims = claimRepository.findByTenantId(tenantId);

        long total   = allClaims.size();
        long denied  = allClaims.stream().filter(c -> c.getStatus() == Claim.ClaimStatus.DENIED).count();
        long ready   = allClaims.stream().filter(c -> c.getStatus() == Claim.ClaimStatus.READY).count();
        long accepted = allClaims.stream().filter(c -> c.getStatus() == Claim.ClaimStatus.ACCEPTED).count();
        long paid    = allClaims.stream().filter(c -> c.getStatus() == Claim.ClaimStatus.PAID).count();

        double cleanClaimRate = total > 0 ? (double) (accepted + paid) / total * 100 : 0.0;
        double denialRate     = total > 0 ? (double) denied / total * 100 : 0.0;

        BigDecimal totalAr = allClaims.stream()
                .filter(c -> c.getStatus() != Claim.ClaimStatus.PAID)
                .map(c -> {
                    BigDecimal charge = c.getTotalCharge() != null ? c.getTotalCharge() : BigDecimal.ZERO;
                    BigDecimal paidAmt = c.getPaidAmount() != null ? c.getPaidAmount() : BigDecimal.ZERO;
                    return charge.subtract(paidAmt).max(BigDecimal.ZERO);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate today       = LocalDate.now();
        LocalDate monthStart  = today.withDayOfMonth(1);

        BigDecimal collectedThisMonth = allClaims.stream()
                .filter(c -> c.getStatus() == Claim.ClaimStatus.PAID
                          && c.getPaidAt() != null
                          && !c.getPaidAt().isBefore(monthStart.atStartOfDay().toInstant(java.time.ZoneOffset.UTC)))
                .map(c -> c.getPaidAmount() != null ? c.getPaidAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // AR aging buckets
        LocalDate d30  = today.minusDays(30);
        LocalDate d60  = today.minusDays(60);

        BigDecimal days30Ar = totalArForDateRange(allClaims, d30, today);
        BigDecimal days60Ar = totalArForDateRange(allClaims, d60, d30);
        BigDecimal days90PlusAr = totalArForDateRange(allClaims, LocalDate.MIN, d60);

        return BillingDashboardDto.builder()
                .totalArAmount(totalAr)
                .collectedThisMonth(collectedThisMonth)
                .cleanClaimRate(Math.round(cleanClaimRate * 10.0) / 10.0)
                .denialRate(Math.round(denialRate * 10.0) / 10.0)
                .claimsPendingSubmission((int) ready)
                .claimsDenied((int) denied)
                .claimsNeedingAttention((int) (denied + ready))
                .days30Ar(days30Ar)
                .days60Ar(days60Ar)
                .days90PlusAr(days90PlusAr)
                .build();
    }

    // ── Admin dashboard ───────────────────────────────────────────────────────

    @Override
    public AdminDashboardDto getAdminDashboard() {
        Long tenantId = TenantContext.getTenantId();
        LocalDate today      = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        long totalActivePatients = patientRepository
                .countByTenantIdAndStatus(tenantId, Patient.PatientStatus.ACTIVE);

        long openLocations = locationRepository.findByTenantIdAndActiveTrue(tenantId).size();

        List<Appointment> monthAppts = appointmentRepository
                .findByTenantIdAndDateBetween(tenantId, monthStart, today);
        int appointmentsThisMonth = monthAppts.size();

        int newPatientsThisMonth = (int) patientRepository
                .findByTenantIdAndCreatedAtBetween(tenantId,
                        monthStart.atStartOfDay().toInstant(java.time.ZoneOffset.UTC),
                        today.plusDays(1).atStartOfDay().toInstant(java.time.ZoneOffset.UTC))
                .size();

        long totalEncountersThisMonth = encounterRepository
                .findByTenantIdAndDateBetween(tenantId, monthStart, today).size();

        // Active providers: distinct provider IDs in appointments this month
        long totalActiveProviders = monthAppts.stream()
                .map(Appointment::getProviderId)
                .distinct()
                .count();

        return AdminDashboardDto.builder()
                .totalActivePatients((int) totalActivePatients)
                .totalActiveProviders((int) totalActiveProviders)
                .appointmentsThisMonth(appointmentsThisMonth)
                .newPatientsThisMonth(newPatientsThisMonth)
                .openLocations((int) openLocations)
                .avgPatientSatisfaction(0.0)        // Phase 9: patient satisfaction survey table
                .providerUtilizationRate(0.0)       // Phase 9: schedule capacity table
                .totalEncountersThisMonth(totalEncountersThisMonth)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BigDecimal totalArForDateRange(List<Claim> claims, LocalDate from, LocalDate to) {
        return claims.stream()
                .filter(c -> c.getStatus() != Claim.ClaimStatus.PAID
                          && c.getDateOfService() != null
                          && !c.getDateOfService().isBefore(from)
                          && c.getDateOfService().isBefore(to))
                .map(c -> {
                    BigDecimal charge = c.getTotalCharge() != null ? c.getTotalCharge() : BigDecimal.ZERO;
                    BigDecimal paidAmt = c.getPaidAmount() != null ? c.getPaidAmount() : BigDecimal.ZERO;
                    return charge.subtract(paidAmt).max(BigDecimal.ZERO);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Map provider path param to numeric DB id. Path can be "PRV-00001" or a raw Long. */
    private Long resolveProviderId(String providerId, Long fallback) {
        if (providerId == null) return fallback;
        try {
            return Long.parseLong(providerId);
        } catch (NumberFormatException ignored) {
            // "PRV-00001" → use current user's id as fallback
            return fallback;
        }
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaims().get("user_id");
            if (userIdClaim instanceof Number num) return num.longValue();
            if (userIdClaim instanceof String s) {
                try { return Long.parseLong(s); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
            }
            try { return Long.parseLong(jwt.getSubject()); } catch (NumberFormatException ignored) { /* non-parseable — skip */ }
        }
        return 0L;
    }
}

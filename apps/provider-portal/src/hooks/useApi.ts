/**
 * TanStack Query hooks wrapping real backend API.
 * Each hook tries the real API first. If the backend is down or returns
 * no data, components fall back to their inline mock data gracefully.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dashboardApi, patientApi, appointmentApi, encounterApi,
  orderApi, prescriptionApi, billingApi, messagingApi,
  inboxApi, notificationApi, settingsApi,
  patientHistoryApi, directoryApi, schedulingAdminApi, clinicalTemplateApi,
  encounterDetailApi, carePlanApi, labApi, formularyApi, inventoryApi,
  invoiceApi, paymentApi, planApi, rbacApi, crmApi, employerApi,
  analyticsApi, notificationAdminApi, formTemplateApi, questionnaireApi,
} from '@/lib/api';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const useProviderDashboard = (providerId?: string) =>
  useQuery({
    queryKey: ['dashboard', 'provider', providerId],
    queryFn: () => dashboardApi.provider(providerId).then(r => r.data.data),
    retry: 1,
    staleTime: 30_000,
  });

export const useNurseDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'nurse'],
    queryFn: () => dashboardApi.nurse().then(r => r.data.data),
    retry: 1,
  });

export const useFrontDeskDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'frontdesk'],
    queryFn: () => dashboardApi.frontdesk().then(r => r.data.data),
    retry: 1,
  });

export const useBillingDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'billing'],
    queryFn: () => dashboardApi.billing().then(r => r.data.data),
    retry: 1,
  });

// ─── Patients ────────────────────────────────────────────────────────────────

export const usePatientList = (page = 0, size = 20) =>
  useQuery({
    queryKey: ['patients', 'list', page, size],
    queryFn: () => patientApi.list(page, size).then(r => r.data.data),
    retry: 1,
  });

export const usePatientSearch = (query: string) =>
  useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => patientApi.search(query).then(r => r.data.data),
    enabled: query.length >= 2,
    retry: 1,
  });

export const usePatient = (uuid: string) =>
  useQuery({
    queryKey: ['patients', uuid],
    queryFn: () => patientApi.getById(uuid).then(r => r.data.data),
    enabled: !!uuid,
    retry: 1,
  });

export const usePatientTimeline = (uuid: string) =>
  useQuery({
    queryKey: ['patients', uuid, 'timeline'],
    queryFn: () => patientApi.getTimeline(uuid).then(r => r.data.data),
    enabled: !!uuid,
    retry: 1,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};

// ─── Appointments ────────────────────────────────────────────────────────────

export const useTodaysAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentApi.today().then(r => r.data.data),
    retry: 1,
    refetchInterval: 60_000, // Refresh every minute
  });

export const useAvailableSlots = (providerId: string, date: string) =>
  useQuery({
    queryKey: ['appointments', 'slots', providerId, date],
    queryFn: () => appointmentApi.availableSlots(providerId, date).then(r => r.data.data),
    enabled: !!providerId && !!date,
    retry: 1,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => appointmentApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) =>
      appointmentApi.updateStatus(uuid, status).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

// ─── Encounters ──────────────────────────────────────────────────────────────

export const usePatientEncounters = (patientUuid: string) =>
  useQuery({
    queryKey: ['encounters', 'patient', patientUuid],
    queryFn: () => encounterApi.list(patientUuid).then(r => r.data.data),
    enabled: !!patientUuid,
    retry: 1,
  });

export const useCreateEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => encounterApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  });
};

export const useSignEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => encounterApi.sign(uuid).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  });
};

// ─── Billing ─────────────────────────────────────────────────────────────────

export const useBillingKpi = () =>
  useQuery({
    queryKey: ['billing', 'kpi'],
    queryFn: () => billingApi.getKpi().then(r => r.data.data),
    retry: 1,
  });

export const useClaims = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['billing', 'claims', params],
    queryFn: () => billingApi.getClaims(params).then(r => r.data.data),
    retry: 1,
  });

// ─── Messaging ───────────────────────────────────────────────────────────────

export const useMessageThreads = () =>
  useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: () => messagingApi.getThreads().then(r => r.data.data),
    retry: 1,
  });

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadUuid, body }: { threadUuid: string; body: string }) =>
      messagingApi.sendMessage(threadUuid, body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
};

// ─── Inbox ───────────────────────────────────────────────────────────────────

export const useInboxItems = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['inbox', params],
    queryFn: () => inboxApi.list(params).then(r => r.data.data),
    retry: 1,
  });

export const useInboxCounts = () =>
  useQuery({
    queryKey: ['inbox', 'counts'],
    queryFn: () => inboxApi.counts().then(r => r.data.data),
    retry: 1,
    refetchInterval: 60_000,
  });

// ─── Notifications ───────────────────────────────────────────────────────────

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.unreadCount().then(r => r.data.data),
    retry: 1,
    refetchInterval: 30_000,
  });

// ─── Settings ────────────────────────────────────────────────────────────────

export const useOrganization = () =>
  useQuery({
    queryKey: ['settings', 'organization'],
    queryFn: () => settingsApi.getOrganization().then(r => r.data.data),
    retry: 1,
  });

export const useLocations = () =>
  useQuery({
    queryKey: ['settings', 'locations'],
    queryFn: () => settingsApi.getLocations().then(r => r.data.data),
    retry: 1,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ['settings', 'users'],
    queryFn: () => settingsApi.getUsers().then(r => r.data.data),
    retry: 1,
  });

// ─── Patient History ──────────────────────────────────────────────────────────

export const useFamilyHistory = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'family'],
    queryFn: () => patientHistoryApi.getFamilyHistory(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useAddFamilyHistory = (patientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientHistoryApi.addFamilyHistory(patientId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', patientId, 'history', 'family'] }),
  });
};

export const useSocialHistory = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'social'],
    queryFn: () => patientHistoryApi.getSocialHistory(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useSaveSocialHistory = (patientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientHistoryApi.saveSocialHistory(patientId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', patientId, 'history', 'social'] }),
  });
};

export const useSurgicalHistory = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'surgical'],
    queryFn: () => patientHistoryApi.getSurgicalHistory(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useAddSurgicalHistory = (patientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientHistoryApi.addSurgicalHistory(patientId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', patientId, 'history', 'surgical'] }),
  });
};

export const useMedicalHistory = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'medical'],
    queryFn: () => patientHistoryApi.getMedicalHistory(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const usePatientFlags = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'flags'],
    queryFn: () => patientHistoryApi.getFlags(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useEmergencyContacts = (patientId: string) =>
  useQuery({
    queryKey: ['patients', patientId, 'history', 'emergency-contacts'],
    queryFn: () => patientHistoryApi.getEmergencyContacts(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useAddEmergencyContact = (patientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientHistoryApi.addEmergencyContact(patientId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', patientId, 'history', 'emergency-contacts'] }),
  });
};

// ─── Directory ────────────────────────────────────────────────────────────────

export const usePharmacies = () =>
  useQuery({
    queryKey: ['directory', 'pharmacies'],
    queryFn: () => directoryApi.getPharmacies().then(r => r.data.data),
    retry: 1,
  });

export const useCreatePharmacy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => directoryApi.createPharmacy(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['directory', 'pharmacies'] }),
  });
};

export const useDirectoryContacts = (type?: string) =>
  useQuery({
    queryKey: ['directory', 'contacts', type],
    queryFn: () => directoryApi.getContacts(type).then(r => r.data.data),
    retry: 1,
  });

export const usePatientPharmacies = (patientId: string) =>
  useQuery({
    queryKey: ['directory', 'patients', patientId, 'pharmacies'],
    queryFn: () => directoryApi.getPatientPharmacies(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useLinkPharmacy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, pharmacyId }: { patientId: string; pharmacyId: string }) =>
      directoryApi.linkPharmacy(patientId, pharmacyId).then(r => r.data.data),
    onSuccess: (_data, { patientId }) =>
      qc.invalidateQueries({ queryKey: ['directory', 'patients', patientId, 'pharmacies'] }),
  });
};

// ─── Scheduling Admin ─────────────────────────────────────────────────────────

export const useAppointmentTypes = () =>
  useQuery({
    queryKey: ['scheduling', 'admin', 'appointment-types'],
    queryFn: () => schedulingAdminApi.getAppointmentTypes().then(r => r.data.data),
    retry: 1,
  });

export const useCreateAppointmentType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => schedulingAdminApi.createAppointmentType(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduling', 'admin', 'appointment-types'] }),
  });
};

export const useProviderAvailability = (providerId: string) =>
  useQuery({
    queryKey: ['scheduling', 'admin', 'availability', providerId],
    queryFn: () => schedulingAdminApi.getAvailability(providerId).then(r => r.data.data),
    enabled: !!providerId,
    retry: 1,
  });

export const useSetAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => schedulingAdminApi.setAvailability(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduling', 'admin', 'availability'] }),
  });
};

export const useBlockDays = (providerId: string, from?: string, to?: string) =>
  useQuery({
    queryKey: ['scheduling', 'admin', 'block-days', providerId, from, to],
    queryFn: () => schedulingAdminApi.getBlockDays(providerId, from, to).then(r => r.data.data),
    enabled: !!providerId,
    retry: 1,
  });

// ─── Clinical Templates ───────────────────────────────────────────────────────

export const useMacros = () =>
  useQuery({
    queryKey: ['clinical-templates', 'macros'],
    queryFn: () => clinicalTemplateApi.getMacros().then(r => r.data.data),
    retry: 1,
  });

export const useCreateMacro = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => clinicalTemplateApi.createMacro(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinical-templates', 'macros'] }),
  });
};

export const useExpandMacro = (abbreviation: string) =>
  useQuery({
    queryKey: ['clinical-templates', 'macros', 'expand', abbreviation],
    queryFn: () => clinicalTemplateApi.expandMacro(abbreviation).then(r => r.data.data),
    enabled: !!abbreviation,
    retry: 1,
  });

export const useSoapTemplates = () =>
  useQuery({
    queryKey: ['clinical-templates', 'soap-templates'],
    queryFn: () => clinicalTemplateApi.getSoapTemplates().then(r => r.data.data),
    retry: 1,
  });

export const useCreateSoapTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => clinicalTemplateApi.createSoapTemplate(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinical-templates', 'soap-templates'] }),
  });
};

// ─── Encounter Details ────────────────────────────────────────────────────────

export const useEncounterDiagnoses = (encounterUuid: string) =>
  useQuery({
    queryKey: ['encounters', encounterUuid, 'diagnoses'],
    queryFn: () => encounterDetailApi.getDiagnoses(encounterUuid).then(r => r.data.data),
    enabled: !!encounterUuid,
    retry: 1,
  });

export const useAddDiagnosis = (encounterUuid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => encounterDetailApi.addDiagnosis(encounterUuid, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters', encounterUuid, 'diagnoses'] }),
  });
};

export const useEncounterProcedures = (encounterUuid: string) =>
  useQuery({
    queryKey: ['encounters', encounterUuid, 'procedures'],
    queryFn: () => encounterDetailApi.getProcedures(encounterUuid).then(r => r.data.data),
    enabled: !!encounterUuid,
    retry: 1,
  });

export const useAddProcedure = (encounterUuid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => encounterDetailApi.addProcedure(encounterUuid, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters', encounterUuid, 'procedures'] }),
  });
};

export const useEncounterComments = (encounterUuid: string) =>
  useQuery({
    queryKey: ['encounters', encounterUuid, 'comments'],
    queryFn: () => encounterDetailApi.getComments(encounterUuid).then(r => r.data.data),
    enabled: !!encounterUuid,
    retry: 1,
  });

export const useAddComment = (encounterUuid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => encounterDetailApi.addComment(encounterUuid, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters', encounterUuid, 'comments'] }),
  });
};

// ─── Care Plans ───────────────────────────────────────────────────────────────

export const usePatientCarePlans = (patientId: string) =>
  useQuery({
    queryKey: ['care-plans', 'patient', patientId],
    queryFn: () => carePlanApi.getByPatient(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useCreateCarePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => carePlanApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['care-plans'] }),
  });
};

export const useUpdateCarePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      carePlanApi.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['care-plans'] }),
  });
};

export const useCarePlanGoals = (planId: string) =>
  useQuery({
    queryKey: ['care-plans', planId, 'goals'],
    queryFn: () => carePlanApi.getGoals(planId).then(r => r.data.data),
    enabled: !!planId,
    retry: 1,
  });

export const useAddCarePlanGoal = (planId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => carePlanApi.addGoal(planId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['care-plans', planId, 'goals'] }),
  });
};

// ─── Labs ─────────────────────────────────────────────────────────────────────

export const useLabOrderSets = () =>
  useQuery({
    queryKey: ['labs', 'order-sets'],
    queryFn: () => labApi.getOrderSets().then(r => r.data.data),
    retry: 1,
  });

export const useLabCatalogSearch = (query: string) =>
  useQuery({
    queryKey: ['labs', 'catalog', 'search', query],
    queryFn: () => labApi.searchCatalog(query).then(r => r.data.data),
    enabled: query.length >= 2,
    retry: 1,
  });

export const usePatientPocResults = (patientId: string) =>
  useQuery({
    queryKey: ['labs', 'poc-results', 'patient', patientId],
    queryFn: () => labApi.getPocResults(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useRecordPocResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => labApi.recordPocResult(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labs', 'poc-results'] }),
  });
};

// ─── Formulary ────────────────────────────────────────────────────────────────

export const useFormularySearch = (query: string) =>
  useQuery({
    queryKey: ['formulary', 'search', query],
    queryFn: () => formularyApi.search(query).then(r => r.data.data),
    enabled: query.length >= 2,
    retry: 1,
  });

export const useFormulary = () =>
  useQuery({
    queryKey: ['formulary'],
    queryFn: () => formularyApi.getAll().then(r => r.data.data),
    retry: 1,
  });

export const usePatientIntolerances = (patientId: string) =>
  useQuery({
    queryKey: ['formulary', 'patient', patientId, 'intolerances'],
    queryFn: () => formularyApi.getIntolerances(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useAddIntolerance = (patientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => formularyApi.addIntolerance(patientId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formulary', 'patient', patientId, 'intolerances'] }),
  });
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const useInventoryItems = () =>
  useQuery({
    queryKey: ['inventory', 'items'],
    queryFn: () => inventoryApi.getItems().then(r => r.data.data),
    retry: 1,
  });

export const useCreateInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => inventoryApi.createItem(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', 'items'] }),
  });
};

export const useLowStockItems = () =>
  useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryApi.getLowStock().then(r => r.data.data),
    retry: 1,
  });

export const useRecordInventoryTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => inventoryApi.recordTransaction(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const usePatientInvoices = (patientId: string) =>
  useQuery({
    queryKey: ['invoices', 'patient', patientId],
    queryFn: () => invoiceApi.getByPatient(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => invoiceApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useSendInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceApi.send(id).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useVoidInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceApi.void_(id).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const usePatientPaymentHistory = (patientId: string) =>
  useQuery({
    queryKey: ['payments', 'patient', patientId],
    queryFn: () => paymentApi.getHistory(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const usePatientPaymentMethods = (patientId: string) =>
  useQuery({
    queryKey: ['payments', 'methods', patientId],
    queryFn: () => paymentApi.getMethods(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => paymentApi.record(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useSavePaymentMethod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => paymentApi.saveMethod(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments', 'methods'] }),
  });
};

// ─── Membership Plans ─────────────────────────────────────────────────────────

export const usePlans = () =>
  useQuery({
    queryKey: ['plans'],
    queryFn: () => planApi.getAll().then(r => r.data.data),
    retry: 1,
  });

export const usePatientEnrollment = (patientId: string) =>
  useQuery({
    queryKey: ['plans', 'patient', patientId],
    queryFn: () => planApi.getEnrollment(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

export const useEnrollPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => planApi.enroll(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
};

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => planApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  });
};

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export const useRbacRoles = () =>
  useQuery({
    queryKey: ['rbac', 'roles'],
    queryFn: () => rbacApi.getRoles().then(r => r.data.data),
    retry: 1,
  });

export const useRolePermissions = (roleId: string) =>
  useQuery({
    queryKey: ['rbac', 'roles', roleId, 'permissions'],
    queryFn: () => rbacApi.getPermissions(roleId).then(r => r.data.data),
    enabled: !!roleId,
    retry: 1,
  });

export const useRbacFeatures = () =>
  useQuery({
    queryKey: ['rbac', 'features'],
    queryFn: () => rbacApi.getFeatures().then(r => r.data.data),
    retry: 1,
  });

export const useToggleFeature = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (featureId: string) => rbacApi.toggleFeature(featureId).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rbac', 'features'] }),
  });
};

// ─── CRM ─────────────────────────────────────────────────────────────────────

export const useCrmTickets = () =>
  useQuery({
    queryKey: ['crm', 'tickets'],
    queryFn: () => crmApi.getTickets().then(r => r.data.data),
    retry: 1,
  });

export const useCreateCrmTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => crmApi.createTicket(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'tickets'] }),
  });
};

export const useUpdateCrmTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      crmApi.updateTicket(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'tickets'] }),
  });
};

export const useCrmLeads = () =>
  useQuery({
    queryKey: ['crm', 'leads'],
    queryFn: () => crmApi.getLeads().then(r => r.data.data),
    retry: 1,
  });

export const useCrmCampaigns = () =>
  useQuery({
    queryKey: ['crm', 'campaigns'],
    queryFn: () => crmApi.getCampaigns().then(r => r.data.data),
    retry: 1,
  });

// ─── Employers ───────────────────────────────────────────────────────────────

export const useEmployers = () =>
  useQuery({
    queryKey: ['employers'],
    queryFn: () => employerApi.getAll().then(r => r.data.data),
    retry: 1,
  });

export const useCreateEmployer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => employerApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employers'] }),
  });
};

export const useEmployerEmployees = (employerId: string) =>
  useQuery({
    queryKey: ['employers', employerId, 'employees'],
    queryFn: () => employerApi.getEmployees(employerId).then(r => r.data.data),
    enabled: !!employerId,
    retry: 1,
  });

export const useAddEmployee = (employerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => employerApi.addEmployee(employerId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employers', employerId, 'employees'] }),
  });
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const useAnalyticsDashboards = () =>
  useQuery({
    queryKey: ['analytics', 'dashboards'],
    queryFn: () => analyticsApi.getDashboards().then(r => r.data.data),
    retry: 1,
  });

export const useAnalyticsReports = () =>
  useQuery({
    queryKey: ['analytics', 'reports'],
    queryFn: () => analyticsApi.getReports().then(r => r.data.data),
    retry: 1,
  });

export const useRunReport = () =>
  useMutation({
    mutationFn: ({ id, params }: { id: string; params?: Record<string, unknown> }) =>
      analyticsApi.runReport(id, params).then(r => r.data.data),
  });

export const usePatientVolume = () =>
  useQuery({
    queryKey: ['analytics', 'stats', 'patient-volume'],
    queryFn: () => analyticsApi.getPatientVolume().then(r => r.data.data),
    retry: 1,
  });

export const useRevenueStats = () =>
  useQuery({
    queryKey: ['analytics', 'stats', 'revenue'],
    queryFn: () => analyticsApi.getRevenue().then(r => r.data.data),
    retry: 1,
  });

// ─── Notification Admin ───────────────────────────────────────────────────────

export const useNotificationPreferences = () =>
  useQuery({
    queryKey: ['notifications', 'admin', 'preferences'],
    queryFn: () => notificationAdminApi.getPreferences().then(r => r.data.data),
    retry: 1,
  });

export const useUpdateNotificationPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => notificationAdminApi.updatePreferences(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'admin', 'preferences'] }),
  });
};

export const useNotificationLog = () =>
  useQuery({
    queryKey: ['notifications', 'admin', 'log'],
    queryFn: () => notificationAdminApi.getLog().then(r => r.data.data),
    retry: 1,
  });

export const useEmailTemplates = () =>
  useQuery({
    queryKey: ['notifications', 'admin', 'email-templates'],
    queryFn: () => notificationAdminApi.getEmailTemplates().then(r => r.data.data),
    retry: 1,
  });

export const useRegisterDevice = () =>
  useMutation({
    mutationFn: (data: Record<string, unknown>) => notificationAdminApi.registerDevice(data).then(r => r.data.data),
  });

// ─── Form Templates ───────────────────────────────────────────────────────────

export const useFormTemplates = (category?: string) =>
  useQuery({
    queryKey: ['form-templates', category],
    queryFn: () => formTemplateApi.getAll(category).then(r => r.data.data),
    retry: 1,
  });

export const useCreateFormTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => formTemplateApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['form-templates'] }),
  });
};

export const usePublishFormTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formTemplateApi.publish(id).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['form-templates'] }),
  });
};

export const useSubmitForm = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      formTemplateApi.submit(id, data).then(r => r.data.data),
  });

export const usePatientFormSubmissions = (patientId: string) =>
  useQuery({
    queryKey: ['form-templates', 'submissions', 'patient', patientId],
    queryFn: () => formTemplateApi.getSubmissions(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

// ─── Questionnaires ───────────────────────────────────────────────────────────

export const useQuestionnaires = () =>
  useQuery({
    queryKey: ['questionnaires'],
    queryFn: () => questionnaireApi.getAll().then(r => r.data.data),
    retry: 1,
  });

export const useCreateQuestionnaire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => questionnaireApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questionnaires'] }),
  });
};

export const useRespondToQuestionnaire = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      questionnaireApi.respond(id, data).then(r => r.data.data),
  });

export const usePatientQuestionnaireResponses = (patientId: string) =>
  useQuery({
    queryKey: ['questionnaires', 'patient', patientId, 'responses'],
    queryFn: () => questionnaireApi.getPatientResponses(patientId).then(r => r.data.data),
    enabled: !!patientId,
    retry: 1,
  });

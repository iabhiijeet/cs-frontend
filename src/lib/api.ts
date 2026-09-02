import type { OnboardingData } from "@/app/onboarding/_types/onboarding";

/**
 * Backend API base URL. Required in every environment — there is deliberately
 * NO hardcoded default so a missing NEXT_PUBLIC_API_URL fails loudly at
 * request time instead of silently targeting localhost in production.
 */
function apiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return url;
}

/**
 * Thrown when a request cannot be formed correctly because the frontend
 * foundation (universityId / reportingPeriodId) is not initialized.
 * Callers must NOT treat this as a backend failure (no demo fallback).
 */
export class ContextError extends Error {}

function getStoredId(key: string): string {
  return typeof window !== "undefined" ? localStorage.getItem(key) || "" : "";
}

/** Requires universityId; optionally also reportingPeriodId. */
export function requireContext(opts: { requirePeriod?: boolean } = {}): { uId: string; pId: string } {
  const uId = getStoredId("universityId");
  if (!uId) {
    throw new ContextError("Missing universityId context — sign in again to initialize your session.");
  }
  const pId = getStoredId("reportingPeriodId");
  if (opts.requirePeriod && !pId) {
    throw new ContextError("Missing reportingPeriodId context — no reporting period is selected.");
  }
  return { uId, pId };
}

/**
 * V2 backend error bodies use { success, error?, details?[] } or { success,
 * message }. Extract the most specific human-readable message available so
 * validation failures (e.g. "Activity date must be within reporting period")
 * reach the user instead of a generic status-code toast.
 */
function extractApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data;
  const payload = (data ?? {}) as {
    error?: unknown;
    message?: unknown;
    details?: unknown;
  };

  const parts: string[] = [];
  if (typeof payload.error === "string" && payload.error.trim()) {
    parts.push(payload.error);
  }
  if (Array.isArray(payload.details) && payload.details.length > 0) {
    const detailText = payload.details
      .map((item) => {
        const issue = (item ?? {}) as { field?: unknown; message?: unknown };
        const field = typeof issue.field === "string" ? issue.field : "";
        const message =
          typeof issue.message === "string" && issue.message.trim()
            ? issue.message
            : "is invalid";
        return field ? `${field}: ${message}` : message;
      })
      .filter(Boolean)
      .join("; ");
    if (detailText) parts.push(detailText);
  }
  if (parts.length === 0) {
    if (typeof payload.message === "string" && payload.message.trim()) {
      parts.push(payload.message);
    } else {
      parts.push(fallback);
    }
  }
  return parts.join(" | ");
}

/**
 * Core request helper. Returns the parsed body plus the HTTP status so
 * callers that need to distinguish statuses (e.g. onboarding 404 = "not
 * submitted yet") can do so without parsing error strings.
 */
async function requestJson(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${apiUrl()}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    return { ok: false, status: 503, data: { message: "Network error: Backend server is unreachable." } };
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }

  return { ok: response.ok, status: response.status, data };
}

/**
 * Standard API call: resolves with the parsed body or throws an Error whose
 * message carries the most specific backend-provided explanation.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const { ok, status, data } = await requestJson(endpoint, options);

  if (status === 401) {
    throw new Error(
      extractApiErrorMessage(data, "Session expired. Please log in again."),
    );
  }

  if (!ok) {
    throw new Error(
      extractApiErrorMessage(data, `API error: ${status}`),
    );
  }

  return data;
}



// Activity Data APIs
export async function getActivityData() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/activity-data${query}`);
}

export async function createActivityData(data: any) {
  const { uId, pId } = requireContext();
  return fetchAPI(`/activity-data`, {
    method: "POST",
    body: JSON.stringify({ ...data, universityId: uId, reportingPeriodId: data.reportingPeriodId || pId }),
  });
}

export async function updateActivityData(id: string, data: any) {
  // Live V2 requires universityId as a QUERY param on PATCH (verified).
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}?universityId=${uId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteActivityData(id: string) {
  // Live V2 requires universityId as a query param on DELETE (verified).
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}?universityId=${uId}`, {
    method: "DELETE",
  });
}

// Workflow transitions: live V2 requires universityId in the JSON body (verified).
export async function submitActivityData(id: string) {
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ universityId: uId }),
  });
}

export async function startReviewActivityData(id: string) {
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}/start-review`, {
    method: "POST",
    body: JSON.stringify({ universityId: uId }),
  });
}

export async function verifyActivityData(id: string) {
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}/verify`, {
    method: "POST",
    body: JSON.stringify({ universityId: uId }),
  });
}

export async function rejectActivityData(id: string, reason: string) {
  const { uId } = requireContext();
  return fetchAPI(`/activity-data/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, universityId: uId }),
  });
}

// ==========================================
// CALCULATIONS API
// ==========================================
export async function calculateEmissions(activityId: string) {
  return fetchAPI(`/calculations/activity/${activityId}`, { method: "POST" });
}

// ==========================================
// DASHBOARD API
// ==========================================
export async function getDashboardSummary(universityId?: string, reportingPeriodId?: string, campusId?: string, buildingId?: string, floorId?: string) {
  const { uId, pId } = requireContext();
  const effectiveUId = universityId || uId;
  const effectivePId = reportingPeriodId || pId;

  let url = `/dashboard/summary?universityId=${effectiveUId}`;
  if (effectivePId) url += `&reportingPeriodId=${effectivePId}`;
  if (campusId) url += `&campusId=${campusId}`;
  if (buildingId) url += `&buildingId=${buildingId}`;
  if (floorId) url += `&floorId=${floorId}`;
  return fetchAPI(url);
}

export async function getReviewActivities() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/activity-data/review${query}`);
}



// Import APIs
export async function downloadImportTemplate() {
  const { uId } = requireContext();
  // Return URL so user can open in new tab
  return `${apiUrl()}/activity-data/import/template?universityId=${uId}`;
}

export async function previewImport(file: File) {
  const { uId, pId } = requireContext({ requirePeriod: true });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("universityId", uId);
  formData.append("reportingPeriodId", pId);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiUrl()}/activity-data/import/preview`, {
    method: "POST",
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to preview import");
  }
  return res.json();
}

export async function confirmImport(jobId: string, validData: any[]) {
  const { uId, pId } = requireContext({ requirePeriod: true });
  return fetchAPI(`/activity-data/import/confirm`, {
    method: "POST",
    body: JSON.stringify({ jobId, universityId: uId, reportingPeriodId: pId, validData }),
  });
}

// Document APIs
export async function uploadDocument(file: File, documentType: string) {
  const { uId } = requireContext();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("universityId", uId);
  formData.append("documentType", documentType);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiUrl()}/documents/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload document");
  }
  return res.json();
}

export async function getDocuments() {
  const { uId } = requireContext();
  return fetchAPI(`/documents?universityId=${uId}`);
}

export async function ocrDocument(id: string) {
  return fetchAPI(`/documents/${id}/ocr`, { method: "POST" });
}

export async function createActivityFromDocument(id: string, data: any) {
  const { uId, pId } = requireContext();
  return fetchAPI(`/documents/${id}/create-activity`, {
    method: "POST",
    body: JSON.stringify({ ...data, universityId: uId, reportingPeriodId: data.reportingPeriodId || pId }),
  });
}

// Reporting Periods APIs
export async function getReportingPeriods() {
  const { uId } = requireContext();
  return fetchAPI(`/reporting-periods?universityId=${uId}`);
}

export async function createReportingPeriod(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/reporting-periods`, {
    method: "POST",
    body: JSON.stringify({ ...data, universityId: uId }),
  });
}

export async function openReportingPeriod(id: string) {
  return fetchAPI(`/reporting-periods/${id}/open`, { method: "POST" });
}

export async function lockReportingPeriod(id: string) {
  return fetchAPI(`/reporting-periods/${id}/lock`, { method: "POST" });
}

export async function setBaselineReportingPeriod(id: string) {
  return fetchAPI(`/reporting-periods/${id}/set-baseline`, { method: "POST" });
}



// Baselines APIs
export async function getBaselines() {
  const { uId } = requireContext();
  return fetchAPI(`/baselines?universityId=${uId}`);
}

export async function createBaseline(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/baselines`, {
    method: "POST",
    body: JSON.stringify({ ...data, universityId: uId })
  });
}

export async function lockBaseline(id: string) {
  return fetchAPI(`/baselines/${id}/lock`, { method: "POST" });
}

export async function approveBaseline(id: string) {
  return fetchAPI(`/baselines/${id}/approve`, { method: "POST" });
}

export async function getBaselineComparison(id: string) {
  return fetchAPI(`/baselines/${id}/comparison`);
}

// Targets APIs
export async function getTargets() {
  const { uId } = requireContext();
  return fetchAPI(`/targets?universityId=${uId}`);
}

export async function createTarget(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/targets`, {
    method: "POST",
    body: JSON.stringify({ ...data, universityId: uId })
  });
}

export async function getTargetProgress(targetId: string, reportingPeriodId: string) {
  return fetchAPI(`/targets/${targetId}/progress?reportingPeriodId=${reportingPeriodId}`);
}

// Emission Factors APIs
export async function getEmissionFactors() {
  const { uId } = requireContext();
  return fetchAPI(`/emission-factors?universityId=${uId}`);
}

// Admin Management APIs
export async function getCampuses() {
  const { uId } = requireContext();
  return fetchAPI(`/campuses?universityId=${uId}`);
}

export async function getBuildings() {
  const { uId } = requireContext();
  return fetchAPI(`/buildings?universityId=${uId}`);
}

export async function getFloors() {
  const { uId } = requireContext();
  return fetchAPI(`/floors?universityId=${uId}`);
}

export async function getAssets() {
  const { uId } = requireContext();
  return fetchAPI(`/assets?universityId=${uId}`);
}

// Data Quality APIs
export async function getDataQualityMetrics(filters?: {
  reportingPeriodId?: string;
  scope?: string;
  category?: string;
}) {
  const { uId, pId } = requireContext();
  const params = new URLSearchParams({ universityId: uId });
  if (filters?.reportingPeriodId) params.set("reportingPeriodId", filters.reportingPeriodId);
  else if (pId) params.set("reportingPeriodId", pId);
  if (filters?.scope) params.set("scope", filters.scope);
  if (filters?.category) params.set("category", filters.category);
  return fetchAPI(`/data-quality/metrics?${params.toString()}`);
}

// Recommendations APIs
export async function getRecommendations(filters?: {
  priority?: string;
  category?: string;
  status?: string;
}) {
  const { uId } = requireContext();
  const params = new URLSearchParams({ universityId: uId });
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  return fetchAPI(`/recommendations?${params.toString()}`);
}

export async function getRecommendationById(id: string) {
  return fetchAPI(`/recommendations/${id}`);
}

export async function updateRecommendationStatus(id: string, status: string) {
  return fetchAPI(`/recommendations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function generateRecommendations() {
  const { uId, pId } = requireContext({ requirePeriod: true });
  return fetchAPI(`/recommendations/generate`, {
    method: "POST",
    body: JSON.stringify({ universityId: uId, reportingPeriodId: pId }),
  });
}

// Notifications APIs
export async function getNotifications(filters?: { isRead?: boolean; type?: string }) {
  const uId = typeof window !== "undefined" ? localStorage.getItem("universityId") || "" : "";
  const params = new URLSearchParams({ universityId: uId });
  if (filters?.isRead !== undefined) params.set("isRead", String(filters.isRead));
  if (filters?.type) params.set("type", filters.type);
  return fetchAPI(`/notifications?${params.toString()}`);
}

export async function getUnreadNotificationsCount() {
  const uId = typeof window !== "undefined" ? localStorage.getItem("universityId") || "" : "";
  return fetchAPI(`/notifications/unread-count?universityId=${uId}`);
}

export async function markNotificationAsRead(id: string) {
  return fetchAPI(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsAsRead() {
  return fetchAPI(`/notifications/read-all`, { method: "PATCH" });
}

// Audit Logs APIs
export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const uId = typeof window !== "undefined" ? localStorage.getItem("universityId") || "" : "";
  const params = new URLSearchParams();
  if (uId) params.set("universityId", uId);
  
  if (filters?.userId) params.set("userId", filters.userId);
  if (filters?.action && filters.action !== "ALL") params.set("action", filters.action);
  if (filters?.entity && filters.entity !== "ALL") params.set("entity", filters.entity);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  
  return fetchAPI(`/audit-logs?${params.toString()}`);
}

// Admin / Users APIs
export async function getUsers() {
  return fetchAPI(`/users`);
}

export async function createUser(data: any) {
  return fetchAPI(`/users`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateUser(id: string, data: any) {
  return fetchAPI(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteUser(id: string) {
  return fetchAPI(`/users/${id}`, { method: "DELETE" });
}

// Admin / Campus & Building APIs
// V2 requires universityId in the create body (verified live).
export async function createCampus(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/campuses`, { method: "POST", body: JSON.stringify({ ...data, universityId: uId }) });
}
export async function createBuilding(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/buildings`, { method: "POST", body: JSON.stringify({ ...data, universityId: uId }) });
}

// Universities APIs
export async function getUniversity(id: string) {
  return fetchAPI(`/universities/${id}`);
}

export async function updateUniversity(id: string, data: any) {
  return fetchAPI(`/universities/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// ==========================================
// REPORTS API
// ==========================================
export async function generateReport() {
  const { uId, pId } = requireContext({ requirePeriod: true });
  return fetchAPI(`/reports/generate`, {
    method: "POST",
    body: JSON.stringify({ universityId: uId, reportingPeriodId: pId }),
  });
}

export async function getReports() {
  const { uId } = requireContext();
  return fetchAPI(`/reports?universityId=${uId}`);
}

export async function getReport(id: string) {
  return fetchAPI(`/reports/${id}`);
}

export async function generateReportPdf(id: string) {
  return fetchAPI(`/reports/${id}/generate-pdf`, { method: "POST" });
}

// Response puts `url` at the TOP LEVEL (not inside data) — see V2 doc rule 9.
export async function getReportDownloadUrl(id: string): Promise<string> {
  const res = await fetchAPI(`/reports/${id}/download`);
  if (!res.url) throw new Error(res.message || "Report download is not available yet.");
  return res.url;
}

// ==========================================
// DEMO AUTH API (V2 JWT backend)
// ==========================================
export interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  organisationId?: string | null;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
  message?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetchAPI(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return fetchAPI(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Onboarding ────────────────────────────────────────────────────────────
// The backend resolves the organisation from the authenticated user (JWT →
// users.organisation_id); no organisationId is ever sent or accepted here.

export interface OnboardingRecord {
  id: string;
  organisationId: string;
  company: OnboardingData["company"];
  university?: OnboardingData["university"];
  locations: OnboardingData["locations"];
  reporting: OnboardingData["reporting"];
  integrations: OnboardingData["integrations"];
  emissions: OnboardingData["emissions"];
  valueChain: OnboardingData["valueChain"];
  strategy: OnboardingData["strategy"];
  physicalHierarchy?: OnboardingData["physicalHierarchy"];
  intakeRaw?: OnboardingData["intakeRaw"];
  createdAt: string;
  updatedAt: string;
}

export type OnboardingStatusResult =
  | { kind: "completed"; record: OnboardingRecord }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

/** GET /onboarding — 404 means the organisation hasn't onboarded yet. */
export async function getOnboardingStatus(): Promise<OnboardingStatusResult> {
  try {
    const { status, data } = await requestJson(`/onboarding`);
    if (status === 200 && data?.data) {
      return { kind: "completed", record: data.data as OnboardingRecord };
    }
    if (status === 404) {
      return { kind: "not-found" };
    }
    if (status === 401) {
      return {
        kind: "error",
        message: extractApiErrorMessage(data, "Session expired. Please log in again."),
      };
    }
    return {
      kind: "error",
      message: extractApiErrorMessage(data, `Failed to check onboarding status (${status})`),
    };
  } catch (err) {
    return {
      kind: "error",
      message:
        err instanceof Error
          ? err.message
          : "Could not reach the server to check onboarding status.",
    };
  }
}

export type OnboardingSubmitResult =
  | { kind: "created"; record: OnboardingRecord }
  | { kind: "updated"; record: OnboardingRecord }
  | { kind: "conflict" }
  | { kind: "error"; message: string };

/** POST /onboarding — creates the profile; 409 when one already exists. */
export async function createOnboarding(
  payload: OnboardingData
): Promise<OnboardingSubmitResult> {
  const { status, data } = await requestJson(`/onboarding`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (status === 201 && data?.data) {
    return { kind: "created", record: data.data as OnboardingRecord };
  }
  if (status === 409) {
    return { kind: "conflict" };
  }
  if (status === 401) {
    return {
      kind: "error",
      message: extractApiErrorMessage(data, "Session expired. Please log in again."),
    };
  }
  return {
    kind: "error",
    message: extractApiErrorMessage(data, "Failed to save onboarding"),
  };
}

/** PUT /onboarding — replaces the existing profile (idempotent upsert). */
export async function updateOnboarding(
  payload: OnboardingData
): Promise<OnboardingSubmitResult> {
  const { status, data } = await requestJson(`/onboarding`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (status === 200 && data?.data) {
    return { kind: "updated", record: data.data as OnboardingRecord };
  }
  if (status === 401) {
    return {
      kind: "error",
      message: extractApiErrorMessage(data, "Session expired. Please log in again."),
    };
  }
  return {
    kind: "error",
    message: extractApiErrorMessage(data, "Failed to update onboarding"),
  };
}

// ==========================================
// NEWLY ADDED ENDPOINTS (MISSING V2)
// ==========================================

// Dashboard
export async function getDashboardOverview() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/overview${query}`);
}
export async function getDashboardScopeBreakdown() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/scope-breakdown${query}`);
}
export async function getDashboardCategories() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/categories${query}`);
}
export async function getDashboardTopSources() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/top-sources${query}`);
}
export async function getDashboardTrends() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/trends${query}`);
}
export async function getDashboardBuildings() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/buildings${query}`);
}
export async function getDashboardFloors() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/floors${query}`);
}
export async function getDashboardBaselineComparison() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/baseline-comparison${query}`);
}
export async function getDashboardIntensity() {
  const { uId, pId } = requireContext();
  const query = `?universityId=${uId}${pId ? `&reportingPeriodId=${pId}` : ""}`;
  return fetchAPI(`/dashboard/intensity${query}`);
}

// Physical Hierarchy
export async function getCampusById(id: string) {
  return fetchAPI(`/campuses/${id}`);
}
export async function updateCampus(id: string, data: any) {
  return fetchAPI(`/campuses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function getBuildingById(id: string) {
  return fetchAPI(`/buildings/${id}`);
}
export async function updateBuilding(id: string, data: any) {
  return fetchAPI(`/buildings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function createFloor(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/floors`, { method: "POST", body: JSON.stringify({ ...data, universityId: uId }) });
}
export async function getFloorById(id: string) {
  return fetchAPI(`/floors/${id}`);
}
export async function updateFloor(id: string, data: any) {
  return fetchAPI(`/floors/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// Emission Factors
export async function createEmissionFactor(data: any) {
  return fetchAPI(`/emission-factors`, { method: "POST", body: JSON.stringify(data) });
}
export async function matchEmissionFactor(data: any) {
  return fetchAPI(`/emission-factors/match`, { method: "POST", body: JSON.stringify(data) });
}
export async function importEmissionFactors(data: any) {
  return fetchAPI(`/emission-factors/import`, { method: "POST", body: JSON.stringify(data) });
}
export async function getPendingEfActivities() {
  return fetchAPI(`/emission-factors/pending`);
}
export async function getEmissionFactorById(id: string) {
  return fetchAPI(`/emission-factors/${id}`);
}
export async function updateEmissionFactor(id: string, data: any) {
  return fetchAPI(`/emission-factors/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deactivateEmissionFactor(id: string) {
  return fetchAPI(`/emission-factors/${id}`, { method: "DELETE" });
}

// Imports & Documents
export async function testStorageUpload(data: any) {
  return fetchAPI(`/imports/test`, { method: "POST", body: JSON.stringify(data) });
}
export async function getDocumentByActivity(activityId: string) {
  return fetchAPI(`/documents/activity/${activityId}`);
}
export async function getDocumentById(id: string) {
  return fetchAPI(`/documents/${id}`);
}
export async function deleteDocument(id: string) {
  return fetchAPI(`/documents/${id}`, { method: "DELETE" });
}

// Emissions
export async function calculateEmissionsBulk(data: any) {
  return fetchAPI(`/emissions/calculate`, { method: "POST", body: JSON.stringify(data) });
}

// University Statistics
export async function getUniversityStatistics() {
  const { uId } = requireContext();
  return fetchAPI(`/university-statistics?universityId=${uId}`);
}
export async function createUniversityStatistic(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/university-statistics`, { method: "POST", body: JSON.stringify({ ...data, universityId: uId }) });
}
export async function updateUniversityStatistic(id: string, data: any) {
  return fetchAPI(`/university-statistics/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteUniversityStatistic(id: string) {
  return fetchAPI(`/university-statistics/${id}`, { method: "DELETE" });
}

// Universities
export async function createUniversity(data: any) {
  return fetchAPI(`/universities`, { method: "POST", body: JSON.stringify(data) });
}
export async function getUniversities() {
  return fetchAPI(`/universities`);
}

// Taxonomy
export async function importTaxonomy(data: any) {
  return fetchAPI(`/taxonomy/import`, { method: "POST", body: JSON.stringify(data) });
}

// Assets
export async function createAsset(data: any) {
  const { uId } = requireContext();
  return fetchAPI(`/assets`, { method: "POST", body: JSON.stringify({ ...data, universityId: uId }) });
}
export async function updateAsset(id: string, data: any) {
  return fetchAPI(`/assets/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function getAssetById(id: string) {
  return fetchAPI(`/assets/${id}`);
}

// Reset Activity Data
export async function resetActivityData(id: string) {
  return fetchAPI(`/activity-data/${id}/reset`, { method: "POST" });
}

// Baseline
export async function getBaselineById(id: string) {
  return fetchAPI(`/baselines/${id}`);
}
export async function submitBaseline(id: string) {
  return fetchAPI(`/baselines/${id}/submit`, { method: "POST" });
}

// 백엔드(NestJS) 주소. frontend/.env.local의 NEXT_PUBLIC_API_URL에서 읽는다.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface Activity {
  id: number;
  name: string;
  capacity: number;
  description: string;
}

export interface Schedule {
  id: number;
  activityId: number;
  activityName: string;
  activityDescription: string;
  capacity: number;
  date: string;
  startTime: string;
  endTime: string;
  place: string;
  supplies: string;
  notes: string;
  givesCertificate: boolean;
  appliedCount: number;
  remaining: number;
  isPast: boolean;
  canApply: boolean;
  cancelDeadline: string;
  canCancelAfterApply: boolean;
}

export interface MyApplication {
  id: number;
  status: "applied" | "cancelled";
  createdAt: string;
  cancelledAt: string | null;
  scheduleId: number;
  date: string;
  startTime: string;
  endTime: string;
  place: string;
  activityName: string;
  cancelDeadline: string;
  canCancel: boolean;
  /** 봉사 날짜가 속한 주의 일요일 */
  weekStart: string;
}

/** 화면에서 고를 수 있는 주 (일~토) */
export interface Week {
  start: string;
  end: string;
}

export interface WeekWithAvailability extends Week {
  availableCount: number;
}

export interface WeekUsage extends Week {
  used: number;
  remaining: number;
}

export interface LookupResult {
  found: boolean;
  weeks: WeekUsage[];
  applications: MyApplication[];
}

export interface MonthlyStats {
  month: string;
  applicationCount: number;
  volunteerCount: number;
  popularActivity: { name: string; count: number } | null;
  topVolunteer: { name: string; count: number } | null;
}

export class ApiError extends Error {}

/** 백엔드를 부르고, 실패하면 서버가 보낸 안내 문구를 담은 ApiError를 던진다. */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(message || "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "알 수 없는 문제가 생겼어요.";
}

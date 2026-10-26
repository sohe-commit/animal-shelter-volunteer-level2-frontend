const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 2026-10-27 → 10월 27일 (화) */
export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WEEKDAYS[d.getUTCDay()]})`;
}

/** 2026-10-25 → 10/25 */
export function formatShortDate(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
}

/** 주 목록에서 몇 번째 주인지에 따라: 이번 주 / 다음 주 / 2주 뒤 */
export function weekLabel(index: number): string {
  if (index === 0) return "이번 주";
  if (index === 1) return "다음 주";
  return `${index}주 뒤`;
}

/** 전화번호를 입력하는 대로 하이픈을 넣는다: 01012345678 → 010-1234-5678 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 서버가 준 시각을 한국 시간으로: 10월 28일 (수) 낮 12:00 */
export function formatDateTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayPeriod = get("dayPeriod") === "오후" && get("hour") === "12" ? "낮" : get("dayPeriod");
  return `${get("month")}월 ${get("day")}일 (${get("weekday")}) ${dayPeriod} ${get("hour")}:${get("minute")}`;
}

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 활동마다 다른 색 */
export const ACTIVITY_COLORS: Record<string, string> = {
  산책: "bg-emerald-100 text-emerald-800",
  청소: "bg-sky-100 text-sky-800",
  목욕: "bg-cyan-100 text-cyan-800",
  미용: "bg-pink-100 text-pink-800",
  사진: "bg-amber-100 text-amber-800",
};

export function activityColor(name: string): string {
  return ACTIVITY_COLORS[name] ?? "bg-stone-100 text-stone-800";
}

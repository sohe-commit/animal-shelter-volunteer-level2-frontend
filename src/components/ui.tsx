import type { ReactNode } from "react";
import { activityColor, activityEmoji } from "@/lib/format";

export function PageTitle({ title, description, eyebrow }: { title: string; description?: string; eyebrow?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="mb-2 text-sm font-bold tracking-wide text-brand-600">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">{title}</h1>
      {description && <p className="mt-2 text-stone-600">{description}</p>}
    </div>
  );
}

export function ActivityBadge({ name }: { name: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${activityColor(name)}`}>
      <span aria-hidden="true">{activityEmoji(name)}</span>
      {name}
    </span>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success" | "info" | "warning"; children: ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-stone-200 bg-stone-50 text-stone-700",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-stone-800">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

/** 모집 인원 막대: 신청 수 / 정원 */
export function CapacityBar({ applied, capacity, muted }: { applied: number; capacity: number; muted?: boolean }) {
  const ratio = Math.min(1, applied / capacity);
  const color = muted ? "bg-stone-400" : ratio >= 1 ? "bg-stone-400" : ratio >= 0.5 ? "bg-brand-500" : "bg-emerald-500";
  return (
    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(ratio * 100, 4)}%` }} />
    </div>
  );
}

/** 흰 카드 */
export const cardClass = "rounded-3xl border border-stone-200/70 bg-white shadow-[0_2px_20px_-8px_rgba(120,72,40,0.15)]";

export const inputClass =
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50";

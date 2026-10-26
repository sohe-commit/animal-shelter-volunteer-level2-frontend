import type { ReactNode } from "react";
import { activityColor } from "@/lib/format";

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
      {description && <p className="mt-1 text-stone-600">{description}</p>}
    </div>
  );
}

export function ActivityBadge({ name }: { name: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${activityColor(name)}`}>
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
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-stone-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export const buttonClass =
  "inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50";

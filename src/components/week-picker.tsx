import type { Week } from "@/lib/api";
import { formatShortDate, weekLabel } from "@/lib/format";

/** 신청 횟수를 세는 단위인 주(일~토)로만 고를 수 있는 버튼 묶음. value가 ""이면 "전체" */
export function WeekPicker<W extends Week>({
  weeks,
  value,
  onChange,
  detail,
  allLabel = "전체",
}: {
  weeks: W[];
  value: string;
  onChange: (start: string) => void;
  /** 버튼 옆 작은 표시 (예: "12개 가능") */
  detail?: (week: W) => string;
  allLabel?: string;
}) {
  const options = [
    { key: "", label: allLabel, extra: "" },
    ...weeks.map((week, index) => ({
      key: week.start,
      label: `${weekLabel(index)} (${formatShortDate(week.start)}~${formatShortDate(week.end)})`,
      extra: detail?.(week) ?? "",
    })),
  ];
  return (
    <div role="group" aria-label="주 고르기" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <button
            key={option.key || "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selected
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-stone-200 bg-white text-stone-600 hover:border-brand-200 hover:text-stone-900"
            }`}
          >
            {option.label}
            {option.extra && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  selected ? "bg-white/20 text-white" : "bg-amber-50 text-amber-800"
                }`}
              >
                {option.extra}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

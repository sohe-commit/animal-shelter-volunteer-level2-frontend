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
  // 주가 많아도 한 줄로 두고 옆으로 넘겨 본다. 고른 주는 보이는 곳으로 끌어온다.
  return (
    <div
      role="group"
      aria-label="주 고르기 (옆으로 넘겨 더 보기)"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0"
    >
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <button
            key={option.key || "all"}
            type="button"
            aria-pressed={selected}
            onClick={(e) => {
              onChange(option.key);
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
            className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
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

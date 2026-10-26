import type { Week } from "@/lib/api";
import { formatShortDate, weekLabel } from "@/lib/format";

/** 신청 횟수를 세는 단위인 주(일~토)로만 고를 수 있는 버튼 묶음. value가 ""이면 "전체" */
export function WeekPicker<W extends Week>({
  weeks,
  value,
  onChange,
  detail,
}: {
  weeks: W[];
  value: string;
  onChange: (start: string) => void;
  /** 버튼 아래 작은 글씨 (예: "신청 가능 12개") */
  detail?: (week: W) => string;
}) {
  const options = [
    { key: "", label: "전체", sub: "모든 주", extra: "" },
    ...weeks.map((week, index) => ({
      key: week.start,
      label: weekLabel(index),
      sub: `${formatShortDate(week.start)}~${formatShortDate(week.end)}`,
      extra: detail?.(week) ?? "",
    })),
  ];
  return (
    <div role="group" aria-label="주 고르기" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.key;
        const subClass = `text-xs ${selected ? "text-orange-100" : "text-stone-500"}`;
        return (
          <button
            key={option.key || "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            className={`flex min-w-24 flex-col items-center rounded-lg border px-3 py-2 text-sm transition ${
              selected
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-orange-300 hover:bg-orange-50"
            }`}
          >
            <span className="font-semibold">{option.label}</span>
            <span className={subClass}>{option.sub}</span>
            {detail && <span className={subClass}>{option.extra || " "}</span>}
          </button>
        );
      })}
    </div>
  );
}

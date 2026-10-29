"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Field, Notice, PageTitle, inputClass } from "@/components/ui";
import { api, errorMessage, type MonthlyStats } from "@/lib/api";
import { todayKst } from "@/lib/format";

export default function StatsView() {
  const [month, setMonth] = useState(todayKst().slice(0, 7));
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api<MonthlyStats>(`/stats/monthly?month=${month}`)
      .then((data) => {
        if (ignore) return;
        setStats(data);
        setError("");
      })
      .catch((e) => {
        if (ignore) return;
        setStats(null);
        setError(errorMessage(e));
      });
    return () => {
      ignore = true;
    };
  }, [month]);

  const monthLabel = `${Number(month.slice(5, 7))}월`;

  return (
    <>
      <PageTitle title="이번 달 현황" description="봉사 날짜가 그 달에 있는 신청만 세요. 취소한 신청은 세지 않아요." />

      <div className="mb-6 max-w-xs">
        <Field label="월 고르기">
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className={inputClass} />
        </Field>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={`${monthLabel} 신청 수`} value={`${stats.applicationCount}건`} />
          <StatCard label={`${monthLabel} 봉사자 수`} value={`${stats.volunteerCount}명`} />
          <StatCard
            label="가장 인기 있는 활동"
            value={stats.popularActivity?.name ?? "없음"}
            sub={stats.popularActivity && `신청 ${stats.popularActivity.count}건`}
          />
          <StatCard
            label="가장 활동적인 봉사자"
            value={stats.topVolunteer?.name ?? "없음"}
            sub={stats.topVolunteer && `신청 ${stats.topVolunteer.count}건 · 이름 일부를 가렸어요`}
            extra
          />
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, sub, extra }: { label: string; value: string; sub?: ReactNode; extra?: boolean }) {
  return (
    <div className="rounded-3xl border border-stone-200/70 bg-white shadow-[0_2px_20px_-8px_rgba(120,72,40,0.15)] p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-stone-500">
        {label}
        {extra && <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">추가</span>}
      </p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-stone-500">{sub}</p>}
    </div>
  );
}

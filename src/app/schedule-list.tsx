"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityBadge, Field, Notice, inputClass, secondaryButtonClass } from "@/components/ui";
import { api, errorMessage, type Activity, type Schedule } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function ScheduleList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [date, setDate] = useState("");
  const [activityId, setActivityId] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    api<Activity[]>("/activities").then(setActivities).catch(() => setActivities([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (activityId) params.set("activityId", activityId);
    if (availableOnly) params.set("available", "true");
    let ignore = false;
    api<Schedule[]>(`/schedules?${params}`)
      .then((rows) => {
        if (ignore) return;
        setSchedules(rows);
        setError("");
      })
      .catch((e) => {
        if (ignore) return;
        setSchedules([]);
        setError(errorMessage(e));
      });
    return () => {
      ignore = true;
    };
  }, [date, activityId, availableOnly, reloadKey]);

  const resetFilters = () => {
    setDate("");
    setActivityId("");
    setAvailableOnly(false);
  };

  const groups = new Map<string, Schedule[]>();
  for (const schedule of schedules ?? []) {
    groups.set(schedule.date, [...(groups.get(schedule.date) ?? []), schedule]);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <Field label="날짜">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="활동 종류">
          <select value={activityId} onChange={(e) => setActivityId(e.target.value)} className={inputClass}>
            <option value="">전체</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (하루 {a.capacity}명)
              </option>
            ))}
          </select>
        </Field>
        <label className="flex cursor-pointer items-center gap-2 py-2.5 text-sm font-semibold text-stone-800">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          신청 가능한 것만 보기
        </label>
        <button type="button" onClick={resetFilters} className={secondaryButtonClass}>
          조건 지우기
        </button>
      </section>

      {error && (
        <Notice tone="error">
          {error}{" "}
          <button type="button" className="font-semibold underline" onClick={() => setReloadKey((k) => k + 1)}>
            다시 불러오기
          </button>
        </Notice>
      )}

      {schedules === null ? (
        <p className="text-stone-500">일정을 불러오는 중이에요…</p>
      ) : schedules.length === 0 && !error ? (
        <Notice tone="info">조건에 맞는 일정이 없어요. 다른 날짜나 활동을 골라 보세요.</Notice>
      ) : (
        [...groups.entries()].map(([day, rows]) => (
          <section key={day}>
            <h2 className="mb-3 text-lg font-bold text-stone-800">{formatDate(day)}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((s) => (
                <li key={s.id}>
                  <ScheduleCard schedule={s} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function ScheduleCard({ schedule: s }: { schedule: Schedule }) {
  const full = s.remaining === 0;
  const status = s.isPast ? "신청 마감" : full ? "정원 마감" : `${s.remaining}자리 남음`;
  const statusClass = s.isPast || full ? "text-stone-500" : "text-orange-700";
  return (
    <Link
      href={`/schedules/${s.id}`}
      className="block h-full rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <ActivityBadge name={s.activityName} />
        <span className={`text-sm font-bold ${statusClass}`}>{status}</span>
      </div>
      <p className="mt-3 text-sm text-stone-600">
        {s.startTime}~{s.endTime} · {s.place}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className={`h-full rounded-full ${full ? "bg-stone-400" : "bg-orange-500"}`}
            style={{ width: `${(s.appliedCount / s.capacity) * 100}%` }}
          />
        </div>
        <span className="text-xs text-stone-500">
          {s.appliedCount}/{s.capacity}명
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";
import { api, errorMessage, type Activity, type Schedule } from "@/lib/api";
import { addDays, todayKst } from "@/lib/format";

/** 일정 등록·수정 폼. schedule을 주면 그 일정을 고치는 폼이 된다. */
export function ScheduleForm({ schedule }: { schedule?: Schedule }) {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({
    activityId: schedule ? String(schedule.activityId) : "",
    date: schedule?.date ?? addDays(todayKst(), 1),
    startTime: schedule?.startTime ?? "10:00",
    endTime: schedule?.endTime ?? "14:00",
    place: schedule?.place ?? "",
    supplies: schedule?.supplies ?? "",
    notes: schedule?.notes ?? "",
    givesCertificate: schedule?.givesCertificate ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // R8: 신청자가 있으면 날짜와 활동은 바꿀 수 없다.
  const locked = (schedule?.appliedCount ?? 0) > 0;

  useEffect(() => {
    api<Activity[]>("/activities")
      .then(setActivities)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const saved = await api<Schedule>(schedule ? `/schedules/${schedule.id}` : "/schedules", {
        method: schedule ? "PUT" : "POST",
        body: { ...form, activityId: form.activityId ? Number(form.activityId) : undefined },
      });
      router.push(`/schedules/${saved.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl space-y-5 rounded-3xl border border-stone-200/70 bg-white shadow-[0_2px_20px_-8px_rgba(120,72,40,0.15)] p-6">
      {locked && (
        <Notice tone="info">
          신청자가 {schedule?.appliedCount}명 있어서 날짜와 활동은 바꿀 수 없어요. 신청자의 &lsquo;한 주 2번&rsquo;, &lsquo;하루 한 번&rsquo; 규칙이
          꼬이지 않게 하기 위해서예요.
        </Notice>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="활동 종류">
          <select
            value={form.activityId}
            onChange={(e) => update("activityId", e.target.value)}
            disabled={locked}
            className={`${inputClass} disabled:bg-stone-100`}
          >
            <option value="">골라 주세요</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (정원 {a.capacity}명)
              </option>
            ))}
          </select>
        </Field>
        <Field label="날짜">
          <input
            type="date"
            value={form.date}
            min={todayKst()}
            onChange={(e) => update("date", e.target.value)}
            disabled={locked}
            className={`${inputClass} disabled:bg-stone-100`}
          />
        </Field>
        <Field label="시작 시간">
          <input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} className={inputClass} />
        </Field>
        <Field label="끝나는 시간" hint="봉사는 보통 4시간이에요.">
          <input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="장소">
        <input value={form.place} onChange={(e) => update("place", e.target.value)} className={inputClass} placeholder="보호소 2동 견사" />
      </Field>
      <Field label="준비물 (선택)">
        <input value={form.supplies} onChange={(e) => update("supplies", e.target.value)} className={inputClass} placeholder="편한 운동화, 물" />
      </Field>
      <Field label="주의사항 (선택)">
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass} min-h-24`}
          placeholder="대형견은 2인 1조로 산책해요."
        />
      </Field>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-stone-800">봉사 인정 증서</legend>
        <div className="flex gap-6 text-stone-800">
          <label className="flex items-center gap-2">
            <input type="radio" checked={form.givesCertificate} onChange={() => update("givesCertificate", true)} className="accent-brand-600" />
            드려요
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={!form.givesCertificate} onChange={() => update("givesCertificate", false)} className="accent-brand-600" />
            드리지 않아요
          </label>
        </div>
      </fieldset>

      {error && <Notice tone="error">{error}</Notice>}

      <button type="submit" disabled={submitting} className={buttonClass}>
        {schedule ? (submitting ? "고치는 중…" : "고친 내용 저장하기") : submitting ? "등록하는 중…" : "일정 등록하기"}
      </button>
    </form>
  );
}

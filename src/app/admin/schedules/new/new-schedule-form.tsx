"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Field, Notice, PageTitle, buttonClass, inputClass } from "@/components/ui";
import { api, errorMessage, type Activity, type Schedule } from "@/lib/api";
import { addDays, todayKst } from "@/lib/format";

export default function NewScheduleForm() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({
    activityId: "",
    date: addDays(todayKst(), 1),
    startTime: "10:00",
    endTime: "14:00",
    place: "",
    supplies: "",
    notes: "",
    givesCertificate: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const created = await api<Schedule>("/schedules", {
        method: "POST",
        body: { ...form, activityId: form.activityId ? Number(form.activityId) : undefined },
      });
      router.push(`/schedules/${created.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle title="봉사 일정 등록" description="같은 날짜에 같은 활동은 하나만 등록할 수 있어요. 정원은 활동마다 정해져 있어요." />

      <form onSubmit={submit} noValidate className="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="활동 종류">
            <select value={form.activityId} onChange={(e) => update("activityId", e.target.value)} className={inputClass}>
              <option value="">골라 주세요</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (정원 {a.capacity}명)
                </option>
              ))}
            </select>
          </Field>
          <Field label="날짜">
            <input type="date" value={form.date} min={todayKst()} onChange={(e) => update("date", e.target.value)} className={inputClass} />
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
              <input type="radio" checked={form.givesCertificate} onChange={() => update("givesCertificate", true)} className="accent-orange-600" />
              드려요
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!form.givesCertificate} onChange={() => update("givesCertificate", false)} className="accent-orange-600" />
              드리지 않아요
            </label>
          </div>
        </fieldset>

        {error && <Notice tone="error">{error}</Notice>}

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "등록하는 중…" : "일정 등록하기"}
        </button>
      </form>
    </>
  );
}

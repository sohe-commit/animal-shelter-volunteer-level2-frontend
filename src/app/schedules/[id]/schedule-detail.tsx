"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ActivityBadge, Field, Notice, buttonClass, inputClass } from "@/components/ui";
import { api, errorMessage, type Schedule } from "@/lib/api";
import { formatDate, formatDateTime, formatPhoneInput } from "@/lib/format";

export default function ScheduleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    api<Schedule>(`/schedules/${id}`)
      .then((s) => {
        setSchedule(s);
        setLoadError("");
      })
      .catch((e) => setLoadError(errorMessage(e)));
  }, [id]);

  useEffect(load, [load]);

  if (loadError) {
    return (
      <div className="space-y-4">
        <Notice tone="error">{loadError}</Notice>
        <Link href="/" className="font-semibold text-orange-700 underline">
          ← 봉사 일정으로 돌아가기
        </Link>
      </div>
    );
  }
  if (!schedule) return <p className="text-stone-500">일정을 불러오는 중이에요…</p>;

  const s = schedule;
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-stone-600 hover:text-orange-700">
        ← 봉사 일정
      </Link>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <ActivityBadge name={s.activityName} />
            <h1 className="text-2xl font-bold text-stone-900">{formatDate(s.date)}</h1>
          </div>
          <p className="mt-2 text-stone-600">{s.activityDescription}</p>

          <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-[auto_1fr]">
            <Info label="시간">
              {s.startTime} ~ {s.endTime}
            </Info>
            <Info label="장소">{s.place}</Info>
            <Info label="정원">
              {s.capacity}명 중 <b>{s.appliedCount}명</b> 신청 ·{" "}
              <b className={s.remaining > 0 ? "text-orange-700" : "text-stone-500"}>{s.remaining}자리 남음</b>
            </Info>
            <Info label="준비물">{s.supplies || "없음"}</Info>
            <Info label="주의사항">{s.notes || "없음"}</Info>
            <Info label="봉사 인정 증서">{s.givesCertificate ? "드려요" : "드리지 않아요"}</Info>
            <Info label="취소 마감">{formatDateTime(s.cancelDeadline)}까지</Info>
          </dl>
        </section>

        <ApplyForm schedule={s} onApplied={load} />
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-sm font-semibold text-stone-500">{label}</dt>
      <dd className="whitespace-pre-line text-stone-900">{children}</dd>
    </>
  );
}

function ApplyForm({ schedule: s, onApplied }: { schedule: Schedule; onApplied: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await api<{ message: string }>(`/schedules/${s.id}/applications`, {
        method: "POST",
        body: { name, phone, isMinor },
      });
      setSuccess(result.message);
      onApplied();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="h-fit rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-bold text-stone-900">봉사 신청하기</h2>

      {s.isPast ? (
        <div className="mt-4">
          <Notice tone="info">이미 지난 일정이라 신청할 수 없어요. 내일 이후의 일정을 골라 주세요.</Notice>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          {s.remaining === 0 && <Notice tone="warning">정원이 다 찼어요. 다른 날짜를 골라 보세요.</Notice>}
          {!s.canCancelAfterApply && s.remaining > 0 && (
            <Notice tone="warning">
              취소 마감({formatDateTime(s.cancelDeadline)})이 지났어요. 이 일정은 신청한 뒤에 취소할 수 없어요.
            </Notice>
          )}
          <Field label="이름">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="김봉사" autoComplete="off" />
          </Field>
          <Field label="전화번호" hint="이름과 전화번호로 내 신청을 찾고 취소할 수 있어요.">
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className={inputClass}
              placeholder="010-1234-5678"
              inputMode="numeric"
              maxLength={13}
              autoComplete="off"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-stone-800">
            <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="h-4 w-4 accent-orange-600" />
            미성년자예요 (만 19세 미만)
          </label>

          {error && <Notice tone="error">{error}</Notice>}
          {success && (
            <Notice tone="success">
              {success}{" "}
              <Link href="/my" className="font-semibold underline">
                내 신청 보기
              </Link>
            </Notice>
          )}

          <button type="submit" disabled={submitting || s.remaining === 0} className={`${buttonClass} w-full`}>
            {submitting ? "신청하는 중…" : "신청하기"}
          </button>
        </form>
      )}
    </section>
  );
}

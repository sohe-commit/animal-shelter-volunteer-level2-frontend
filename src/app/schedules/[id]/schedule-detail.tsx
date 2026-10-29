"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BagIcon,
  ClockIcon,
  PhoneIcon,
  PinIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { ActivityBadge, CapacityBar, Notice, cardClass, inputClass } from "@/components/ui";
import { api, errorMessage, type Schedule } from "@/lib/api";
import { MINOR_NOTICE, formatDate, formatDateTime, formatPhoneInput, serviceHours } from "@/lib/format";
import { useIsStaff } from "@/lib/staff";
import { StaffPanel } from "./staff-panel";

export default function ScheduleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loadError, setLoadError] = useState("");
  const isStaff = useIsStaff();

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
        <Link href="/" className="font-semibold text-brand-700 underline">
          ← 봉사 일정으로 돌아가기
        </Link>
      </div>
    );
  }
  if (!schedule) return <p className="text-stone-500">일정을 불러오는 중이에요…</p>;

  const s = schedule;
  const hours = serviceHours(s.startTime, s.endTime);
  return (
    <div className="space-y-6">
      <nav aria-label="현재 위치" className="flex items-center gap-2 text-sm">
        <Link href="/" className="font-semibold text-stone-500 hover:text-brand-700">
          봉사 일정
        </Link>
        <span className="text-stone-300">›</span>
        <span className="font-semibold text-brand-700">
          {formatDate(s.date)} {s.activityName} 봉사
        </span>
      </nav>

      {s.isCancelled && (
        <Notice tone="warning">
          <b>담당자가 취소한 일정이에요.</b> {s.cancelReason && <>취소 사유: {s.cancelReason}</>}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <section className={`${cardClass} p-6 sm:p-8`}>
          <div className="flex flex-wrap items-center gap-2">
            <ActivityBadge name={s.activityName} />
            {s.givesCertificate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                <BadgeCheckIcon className="h-3.5 w-3.5" /> 봉사 인정 {hours}시간
              </span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{s.activityName} 봉사</h1>
          <p className="mt-2 leading-relaxed text-stone-600">{s.activityDescription}</p>

          <div className="mt-6 rounded-2xl bg-stone-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <UsersIcon /> 모집 인원
              </span>
              <span className={s.remaining > 0 ? "text-brand-700" : "text-stone-500"}>
                {s.appliedCount}명 신청 / 정원 {s.capacity}명
              </span>
            </div>
            <CapacityBar applied={s.appliedCount} capacity={s.capacity} muted={!s.canApply} />
            <p className="mt-2 text-xs text-stone-500">
              {s.remaining > 0 ? `${s.remaining}자리 남았어요. 정원이 차면 신청이 마감돼요.` : "정원이 다 찼어요."}
            </p>
          </div>

          <h2 className="mt-8 text-lg font-bold text-stone-900">봉사 활동 안내</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoTile icon={<ClockIcon className="h-5 w-5" />} label="봉사 날짜·시간">
              <p className="font-bold text-stone-900">{formatDate(s.date)}</p>
              <p className="text-sm font-semibold text-brand-700">
                {s.startTime} ~ {s.endTime} (총 {hours}시간)
              </p>
            </InfoTile>
            <InfoTile icon={<PinIcon className="h-5 w-5" />} label="모이는 곳">
              <p className="font-bold text-stone-900">{s.place}</p>
            </InfoTile>
            <InfoTile icon={<BadgeCheckIcon className="h-5 w-5" />} label="봉사 인정 증서">
              <p className="font-bold text-stone-900">{s.givesCertificate ? "드려요" : "드리지 않아요"}</p>
              {s.givesCertificate && <p className="text-sm text-stone-500">봉사가 끝나면 내 신청 찾기에서 볼 수 있어요</p>}
            </InfoTile>
            <InfoTile icon={<AlertIcon className="h-5 w-5" />} label="취소 마감">
              <p className="font-bold text-stone-900">{formatDateTime(s.cancelDeadline)}까지</p>
            </InfoTile>
          </div>

          <div className="mt-4 space-y-4 rounded-2xl bg-stone-50 p-5">
            <div>
              <p className="flex items-center gap-1.5 font-bold text-stone-900">
                <BagIcon /> 준비물
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-600">{s.supplies || "따로 없어요."}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-bold text-red-700">
                <AlertIcon /> 주의사항
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-600">{s.notes || "따로 없어요."}</p>
            </div>
          </div>
        </section>

        <ApplyForm schedule={s} onApplied={load} />
      </div>

      {isStaff && <StaffPanel schedule={s} onChanged={load} />}
    </div>
  );
}

function InfoTile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-stone-100 bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-500">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ApplyForm({ schedule: s, onApplied }: { schedule: Schedule; onApplied: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successIsMinor, setSuccessIsMinor] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await api<{ message: string; isMinor: boolean }>(`/schedules/${s.id}/applications`, {
        method: "POST",
        body: { name, phone, isMinor },
      });
      setSuccess(result.message);
      setSuccessIsMinor(result.isMinor);
      onApplied();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={`${cardClass} h-fit p-6 sm:p-7 lg:sticky lg:top-24`}>
      <p className="flex items-center gap-1.5 text-sm font-bold text-brand-700">
        <span className={`h-2 w-2 rounded-full ${s.canApply ? "bg-brand-600" : "bg-stone-400"}`} />
        {s.canApply ? "로그인 없이 바로 신청" : "신청할 수 없는 일정"}
      </p>
      <h2 className="mt-2 text-xl font-bold text-stone-900">봉사 신청서</h2>
      <p className="mt-1 text-sm leading-relaxed text-stone-500">이름과 전화번호만 적으면 신청돼요. 같은 정보로 내 신청을 찾고 취소할 수 있어요.</p>

      {s.isCancelled ? (
        <div className="mt-5">
          <Notice tone="info">담당자가 취소한 일정이라 신청할 수 없어요. 다른 일정을 골라 주세요.</Notice>
        </div>
      ) : s.isPast ? (
        <div className="mt-5">
          <Notice tone="info">이미 지난 일정이라 신청할 수 없어요. 내일 이후의 일정을 골라 주세요.</Notice>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {s.remaining === 0 && <Notice tone="warning">정원이 다 찼어요. 다른 날짜를 골라 보세요.</Notice>}
          {!s.canCancelAfterApply && s.remaining > 0 && (
            <Notice tone="warning">
              취소 마감({formatDateTime(s.cancelDeadline)})이 지났어요. 이 일정은 신청한 뒤에 취소할 수 없어요.
            </Notice>
          )}
          <IconField label="이름" icon={<UserIcon />}>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pr-11`} placeholder="예: 김봉사" autoComplete="off" />
          </IconField>
          <IconField label="전화번호" icon={<PhoneIcon />} hint="숫자만 넣어도 010-1234-5678처럼 '-'가 자동으로 들어가요.">
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className={`${inputClass} pr-11`}
              placeholder="010-0000-0000"
              inputMode="numeric"
              maxLength={13}
              autoComplete="off"
            />
          </IconField>
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="mt-0.5 h-5 w-5 accent-brand-600" />
            <span>
              <span className="block font-bold text-stone-900">만 19세 미만 미성년자예요</span>
              <span className="block text-xs text-stone-500">봉사하는 날 보호자 동의서가 필요해요.</span>
            </span>
          </label>
          {isMinor && !success && <Notice tone="warning">{MINOR_NOTICE}</Notice>}

          <div className="rounded-2xl bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-950">
            <p className="flex items-center gap-1.5 font-bold">
              <BadgeCheckIcon /> 신청 규칙
            </p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-amber-900/90">
              <li>
                <b>신청 횟수:</b> 한 주(일~토)에 2번까지
              </li>
              <li>
                <b>취소 마감:</b> 봉사 전날 낮 12시까지
              </li>
              <li>
                <b>하루 한 번:</b> 같은 날 다른 활동은 신청할 수 없어요
              </li>
            </ul>
          </div>

          {error && <Notice tone="error">{error}</Notice>}
          {success && (
            <Notice tone="success">
              {success}{" "}
              <Link href="/my" className="font-semibold underline">
                내 신청 보기
              </Link>
            </Notice>
          )}
          {success && successIsMinor && <Notice tone="warning">{MINOR_NOTICE}</Notice>}

          <button
            type="submit"
            disabled={submitting || s.remaining === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            {submitting ? (
              "신청하는 중…"
            ) : (
              <>
                봉사 신청하기
                {s.remaining > 0 && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{s.remaining}자리 남음</span>}
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
}

function IconField({ label, icon, hint, children }: { label: string; icon: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-stone-800">
        {label} <span className="text-brand-600">*</span>
      </span>
      <span className="relative block">
        {children}
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
      </span>
      {hint && <span className="mt-1.5 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Certificate } from "@/components/certificate";
import { AlertIcon, ArrowRightIcon, BadgeCheckIcon, CalendarIcon, ClockIcon, HeartIcon, PhoneIcon, PinIcon, SearchIcon, UserIcon } from "@/components/icons";
import { ActivityBadge, Notice, PageTitle, cardClass, inputClass, secondaryButtonClass } from "@/components/ui";
import { WeekPicker } from "@/components/week-picker";
import { api, errorMessage, type LookupResult, type MyApplication } from "@/lib/api";
import {
  MINOR_NOTICE,
  dDay,
  formatDate,
  formatDateTime,
  formatPhoneInput,
  formatShortDate,
  serviceHours,
  todayKst,
  weekLabel,
} from "@/lib/format";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MyApplicationsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // 취소할 때도 신청자 확인(R6)에 쓰도록, 조회에 성공한 이름과 전화번호를 기억해 둔다.
  const [identity, setIdentity] = useState<{ name: string; phone: string } | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  // 보고 있는 주(일요일 날짜). ""이면 전체. 처음 찾으면 이번 주를 보여 준다.
  const [week, setWeek] = useState("");
  // 월별 기록에서 보고 있는 달 (YYYY-MM)
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // 봉사 인정 증서를 보고 있는 신청
  const [certificateFor, setCertificateFor] = useState<MyApplication | null>(null);

  const lookup = async (who: { name: string; phone: string }) => {
    setLoading(true);
    setError("");
    try {
      const data = await api<LookupResult>("/applications/lookup", { method: "POST", body: who });
      setResult(data);
      setIdentity(who);
      return data;
    } catch (err) {
      setResult(null);
      setError(errorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const data = await lookup({ name, phone });
    if (data) {
      setWeek(data.weeks[0]?.start ?? "");
      const thisMonth = todayKst().slice(0, 7);
      setMonth(data.monthly.some((m) => m.month === thisMonth) ? thisMonth : (data.monthly[0]?.month ?? ""));
    }
  };

  const cancel = async (application: MyApplication) => {
    if (!identity) return;
    const ok = window.confirm(`${formatDate(application.date)} ${application.activityName} 봉사 신청을 취소할까요?`);
    if (!ok) return;
    setError("");
    setMessage("");
    try {
      const res = await api<{ message: string }>(`/applications/${application.id}/cancel`, {
        method: "PATCH",
        body: identity,
      });
      setMessage(res.message);
      await lookup(identity);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (certificateFor && identity) {
    return <Certificate application={certificateFor} name={identity.name} onClose={() => setCertificateFor(null)} />;
  }

  return (
    <>
      <PageTitle
        eyebrow="내 신청 찾기"
        title="내 신청 내역 찾기"
        description="회원가입 없이, 신청할 때 쓴 이름과 전화번호로 신청을 보고 취소할 수 있어요."
      />

      <form onSubmit={submit} noValidate className={`${cardClass} grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6`}>
        <SearchField label="이름" icon={<UserIcon />}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-11`} placeholder="김봉사" autoComplete="off" />
        </SearchField>
        <SearchField label="전화번호" icon={<PhoneIcon />}>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            className={`${inputClass} pl-11`}
            placeholder="010-1234-5678"
            inputMode="numeric"
            maxLength={13}
            autoComplete="off"
          />
        </SearchField>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-brand-700 disabled:bg-stone-300"
        >
          <SearchIcon /> {loading ? "찾는 중…" : "신청 내역 찾기"}
        </button>
        <p className="text-xs text-stone-500 sm:col-span-3">시연용 가상 봉사자 예시: 김봉사 / 010-0000-0001</p>
      </form>

      <div className="mt-8 space-y-6">
        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="success">{message}</Notice>}

        {result && !result.found && (
          <Notice tone="info">입력하신 이름과 전화번호로 신청한 내역이 없어요. 신청할 때 쓴 정보와 같은지 확인해 주세요.</Notice>
        )}

        {result?.found && identity && (
          <Found
            result={result}
            name={identity.name}
            week={week}
            setWeek={setWeek}
            month={month}
            setMonth={setMonth}
            onCancel={cancel}
            onCertificate={setCertificateFor}
          />
        )}
      </div>
    </>
  );
}

function Found({
  result,
  name,
  week,
  setWeek,
  month,
  setMonth,
  onCancel,
  onCertificate,
}: {
  result: LookupResult;
  name: string;
  week: string;
  setWeek: (w: string) => void;
  month: string;
  setMonth: (m: string) => void;
  onCancel: (a: MyApplication) => void;
  onCertificate: (a: MyApplication) => void;
}) {
  const today = todayKst();
  const weekIndex = result.weeks.findIndex((w) => w.start === week);
  const selectedWeek = weekIndex >= 0 ? result.weeks[weekIndex] : undefined;
  const shown = result.applications.filter((a) => !week || a.weekStart === week);
  const others = week ? result.applications.filter((a) => a.weekStart !== week) : [];

  const record = result.monthly.find((m) => m.month === month);
  const monthApps = result.applications.filter((a) => a.date.startsWith(month));
  const servedHours = monthApps
    .filter((a) => a.status === "applied" && a.date < today)
    .reduce((sum, a) => sum + serviceHours(a.startTime, a.endTime), 0);
  const cancelledInMonth = monthApps.filter((a) => a.status === "cancelled").length;
  const upcoming = result.applications
    .filter((a) => a.status === "applied" && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      {result.isMinor && upcoming.length > 0 && <Notice tone="warning">{MINOR_NOTICE}</Notice>}

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className={`${cardClass} p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <HeartIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-stone-900">{name} 님의 봉사 기록</h2>
                <p className="text-sm text-stone-500">보호동물의 하루를 함께해 주셔서 고마워요 🐾</p>
              </div>
            </div>
            {result.monthly.length > 0 && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="달 고르기">
                {result.monthly.map((m) => (
                  <button
                    key={m.month}
                    type="button"
                    aria-pressed={m.month === month}
                    onClick={() => setMonth(m.month)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      m.month === month ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {m.month.slice(0, 4)}년 {Number(m.month.slice(5, 7))}월
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatTile tone="emerald" label="봉사 횟수 (끝난 봉사)" value={record?.servedCount ?? 0} sub={`총 ${servedHours}시간`} />
            <StatTile
              tone="amber"
              label="신청 횟수"
              value={record?.appliedCount ?? 0}
              sub={cancelledInMonth > 0 ? `취소 ${cancelledInMonth}건은 빼고 셌어요` : "취소한 신청은 세지 않아요"}
            />
            <StatTile
              tone="brand"
              label="앞으로 할 봉사"
              value={upcoming.length}
              sub={upcoming[0] ? `다음: ${formatDate(upcoming[0].date)}` : "예정된 봉사가 없어요"}
            />
          </div>

          {selectedWeek && (
            <div className="mt-4 rounded-2xl bg-stone-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-bold text-stone-900">
                  <CalendarIcon /> {weekLabel(weekIndex)} 신청 횟수
                </p>
                <p className="text-sm font-bold text-brand-700">
                  {selectedWeek.remaining > 0 ? `${selectedWeek.remaining}회 남음` : "더 신청할 수 없어요"} / 한 주 2회
                </p>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {formatShortDate(selectedWeek.start)}~{formatShortDate(selectedWeek.end)}: 2회 중 {selectedWeek.used}회 사용 (취소는 2번까지 세지 않아요)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {[0, 1].map((i) => (
                  <div key={i} className={`h-2.5 rounded-full ${i < selectedWeek.used ? "bg-brand-600" : "bg-stone-200"}`} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className={`${cardClass} p-6`}>
          <h2 className="font-bold text-stone-900">취소 규칙</h2>
          <p className="mt-1 text-sm text-stone-500">다른 봉사자를 위해 꼭 확인해 주세요.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-brand-50 p-4 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-brand-800">
                <ClockIcon /> 취소 마감
              </p>
              <p className="mt-1 text-brand-900/80">봉사 전날 낮 12시까지만 취소할 수 있어요.</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertIcon /> 잦은 취소
              </p>
              <p className="mt-1 text-amber-900/80">한 주에 3번째 취소부터는 신청 1회로 세요.</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-stone-800">
                <BadgeCheckIcon /> 보호소가 취소한 경우
              </p>
              <p className="mt-1 text-stone-600">취소 사유를 보여 드리고, 내 취소 횟수에는 넣지 않아요.</p>
            </div>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-950">
            <b>다른 주 신청 내역 {others.length}건</b>이 더 있어요.
            {others.some((a) => a.status === "cancelled") &&
              ` (신청됨 ${others.filter((a) => a.status === "applied").length}건 · 취소됨 ${others.filter((a) => a.status === "cancelled").length}건)`}
          </p>
          <button type="button" onClick={() => setWeek("")} className={`${secondaryButtonClass} py-1.5 text-sm`}>
            전체 보기 <ArrowRightIcon />
          </button>
        </div>
      )}

      <WeekPicker
        weeks={result.weeks}
        value={week}
        onChange={setWeek}
        allLabel={`전체 보기 (${result.applications.length}건)`}
        detail={(w) => `${w.used}/2회 사용`}
      />

      {shown.length === 0 ? (
        <Notice tone="info">{week ? "이 주에 신청한 봉사가 없어요." : "아직 신청한 봉사가 없어요."}</Notice>
      ) : (
        <ul className="space-y-3">
          {shown.map((a) => (
            <ApplicationRow key={a.id} application={a} today={today} onCancel={() => onCancel(a)} onCertificate={() => onCertificate(a)} />
          ))}
        </ul>
      )}

      <div className={`${cardClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
        <div className="flex-1">
          <p className="font-bold text-stone-900">봉사 날에 갑자기 못 가게 됐나요?</p>
          <p className="mt-1 text-sm text-stone-500">취소 마감이 지나면 이 화면에서 취소할 수 없어요. 다른 봉사자를 위해 미리 취소해 주세요.</p>
        </div>
        <Link href="/" className={`${secondaryButtonClass} text-sm text-brand-700`}>
          새 봉사 신청하러 가기 <ArrowRightIcon />
        </Link>
      </div>
    </>
  );
}

function SearchField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-stone-800">
        {label} <span className="text-brand-600">*</span>
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
        {children}
      </span>
    </label>
  );
}

function StatTile({ tone, label, value, sub }: { tone: "emerald" | "amber" | "brand"; label: string; value: number; sub: string }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    brand: "bg-brand-50 text-brand-700",
  }[tone];
  return (
    <div className={`rounded-2xl p-4 ${styles}`}>
      <p className="text-xs font-bold opacity-80">{label}</p>
      <p className="mt-2 text-4xl font-bold">
        {value}
        <span className="ml-1 text-base font-semibold">회</span>
      </p>
      <p className="mt-1 text-xs opacity-80">{sub}</p>
    </div>
  );
}

function ApplicationRow({
  application: a,
  today,
  onCancel,
  onCertificate,
}: {
  application: MyApplication;
  today: string;
  onCancel: () => void;
  onCertificate: () => void;
}) {
  const cancelled = a.status === "cancelled";
  const done = !cancelled && a.date < today;
  const weekday = WEEKDAYS[new Date(`${a.date}T00:00:00Z`).getUTCDay()];
  return (
    <li className={`${cardClass} flex flex-wrap items-center gap-4 p-5 ${cancelled ? "opacity-70" : ""}`}>
      <div
        className={`flex w-16 flex-col items-center rounded-2xl py-2 ${cancelled ? "bg-stone-100 text-stone-500" : "bg-brand-50 text-brand-700"}`}
      >
        <span className="text-xs font-semibold">
          {Number(a.date.slice(5, 7))}월 {weekday}
        </span>
        <span className="text-2xl font-bold leading-tight">{Number(a.date.slice(8, 10))}</span>
        <span className="text-[11px] font-semibold opacity-70">{dDay(a.date, today)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <ActivityBadge name={a.activityName} />
          <StatusBadge application={a} done={done} />
        </div>
        <Link href={`/schedules/${a.scheduleId}`} className="mt-1.5 block text-lg font-bold text-stone-900 hover:text-brand-700">
          {a.startTime} ~ {a.endTime} ({serviceHours(a.startTime, a.endTime)}시간)
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-stone-500">
          <PinIcon className="h-3.5 w-3.5" /> {a.place}
        </p>
        {a.cancelledBy === "staff" && (
          <p className="mt-1 text-sm font-semibold text-red-700">
            보호소 사정으로 취소됐어요{a.cancelReason ? `: ${a.cancelReason}` : "."} (내 취소 횟수에는 들어가지 않아요.)
          </p>
        )}
        {!cancelled && !done && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-700">
            <ClockIcon className="h-3.5 w-3.5" />
            {a.canCancel ? `${formatDateTime(a.cancelDeadline)}까지 취소할 수 있어요` : `취소 마감이 지났어요 (${formatDateTime(a.cancelDeadline)})`}
          </p>
        )}
      </div>

      {a.canGetCertificate ? (
        <button type="button" onClick={onCertificate} className={`${secondaryButtonClass} text-sm`}>
          <BadgeCheckIcon /> 봉사 인정 증서
        </button>
      ) : a.canCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
        >
          신청 취소하기
        </button>
      ) : null}
    </li>
  );
}

function StatusBadge({ application: a, done }: { application: MyApplication; done: boolean }) {
  if (a.status === "cancelled") {
    return (
      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-500">
        {a.cancelledBy === "staff" ? "보호소가 취소" : "취소됨"}
      </span>
    );
  }
  if (done) return <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">봉사 완료</span>;
  return <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">신청됨</span>;
}

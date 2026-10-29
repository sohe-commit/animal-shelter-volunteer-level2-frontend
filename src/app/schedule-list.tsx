"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRightIcon, BadgeCheckIcon, BagIcon, CalendarIcon, ClockIcon, HeartIcon, PinIcon, SearchIcon } from "@/components/icons";
import { ActivityBadge, CapacityBar, Notice, cardClass, secondaryButtonClass } from "@/components/ui";
import { WeekPicker } from "@/components/week-picker";
import { api, errorMessage, type Activity, type Schedule, type WeekWithAvailability } from "@/lib/api";
import { activityEmoji, addDays, formatDate, formatShortDay, serviceHours, todayKst } from "@/lib/format";

export default function ScheduleList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeks, setWeeks] = useState<WeekWithAvailability[]>([]);
  const [week, setWeek] = useState("");
  // 고른 주 안에서 하루만 보기 (YYYY-MM-DD). ""이면 그 주 전체
  const [day, setDay] = useState("");
  const [activityId, setActivityId] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  // 오늘 날짜는 브라우저에서 그린 뒤에 넣는다 (미리 만든 화면에 날짜가 굳지 않게).
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(todayKst());
    api<Activity[]>("/activities").then(setActivities).catch(() => setActivities([]));
  }, []);

  useEffect(() => {
    api<WeekWithAvailability[]>("/schedules/weeks").then(setWeeks).catch(() => setWeeks([]));
  }, [reloadKey]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (week) params.set("week", week);
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
  }, [week, activityId, availableOnly, reloadKey]);

  const resetFilters = () => {
    chooseWeek("");
    setActivityId("");
    setAvailableOnly(false);
  };
  // 주를 바꾸면 고른 날은 풀어 준다.
  const chooseWeek = (start: string) => {
    setWeek(start);
    setDay("");
  };
  // 날짜 버튼: 고른 주의 일~토. 지금 보이는 일정(활동·신청 가능 조건 반영)이 그날 몇 개인지 함께 보여 준다.
  const days = week ? Array.from({ length: 7 }, (_, i) => addDays(week, i)) : [];
  const countOn = (date: string) => schedules?.filter((s) => s.date === date).length ?? 0;
  const shown = day ? (schedules ?? []).filter((s) => s.date === day) : schedules;
  const availableThisWeek = weeks[0]?.availableCount;
  const availableTotal = weeks.reduce((sum, w) => sum + w.availableCount, 0);

  return (
    <div className="space-y-8">
      {/* 첫 화면 소개 */}
      <section className={`${cardClass} relative overflow-hidden p-6 sm:p-10`}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <HeartIcon className="h-3.5 w-3.5" />
              보호동물과 함께하는 하루
              {today && <span className="font-semibold text-stone-500">· 오늘 {formatDate(today)}</span>}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-stone-900 sm:text-4xl">
              따뜻한 손길을 기다리는 <br className="hidden sm:block" />
              친구들이 있어요 <span aria-hidden="true">🐾</span>
            </h1>
            <p className="mt-3 max-w-xl leading-relaxed text-stone-600">
              산책, 청소, 목욕, 미용, 입양 홍보 사진까지. 주와 활동을 골라 봉사를 신청해 주세요.
              {availableTotal > 0 && (
                <>
                  {" "}
                  지금 <b className="text-brand-700">{availableTotal}개</b> 일정에 신청할 수 있어요.
                </>
              )}
            </p>
          </div>
          <div className="space-y-3">
            <RuleCard icon={<CalendarIcon className="h-5 w-5" />} title="한 사람 한 주에 2번까지">
              한 주(일~토)에 2번, 하루에 한 번만 신청할 수 있어요.
              {availableThisWeek !== undefined && ` 이번 주 신청 가능 일정 ${availableThisWeek}개.`}
            </RuleCard>
            <RuleCard icon={<ClockIcon className="h-5 w-5" />} title="취소는 전날 낮 12시까지" tone="amber">
              그 뒤에는 취소할 수 없으니 일정을 꼭 확인해 주세요.
            </RuleCard>
          </div>
        </div>
      </section>

      {/* 거르기 */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WeekPicker weeks={weeks} value={week} onChange={chooseWeek} detail={(w) => `${w.availableCount}개 가능`} />
          <Toggle checked={availableOnly} onChange={setAvailableOnly} label="신청 가능한 것만 보기" />
        </div>
        {week ? (
          <div role="group" aria-label="날짜 고르기" className="flex flex-wrap gap-2">
            <ActivityChip selected={day === ""} onClick={() => setDay("")}>
              <CalendarIcon className="h-3.5 w-3.5" /> 이 주 전체
            </ActivityChip>
            {days.map((date) => {
              const count = countOn(date);
              const past = today !== "" && date <= today;
              return (
                <ActivityChip key={date} selected={day === date} onClick={() => setDay(date)} disabled={count === 0}>
                  <span className={past && day !== date ? "text-stone-400" : ""}>{formatShortDay(date)}</span>
                  <span className="text-xs font-medium opacity-70">{count === 0 ? "없음" : past ? "마감" : `${count}개`}</span>
                </ActivityChip>
              );
            })}
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-stone-500">
            <CalendarIcon className="h-4 w-4" /> 위에서 주를 고르면 그 주의 하루만 골라 볼 수도 있어요.
          </p>
        )}
        <div role="group" aria-label="활동 고르기" className="flex flex-wrap gap-2">
          <ActivityChip selected={activityId === ""} onClick={() => setActivityId("")}>
            전체 활동
          </ActivityChip>
          {activities.map((a) => (
            <ActivityChip key={a.id} selected={activityId === String(a.id)} onClick={() => setActivityId(String(a.id))}>
              <span aria-hidden="true">{activityEmoji(a.name)}</span> {a.name}
              <span className="text-xs font-medium opacity-70">정원 {a.capacity}명</span>
            </ActivityChip>
          ))}
          {(week || activityId || availableOnly) && (
            <button type="button" onClick={resetFilters} className="px-2 text-sm font-semibold text-stone-500 underline">
              조건 지우기
            </button>
          )}
        </div>
      </section>

      {error && (
        <Notice tone="error">
          {error}{" "}
          <button type="button" className="font-semibold underline" onClick={() => setReloadKey((k) => k + 1)}>
            다시 불러오기
          </button>
        </Notice>
      )}

      {shown === null ? (
        <p className="text-stone-500">일정을 불러오는 중이에요… (무료 서버라 처음에는 30초쯤 걸릴 수 있어요)</p>
      ) : shown.length === 0 && !error ? (
        <Notice tone="info">조건에 맞는 일정이 없어요. 다른 주나 날짜, 활동을 골라 보세요.</Notice>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => (
            <li key={s.id}>
              <ScheduleCard schedule={s} />
            </li>
          ))}
        </ul>
      )}

      {/* 도움말 */}
      <section className="flex flex-col gap-4 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-6 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <BadgeCheckIcon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="font-bold text-brand-800">신청 전에 확인해 주세요</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            취소는 <b className="text-brand-700">봉사 전날 낮 12시까지</b> 할 수 있어요. 취소는 한 주에 2번까지는 신청 횟수에 세지 않지만,
            3번째 취소부터는 1회로 세요.
          </p>
        </div>
        <Link href="/my" className={`${secondaryButtonClass} shrink-0 text-sm`}>
          <SearchIcon /> 내 신청 확인하기
        </Link>
      </section>
    </div>
  );
}

function RuleCard({
  icon,
  title,
  children,
  tone = "emerald",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  tone?: "emerald" | "amber";
}) {
  const styles = tone === "emerald" ? "bg-emerald-50/80 text-emerald-900" : "bg-amber-50/80 text-amber-900";
  return (
    <div className={`flex gap-3 rounded-2xl p-4 ${styles}`}>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80">{icon}</span>
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed opacity-80">{children}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-stone-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
      {label}
    </label>
  );
}

function ActivityChip({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected ? "bg-stone-800 text-white" : "border border-stone-200 bg-white text-stone-600 enabled:hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

/** 일정 카드의 오른쪽 위 상태 표시 */
function cardStatus(s: Schedule): { label: string; className: string } {
  if (s.isPast) return { label: "신청 마감", className: "bg-stone-100 text-stone-500" };
  if (s.remaining === 0) return { label: "정원 마감", className: "bg-stone-100 text-stone-500" };
  if (s.remaining === 1) return { label: "마감 임박 · 1자리", className: "bg-brand-50 text-brand-700" };
  return { label: `여유 · ${s.remaining}자리`, className: "bg-emerald-50 text-emerald-700" };
}

function ScheduleCard({ schedule: s }: { schedule: Schedule }) {
  const closed = !s.canApply;
  const status = cardStatus(s);
  return (
    <article className={`${cardClass} flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${closed ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <ActivityBadge name={s.activityName} />
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h2 className={`text-xl font-bold ${closed ? "text-stone-500" : "text-stone-900"}`}>{formatDate(s.date)}</h2>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500">
          {serviceHours(s.startTime, s.endTime)}시간
        </span>
      </div>
      <p className={`mt-1 flex items-center gap-1.5 font-bold ${closed ? "text-stone-400" : "text-brand-700"}`}>
        <ClockIcon /> {s.startTime} ~ {s.endTime}
      </p>

      <ul className="mt-4 space-y-2 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        <li className="flex items-start gap-2">
          <PinIcon className="mt-0.5 h-4 w-4 text-stone-400" /> {s.place}
        </li>
        <li className="flex items-start gap-2">
          <BagIcon className="mt-0.5 h-4 w-4 text-stone-400" /> 준비물: {s.supplies || "없음"}
        </li>
        <li className="flex items-start gap-2">
          <BadgeCheckIcon className="mt-0.5 h-4 w-4 text-stone-400" /> {s.givesCertificate ? "봉사 인정 증서 드려요" : "봉사 인정 증서 없음"}
        </li>
      </ul>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs font-semibold">
          <span className="text-stone-500">모집 인원</span>
          <span className={closed ? "text-stone-400" : "text-brand-700"}>
            {s.appliedCount} / {s.capacity}명
          </span>
        </div>
        <CapacityBar applied={s.appliedCount} capacity={s.capacity} muted={closed} />
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/schedules/${s.id}`}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3 font-bold transition ${
            closed ? "bg-stone-100 text-stone-500 hover:bg-stone-200" : "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
          }`}
        >
          {closed ? "자세히 보기" : "신청하기"} <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}

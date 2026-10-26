"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ActivityBadge, Field, Notice, PageTitle, buttonClass, inputClass, secondaryButtonClass } from "@/components/ui";
import { api, errorMessage, type LookupResult, type MyApplication } from "@/lib/api";
import { formatDate, formatDateTime, formatShortDate } from "@/lib/format";

export default function MyApplicationsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // 취소할 때도 신청자 확인(R6)에 쓰도록, 조회에 성공한 이름과 전화번호를 기억해 둔다.
  const [identity, setIdentity] = useState<{ name: string; phone: string } | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const lookup = async (who: { name: string; phone: string }) => {
    setLoading(true);
    setError("");
    try {
      const data = await api<LookupResult>("/applications/lookup", { method: "POST", body: who });
      setResult(data);
      setIdentity(who);
    } catch (err) {
      setResult(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    void lookup({ name, phone });
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

  return (
    <>
      <PageTitle title="내 신청 찾기" description="신청할 때 쓴 이름과 전화번호를 넣으면 내 신청을 보고 취소할 수 있어요." />

      <form onSubmit={submit} noValidate className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="이름">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="김봉사" autoComplete="off" />
        </Field>
        <Field label="전화번호">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="010-1234-5678" inputMode="tel" autoComplete="off" />
        </Field>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "찾는 중…" : "찾기"}
        </button>
      </form>
      <p className="mt-2 text-xs text-stone-500">시연용 가상 봉사자 예시: 김봉사 / 010-0000-0001</p>

      <div className="mt-6 space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="success">{message}</Notice>}

        {result && !result.found && (
          <Notice tone="info">
            입력하신 이름과 전화번호로 신청한 내역이 없어요. 신청할 때 쓴 정보와 같은지 확인해 주세요.
          </Notice>
        )}

        {result?.found && (
          <>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-900">
                이번 주({formatShortDate(result.week.start)}~{formatShortDate(result.week.end)}) 신청 횟수
              </p>
              <p className="mt-1 text-xl font-bold text-orange-900">
                2회 중 {result.week.used}회 사용 · <span className="text-orange-700">{result.week.remaining}회 남음</span>
              </p>
              <p className="mt-1 text-xs text-orange-800">취소한 신청은 2번까지 세지 않아요. 3번째 취소부터는 1회로 셉니다.</p>
            </div>

            {result.applications.length === 0 ? (
              <Notice tone="info">아직 신청한 봉사가 없어요.</Notice>
            ) : (
              <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
                {result.applications.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                    <ActivityBadge name={a.activityName} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/schedules/${a.scheduleId}`} className="font-semibold text-stone-900 hover:text-orange-700">
                        {formatDate(a.date)} {a.startTime}~{a.endTime}
                      </Link>
                      <p className="text-sm text-stone-500">{a.place}</p>
                    </div>
                    <StatusAndAction application={a} onCancel={() => cancel(a)} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StatusAndAction({ application: a, onCancel }: { application: MyApplication; onCancel: () => void }) {
  if (a.status === "cancelled") {
    return <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-500">취소됨</span>;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">신청됨</span>
      {a.canCancel ? (
        <button type="button" onClick={onCancel} className={`${secondaryButtonClass} py-1.5 text-sm`}>
          취소하기
        </button>
      ) : (
        <span className="text-xs text-stone-500">
          취소 마감 지남
          <br />({formatDateTime(a.cancelDeadline)})
        </span>
      )}
    </div>
  );
}

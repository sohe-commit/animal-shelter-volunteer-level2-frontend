"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Field, Notice, inputClass, secondaryButtonClass } from "@/components/ui";
import { api, errorMessage, type RosterEntry, type Schedule } from "@/lib/api";
import { formatDateTime, todayKst } from "@/lib/format";

const dangerButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300";

/** 담당자 모드에서 일정 상세 아래에 보이는 칸: 신청자 명단, 고치기, 지우기 */
export function StaffPanel({ schedule: s, onChanged }: { schedule: Schedule; onChanged: () => void }) {
  const [roster, setRoster] = useState<RosterEntry[] | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRoster = useCallback(() => {
    api<RosterEntry[]>(`/schedules/${s.id}/applications`)
      .then(setRoster)
      .catch((e) => setError(errorMessage(e)));
  }, [s.id]);

  useEffect(loadRoster, [loadRoster]);

  const applied = roster?.filter((r) => r.status === "applied") ?? [];
  const cancelled = roster?.filter((r) => r.status === "cancelled") ?? [];
  const canEdit = !s.isCancelled && !s.isPast;
  const canDelete = !s.isCancelled && s.date >= todayKst();

  return (
    <section className="space-y-4 rounded-3xl border-2 border-stone-800 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-900">
          <span className="mr-2 rounded bg-stone-800 px-1.5 py-0.5 text-xs font-semibold text-white">담당자</span>
          신청자 명단 · 일정 관리
        </h2>
        {canEdit && (
          <Link href={`/admin/schedules/${s.id}/edit`} className={`${secondaryButtonClass} py-1.5 text-sm`}>
            일정 고치기
          </Link>
        )}
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {message && <Notice tone="success">{message}</Notice>}

      {!roster ? (
        <p className="text-sm text-stone-500">명단을 불러오는 중이에요…</p>
      ) : roster.length === 0 ? (
        <Notice tone="info">아직 신청한 사람이 없어요.</Notice>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-semibold">이름</th>
                <th className="py-2 pr-3 font-semibold">전화번호</th>
                <th className="py-2 pr-3 font-semibold">상태</th>
                <th className="py-2 font-semibold">신청 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[...applied, ...cancelled].map((r) => (
                <tr key={r.id} className={r.status === "cancelled" ? "text-stone-400" : "text-stone-900"}>
                  <td className="py-2 pr-3 font-semibold">
                    {r.name}
                    {r.isMinor && (
                      <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">미성년자</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{r.phone}</td>
                  <td className="py-2 pr-3">
                    {r.status === "applied" ? (
                      <span className="font-semibold text-emerald-700">신청됨</span>
                    ) : r.cancelledBy === "staff" ? (
                      "담당자가 취소"
                    ) : (
                      "본인이 취소"
                    )}
                  </td>
                  <td className="py-2">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-stone-500">
            신청 {applied.length}명 / 정원 {s.capacity}명 · 취소 {cancelled.length}건
            {applied.some((r) => r.isMinor) && " · 미성년자는 보호자 동의서를 확인해 주세요."}
          </p>
        </div>
      )}

      {canDelete && (
        <DeleteSchedule
          applicantCount={applied.length}
          scheduleId={s.id}
          onDeleted={(text) => {
            setMessage(text);
            onChanged();
            loadRoster();
          }}
        />
      )}
    </section>
  );
}

/** 일정 지우기. 신청자가 있으면 취소 사유를 적어야 하고, 신청도 함께 취소된다. */
function DeleteSchedule({
  scheduleId,
  applicantCount,
  onDeleted,
}: {
  scheduleId: number;
  applicantCount: number;
  onDeleted: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = window.confirm(
      applicantCount > 0
        ? `이 일정을 지우면 신청자 ${applicantCount}명의 신청도 함께 취소돼요. 계속할까요?`
        : "이 일정을 지울까요?",
    );
    if (!ok) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await api<{ message: string }>(`/schedules/${scheduleId}/cancel`, { method: "POST", body: { reason } });
      onDeleted(result.message);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${secondaryButtonClass} py-1.5 text-sm text-red-700`}>
        일정 지우기
      </button>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">
        {applicantCount > 0 ? (
          <>
            신청자 <b>{applicantCount}명</b>의 신청도 함께 취소돼요. 적은 사유는 봉사자가 &lsquo;내 신청 찾기&rsquo;에서 그대로 봐요. 담당자가
            취소한 신청은 봉사자의 취소 횟수에 들어가지 않아요.
          </>
        ) : (
          "신청자가 없는 일정이에요. 사유는 적지 않아도 돼요."
        )}
      </p>
      <Field label={applicantCount > 0 ? "취소 사유 (꼭 적어 주세요)" : "취소 사유 (선택)"}>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
          placeholder="태풍 예보로 보호소 야외 활동을 쉬어요."
          maxLength={200}
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className={dangerButtonClass}>
          {submitting ? "지우는 중…" : "일정 지우기"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={secondaryButtonClass}>
          그만두기
        </button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Notice, PageTitle, buttonClass } from "@/components/ui";
import { API_URL, api, errorMessage } from "@/lib/api";

interface Health {
  status: string;
  db: string;
}

interface ResetResult {
  message: string;
  counts: { activities: number; schedules: number; volunteers: number; applications: number };
}

export default function DataView() {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Health>("/health")
      .then(setHealth)
      .catch((e) => setHealthError(errorMessage(e)));
  }, []);

  const reset = async () => {
    const ok = window.confirm("지금 데이터가 모두 지워지고 가상 데이터로 다시 채워집니다. 계속할까요?");
    if (!ok) return;
    setResetting(true);
    setError("");
    setResult(null);
    try {
      setResult(await api<ResetResult>("/admin/reset-demo-data", { method: "POST" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <PageTitle title="데이터 관리" description="시연하기 전에 데이터를 처음 상태로 되돌릴 수 있어요." />

      <div className="grid max-w-3xl gap-4">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-900">서버와 DB 상태</h2>
          <div className="mt-3">
            {healthError ? (
              <Notice tone="error">{healthError}</Notice>
            ) : !health ? (
              <p className="text-stone-500">확인하는 중이에요…</p>
            ) : health.status === "ok" ? (
              <Notice tone="success">서버와 DB가 잘 연결되어 있어요.</Notice>
            ) : (
              <Notice tone="error">DB에 연결할 수 없어요.</Notice>
            )}
          </div>
          <a href={`${API_URL}/health`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-orange-700 underline">
            /health 직접 열어 보기
          </a>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-900">가상 데이터 다시 채우기</h2>
          <p className="mt-2 text-sm text-stone-600">
            모든 일정·봉사자·신청을 지우고, 오늘을 기준으로 앞뒤 2주의 일정과 가상 봉사자 30명, 신청 약 120건을 다시 넣어요. 이름과
            전화번호는 모두 지어낸 값이에요.
          </p>
          <button type="button" onClick={reset} disabled={resetting} className={`${buttonClass} mt-4`}>
            {resetting ? "채우는 중…" : "가상 데이터 다시 채우기"}
          </button>
          <div className="mt-4 space-y-2">
            {error && <Notice tone="error">{error}</Notice>}
            {result && (
              <Notice tone="success">
                {result.message} 활동 {result.counts.activities}개, 일정 {result.counts.schedules}개, 봉사자 {result.counts.volunteers}명, 신청{" "}
                {result.counts.applications}건
              </Notice>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

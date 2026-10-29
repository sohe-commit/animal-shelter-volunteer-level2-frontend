"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ScheduleForm } from "@/components/schedule-form";
import { Notice, PageTitle } from "@/components/ui";
import { api, errorMessage, type Schedule } from "@/lib/api";

export default function EditSchedule({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Schedule>(`/schedules/${id}`)
      .then(setSchedule)
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  const back = (
    <Link href={`/schedules/${id}`} className="text-sm font-semibold text-stone-600 hover:text-brand-700">
      ← 일정으로 돌아가기
    </Link>
  );

  if (error) return <div className="space-y-4">{back}<Notice tone="error">{error}</Notice></div>;
  if (!schedule) return <p className="text-stone-500">일정을 불러오는 중이에요…</p>;

  return (
    <div className="space-y-4">
      {back}
      <PageTitle title="봉사 일정 고치기" />
      {schedule.isCancelled ? (
        <Notice tone="info">이미 지운 일정이라 고칠 수 없어요.</Notice>
      ) : schedule.isPast ? (
        <Notice tone="info">오늘이나 지난 일정은 고칠 수 없어요.</Notice>
      ) : (
        <ScheduleForm schedule={schedule} />
      )}
    </div>
  );
}

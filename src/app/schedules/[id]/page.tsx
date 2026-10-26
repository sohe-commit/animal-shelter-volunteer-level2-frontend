import { Suspense } from "react";
import ScheduleDetail from "./schedule-detail";

export default function SchedulePage({ params }: PageProps<"/schedules/[id]">) {
  return (
    <Suspense fallback={<p className="text-stone-500">일정을 불러오는 중이에요…</p>}>
      <ScheduleDetail params={params} />
    </Suspense>
  );
}

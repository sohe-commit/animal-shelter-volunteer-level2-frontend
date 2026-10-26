import { Suspense } from "react";
import { StaffOnly } from "@/components/staff";
import NewScheduleForm from "./new-schedule-form";

// 기본 날짜를 내일로 채우므로, 방문할 때마다 새로 그린다.
export default function NewSchedulePage() {
  return (
    <StaffOnly>
      <Suspense fallback={<p className="text-stone-500">불러오는 중이에요…</p>}>
        <NewScheduleForm />
      </Suspense>
    </StaffOnly>
  );
}

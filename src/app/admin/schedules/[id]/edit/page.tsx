import { Suspense } from "react";
import { StaffOnly } from "@/components/staff";
import EditSchedule from "./edit-schedule";

export default function EditSchedulePage({ params }: PageProps<"/admin/schedules/[id]/edit">) {
  return (
    <StaffOnly>
      <Suspense fallback={<p className="text-stone-500">불러오는 중이에요…</p>}>
        <EditSchedule params={params} />
      </Suspense>
    </StaffOnly>
  );
}

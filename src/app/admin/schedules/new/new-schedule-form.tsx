"use client";

import { ScheduleForm } from "@/components/schedule-form";
import { PageTitle } from "@/components/ui";

export default function NewScheduleForm() {
  return (
    <>
      <PageTitle title="봉사 일정 등록" description="같은 날짜에 같은 활동은 하나만 등록할 수 있어요. 정원은 활동마다 정해져 있어요." />
      <ScheduleForm />
    </>
  );
}

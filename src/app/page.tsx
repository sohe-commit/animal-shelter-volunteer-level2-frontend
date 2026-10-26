import { PageTitle } from "@/components/ui";
import ScheduleList from "./schedule-list";

export default function HomePage() {
  return (
    <>
      <PageTitle
        title="봉사 일정"
        description="날짜와 활동을 골라 봉사를 신청해 주세요. 봉사는 하루 한 번, 한 주(일~토)에 2번까지 신청할 수 있어요."
      />
      <ScheduleList />
    </>
  );
}

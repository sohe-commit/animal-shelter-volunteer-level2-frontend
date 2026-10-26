import { Suspense } from "react";
import StatsView from "./stats-view";

// 오늘 날짜로 기본 월을 정하므로, 방문할 때마다 새로 그린다.
export default function StatsPage() {
  return (
    <Suspense fallback={<p className="text-stone-500">현황을 불러오는 중이에요…</p>}>
      <StatsView />
    </Suspense>
  );
}

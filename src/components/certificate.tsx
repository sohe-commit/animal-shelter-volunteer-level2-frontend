"use client";

import { buttonClass, secondaryButtonClass } from "@/components/ui";
import type { MyApplication } from "@/lib/api";
import { formatDate, serviceHours, todayKst } from "@/lib/format";

/** 봉사 인정 증서. 끝난 봉사에만 보이고, 인쇄하면 증서만 종이에 나온다. */
export function Certificate({ application: a, name, onClose }: { application: MyApplication; name: string; onClose: () => void }) {
  const issued = todayKst();
  const number = `온기-${a.date.slice(0, 4)}-${String(a.id).padStart(5, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          ← 내 신청으로 돌아가기
        </button>
        <button type="button" onClick={() => window.print()} className={buttonClass}>
          인쇄하기
        </button>
      </div>

      <article className="certificate mx-auto max-w-2xl rounded-3xl border-4 border-double border-brand-300 bg-white px-10 py-12 text-center text-stone-900">
        <p className="text-sm text-stone-500">증서 번호 {number}</p>
        <h1 className="mt-6 text-3xl font-bold tracking-widest">봉사 인정 증서</h1>

        <dl className="mx-auto mt-10 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-left">
          <dt className="font-semibold text-stone-500">이름</dt>
          <dd className="font-semibold">{name}</dd>
          <dt className="font-semibold text-stone-500">봉사 날짜</dt>
          <dd>{formatDate(a.date)}</dd>
          <dt className="font-semibold text-stone-500">봉사 시간</dt>
          <dd>
            {a.startTime} ~ {a.endTime} ({serviceHours(a.startTime, a.endTime)}시간)
          </dd>
          <dt className="font-semibold text-stone-500">활동</dt>
          <dd>{a.activityName}</dd>
          <dt className="font-semibold text-stone-500">장소</dt>
          <dd>{a.place}</dd>
        </dl>

        <p className="mt-10 leading-relaxed">
          위 사람은 온기 동물보호소에서 보호동물을 위한
          <br />
          봉사활동을 성실히 하였기에 이 증서를 드립니다.
        </p>
        <p className="mt-8 text-stone-600">{formatDate(issued)}</p>
        <p className="mt-2 text-xl font-bold">온기 동물보호소</p>
        <p className="mt-8 text-xs text-stone-400">과제용 시연 사이트에서 만든 가상 증서예요.</p>
      </article>
    </div>
  );
}

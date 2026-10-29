import { BadgeCheckIcon, InfoIcon, PawIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-stone-200/70 bg-white/60 print:hidden">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-bold text-stone-900">
            <PawIcon className="h-5 w-5 text-brand-600" />
            온기 동물보호소 봉사 신청
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            보호동물의 하루를 함께 돌봐 주는 봉사자를 기다려요. 산책, 청소, 목욕, 미용, 입양 홍보 사진 활동이 있어요.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50/80 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-900">
            <BadgeCheckIcon /> 신청 규칙
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/80">
            봉사는 하루 한 번, 한 주(일~토)에 2번까지 신청할 수 있어요. 취소는 봉사 전날 낮 12시까지 할 수 있어요.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50/80 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
            <InfoIcon /> 안내
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-900/80">
            과제용 시연 사이트예요. 보호소 이름과 모든 이름·전화번호는 가상 데이터예요.
          </p>
        </div>
      </div>
    </footer>
  );
}

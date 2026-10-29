"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { LockIcon, PawIcon } from "@/components/icons";
import { StaffLoginForm } from "@/components/staff";
import { setStaffPassword, useIsStaff } from "@/lib/staff";

const volunteerLinks = [
  { href: "/", label: "봉사 일정" },
  { href: "/my", label: "내 신청 찾기" },
];
// 담당자 모드에서만 보이는 메뉴
const staffLinks = [
  { href: "/admin/schedules/new", label: "일정 등록" },
  { href: "/admin/stats", label: "현황" },
  { href: "/admin/data", label: "데이터 관리" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/schedules");
  return pathname.startsWith(href);
}

/** 지금 보고 있는 메뉴를 강조한다. 주소는 브라우저에서만 알 수 있어서 Suspense 안에서 읽는다. */
function ActiveNav({ isStaff }: { isStaff: boolean }) {
  return <NavLinks pathname={usePathname()} isStaff={isStaff} />;
}

function NavLinks({ pathname, isStaff }: { pathname: string; isStaff: boolean }) {
  const navLink = (link: { href: string; label: string }) => (
    <Link
      key={link.href}
      href={link.href}
      className={`rounded-full px-4 py-2 font-semibold transition ${
        isActive(pathname, link.href) ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      {link.label}
    </Link>
  );

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-full border border-stone-200/70 bg-white p-1 text-sm shadow-sm">
      {volunteerLinks.map(navLink)}
      {isStaff && (
        <>
          <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden="true" />
          {staffLinks.map(navLink)}
        </>
      )}
    </nav>
  );
}

export function SiteHeader() {
  const isStaff = useIsStaff();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/60 bg-[#fbf8f3]/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <PawIcon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-brand-700">
              온기 동물보호소 <span className="text-xs font-semibold text-stone-500">봉사 신청</span>
            </span>
            <span className="block text-xs text-stone-500">보호동물과 함께하는 하루</span>
          </span>
        </Link>

        <Suspense fallback={<NavLinks pathname="" isStaff={isStaff} />}>
          <ActiveNav isStaff={isStaff} />
        </Suspense>

        {isStaff ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-stone-800 px-3 py-1.5 text-xs font-bold text-white">담당자 모드</span>
            <button
              type="button"
              onClick={() => setStaffPassword(null)}
              className="rounded-full px-3 py-1.5 font-semibold text-stone-500 hover:bg-stone-100"
            >
              끄기
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-expanded={loginOpen}
              onClick={() => setLoginOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm hover:text-stone-900"
            >
              <LockIcon className="h-3.5 w-3.5" />
              담당자 모드
            </button>
            {loginOpen && (
              <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
                <StaffLoginForm onDone={() => setLoginOpen(false)} />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

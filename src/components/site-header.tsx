"use client";

import Link from "next/link";
import { useState } from "react";
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

const linkClass = "rounded-md px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100";

export function SiteHeader() {
  const isStaff = useIsStaff();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-orange-700">
          🐾 온기 동물보호소 봉사 신청
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {volunteerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          {isStaff ? (
            <>
              <span className="ml-2 mr-1 rounded bg-stone-800 px-1.5 py-0.5 text-xs font-semibold text-white">담당자</span>
              {staffLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              <button type="button" onClick={() => setStaffPassword(null)} className={`${linkClass} text-stone-500`}>
                담당자 모드 끄기
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-expanded={loginOpen}
                onClick={() => setLoginOpen((open) => !open)}
                className={`${linkClass} text-stone-500`}
              >
                담당자 모드
              </button>
              {loginOpen && (
                <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
                  <StaffLoginForm onDone={() => setLoginOpen(false)} />
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

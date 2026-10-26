import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "온기 동물보호소 봉사 신청",
  description: "날짜와 활동을 골라 봉사를 신청하고, 내 신청을 확인하고 취소할 수 있어요.",
};

const volunteerLinks = [
  { href: "/", label: "봉사 일정" },
  { href: "/my", label: "내 신청 찾기" },
];
const staffLinks = [
  { href: "/admin/schedules/new", label: "일정 등록" },
  { href: "/admin/stats", label: "현황" },
  { href: "/admin/data", label: "데이터 관리" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-orange-700">
              🐾 온기 동물보호소 봉사 신청
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {volunteerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100">
                  {link.label}
                </Link>
              ))}
              <span className="ml-2 mr-1 rounded bg-stone-800 px-1.5 py-0.5 text-xs font-semibold text-white">담당자</span>
              {staffLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
          과제용 시연 사이트입니다. 모든 이름과 전화번호는 가상 데이터예요.
        </footer>
      </body>
    </html>
  );
}

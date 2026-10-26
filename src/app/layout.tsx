import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "온기 동물보호소 봉사 신청",
  description: "주와 활동을 골라 봉사를 신청하고, 내 신청을 확인하고 취소할 수 있어요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
          과제용 시연 사이트입니다. 모든 이름과 전화번호는 가상 데이터예요.
        </footer>
      </body>
    </html>
  );
}

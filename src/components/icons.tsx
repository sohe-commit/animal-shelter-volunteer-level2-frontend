// 화면에 쓰는 작은 선 아이콘 모음 (글자 크기를 따라 커진다)
import type { ReactNode } from "react";

function Icon({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const PawIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`shrink-0 ${className ?? "h-4 w-4"}`}>
    <ellipse cx="6" cy="10" rx="2" ry="2.6" />
    <ellipse cx="10" cy="6" rx="2" ry="2.6" />
    <ellipse cx="14.5" cy="6" rx="2" ry="2.6" />
    <ellipse cx="18.5" cy="10" rx="2" ry="2.6" />
    <path d="M12.2 11c-2.6 0-5.7 4-5.7 6.3 0 1.7 1.3 2.4 2.7 2.4 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.4 0 2.7-.7 2.7-2.4 0-2.3-3.1-6.3-5.7-6.3Z" />
  </svg>
);
export const ClockIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
export const PinIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
export const BagIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="4" y="7" width="16" height="13" rx="2" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
  </Icon>
);
export const BadgeCheckIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Icon>
);
export const AlertIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </Icon>
);
export const LockIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
);
export const SearchIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
export const CalendarIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
export const ArrowRightIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const UserIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const PhoneIcon = ({ className }: P) => (
  <Icon className={className}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </Icon>
);
export const HeartIcon = ({ className }: P) => (
  <Icon className={className}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" />
  </Icon>
);
export const InfoIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);
export const UsersIcon = ({ className }: P) => (
  <Icon className={className}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
  </Icon>
);

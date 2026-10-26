import { useSyncExternalStore } from "react";

// 담당자 모드: 비밀번호가 맞으면 이 탭(sessionStorage)에만 기억해 두고, 담당자 기능을 부를 때 함께 보낸다.
// 탭을 닫으면 사라진다.
const KEY = "staffPassword";
const listeners = new Set<() => void>();

export function getStaffPassword(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setStaffPassword(password: string | null) {
  try {
    if (password) sessionStorage.setItem(KEY, password);
    else sessionStorage.removeItem(KEY);
  } catch {
    // 저장소를 쓸 수 없는 브라우저에서는 담당자 모드가 유지되지 않을 뿐이다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 담당자 모드인지 (서버에서 그릴 때는 항상 아님) */
export function useIsStaff(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getStaffPassword() !== null,
    () => false,
  );
}

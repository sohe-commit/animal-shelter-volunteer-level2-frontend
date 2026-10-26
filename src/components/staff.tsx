"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Notice, buttonClass, inputClass } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { setStaffPassword, useIsStaff } from "@/lib/staff";

/** 담당자 비밀번호를 넣는 작은 폼. 맞으면 담당자 모드가 켜진다. */
export function StaffLoginForm({ onDone }: { onDone?: () => void }) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      await api("/admin/login", { method: "POST", body: { password } });
      setStaffPassword(password);
      setPassword("");
      onDone?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-stone-800">담당자 비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoComplete="current-password"
          autoFocus
        />
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={checking || !password} className={`${buttonClass} w-full`}>
        {checking ? "확인하는 중…" : "담당자 모드 켜기"}
      </button>
    </form>
  );
}

/** 담당자 모드에서만 내용을 보여 주고, 아니면 비밀번호 폼을 보여 준다. */
export function StaffOnly({ children }: { children: ReactNode }) {
  const isStaff = useIsStaff();
  if (isStaff) return <>{children}</>;
  return (
    <div className="mx-auto max-w-sm rounded-xl border border-stone-200 bg-white p-6">
      <h1 className="text-lg font-bold text-stone-900">담당자만 볼 수 있는 화면이에요</h1>
      <p className="mt-1 mb-4 text-sm text-stone-600">담당자 비밀번호를 넣으면 담당자 모드로 바뀌어요.</p>
      <StaffLoginForm />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

type User = {
  name: string;
  email: string;
  role: "candidate" | "employer";
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // TODO: thay phần này bằng dữ liệu auth thật (JWT / next-auth / context...)
  useEffect(() => {
    // Ví dụ: đọc user từ localStorage
    // const stored = localStorage.getItem("user");
    // if (stored) setUser(JSON.parse(stored));

    // DEMO: comment dòng dưới khi đã có auth thật
    // setUser({ name: "Minh N.", email: "minh@example.com", role: "candidate" });
  }, []);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [open]);

  const handleLogout = () => {
    // TODO: clear token / session
    // localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <header className="sticky top-0 z-40">
      {/* vệt gradient mỏng trên đầu cho sang */}
      <div className="h-[2px] w-full bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900" />

      <div className="max-w-6xl mx-auto px-4 pt-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.12)] flex items-center justify-between px-4 py-2.5 md:px-5">
          {/* Logo + brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 text-white flex items-center justify-center text-sm font-semibold shadow-md">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-slate-900">
                AI JobMatch
              </span>
              
            </div>
          </Link>

          {/* Nav giữa (chỉ là anchor, bạn có thể gắn #id sau) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              Tính năng
            </a>
            <a href="#how-it-works" className="hover:text-slate-900">
              Cách hoạt động
            </a>
            <a href="#for-whom" className="hover:text-slate-900">
              Đối tượng sử dụng
            </a>
          </nav>

          {/* Khu vực user / login */}
          <div className="flex items-center gap-3">
            {/* Chưa đăng nhập */}
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs md:text-sm font-medium shadow-md hover:bg-slate-800"
                >
                  Bắt đầu ngay
                </Link>
              </>
            )}

            {/* Đã đăng nhập */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1.5 hover:border-slate-900 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-[11px] font-medium text-slate-900 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <svg
                    className={`h-3 w-3 text-slate-500 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden text-sm">
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                      <p className="text-[11px] text-slate-500">
                        Đăng nhập với
                      </p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={
                          user.role === "candidate"
                            ? "/candidate/dashboard"
                            : "/employer/dashboard"
                        }
                        className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                        onClick={() => setOpen(false)}
                      >
                        Hồ sơ của tôi
                      </Link>
                    </div>

                    <div className="border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

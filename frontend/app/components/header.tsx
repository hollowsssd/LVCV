"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useMemo, useState } from "react";

type User = {
  email: string;
  role: "candidate" | "employer";
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0); // ✅ thêm cái này

  // đọc cookie -> user
  const user = useMemo<User | null>(() => {
    if (typeof window === "undefined") return null;

    const token = Cookies.get("token");
    const role = Cookies.get("role") as User["role"] | undefined;
    const email = Cookies.get("email");

    if (token && role && email) return { email, role };
    return null;
  }, [pathname, authTick]); 

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("email");
      router.push("/");
  router.refresh();

    setMenuOpen(false);

    // ép header re-render để đọc lại cookie ngay lập tức
    setAuthTick((t) => t + 1);

    //refresh để các component khác (nếu có) cập nhật theo
    router.refresh();

    // Nếu đang ở "/" thì push "/" không đổi pathname => nhưng header đã re-render nhờ authTick
    router.push("/");
  };

  const menuItems = [
    { href: "/#features", label: "Tính năng" },
    { href: "/#how-it-works", label: "Cách hoạt động" },
    { href: "/#for-whom", label: "Đối tượng sử dụng" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image
              src="/logo.png" // đổi theo tên file ảnh trong /public
              alt="Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">AI JobMatch</span>
            <span className="text-[11px] text-slate-500">Chấm điểm CV - Tìm việc phù hợp</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-600">
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-slate-900">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link
                href="/auth/login"
                className="text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800"
              >
                Bắt đầu ngay
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
              >
                <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-900">{user.email}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white shadow-md text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-medium text-slate-900">Tài khoản</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {user.role === "candidate" ? (
                      <Link
                        href="/candidate/dashboard"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Candidate Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/employer/dashboard"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Employer Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-red-600"
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
    </header>
  );
}
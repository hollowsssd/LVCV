"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { Bell } from "lucide-react";

type User = {
  email: string;
  role: "candidate" | "employer";
};

type Noti = {
  id: number;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt?: string;
};

type UnreadCountRes = { count: number };
type ListNotiRes = Noti[];

type ApiErr = { message?: string; error?: string; detail?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

/* ================== helpers ================== */

function cleanBearer(raw: string): string {
  let t = String(raw || "").trim();
  // xóa nhiều lần "Bearer " nếu bị dính "Bearer Bearer ..."
  while (/^bearer\s+/i.test(t)) t = t.replace(/^bearer\s+/i, "").trim();
  // nếu còn rác sau token -> lấy token đầu tiên
  t = t.split(/\s+/)[0]?.trim() || "";
  return t;
}

function isLikelyJwt(token: string): boolean {
  // JWT thường có 2 dấu chấm
  return token.split(".").length === 3;
}

function normalizeRole(role: string): User["role"] | "" {
  const r = String(role || "").toLowerCase().trim();
  if (r === "candidate") return "candidate";
  if (r === "employer") return "employer";
  return "";
}

function pickErr(e: unknown, fallback: string): string {
  const err = e as AxiosError<ApiErr>;
  return err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail || err.message || fallback;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notis, setNotis] = useState<Noti[]>([]);
  const [loadingNotis, setLoadingNotis] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  // đọc cookies mỗi lần route change (đủ dùng)
  const auth = useMemo(() => {
    if (typeof window === "undefined") {
      return { token: "", user: null as User | null };
    }

    const tokenRaw = Cookies.get("token") || "";
    const token = cleanBearer(tokenRaw);

    const roleRaw = Cookies.get("role") || "";
    const role = normalizeRole(roleRaw);

    const email = (Cookies.get("email") || "").trim();

    // token không đúng dạng -> coi như chưa login
    if (!token || !isLikelyJwt(token) || !role || !email) {
      return { token: "", user: null as User | null };
    }

    return { token, user: { email, role } as User };
  }, [pathname]);

  const token = auth.token;
  const user = auth.user;

  // nếu cookie token đang lỗi (ví dụ "Bearer Bearer" hoặc rỗng) -> dọn luôn
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = Cookies.get("token") || "";
    const cleaned = cleanBearer(raw);

    // có raw mà cleaned không phải jwt => xóa để khỏi spam "jwt malformed"
    if (raw && (!cleaned || !isLikelyJwt(cleaned))) {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role", { path: "/" });
      Cookies.remove("email", { path: "/" });
    }
  }, [pathname]);

  // click outside -> close dropdowns
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // poll unread count
  useEffect(() => {
    if (!user || !token) {
      setUnreadCount(0);
      return;
    }

    let alive = true;

    const fetchCount = async () => {
      try {
        const res = await axios.get<UnreadCountRes>(`${API_BASE}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alive) return;
        setUnreadCount(Number(res.data?.count ?? 0));
      } catch {
        // BE chưa có -> im lặng
      }
    };

    fetchCount();

    const intervalId: ReturnType<typeof setInterval> = setInterval(fetchCount, 12000);
    return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, [user, token]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    Cookies.remove("email", { path: "/" });

    setMenuOpen(false);
    setNotiOpen(false);

    router.push("/");
    router.refresh();
  };

  const menuItems = [
    { href: "/#features", label: "Tính năng" },
    { href: "/#how-it-works", label: "Cách hoạt động" },
    { href: "/#for-whom", label: "Đối tượng sử dụng" },
  ];

  const fetchNotis = async () => {
    if (!user || !token) return;
    try {
      setLoadingNotis(true);
      const res = await axios.get<ListNotiRes>(`${API_BASE}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotis(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNotis([]);
    } finally {
      setLoadingNotis(false);
    }
  };

  const openNoti = () => {
    if (!user || !token) return;

    setMenuOpen(false);
    setNotiOpen((prev) => {
      const next = !prev;
      if (next) void fetchNotis();
      return next;
    });
  };

  const markReadAndGo = async (n: Noti) => {
    if (!user || !token) return;

    try {
      if (!n.isRead) {
        await axios.patch(`${API_BASE}/api/notifications/${n.id}/read`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUnreadCount((c) => Math.max(0, c - 1));
        setNotis((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      }
    } catch {
      // ignore
    }

    setNotiOpen(false);
    if (n.link) router.push(n.link);
  };

  const isCandidate = user?.role === "candidate";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" priority />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">LVCV - AI JobMatch</span>
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

          {isCandidate && (
            <Link
              href="/candidate/job"
              className={["hover:text-slate-900", pathname?.startsWith("/candidate/job") ? "text-slate-900 font-semibold" : ""].join(" ")}
              onClick={() => {
                setMenuOpen(false);
                setNotiOpen(false);
              }}
            >
              Danh sách việc làm
            </Link>
          )}

          {isCandidate && (
            <Link
              href="/candidate/dashboard"
              className={["hover:text-slate-900", pathname?.startsWith("/candidate/dashboard") ? "text-slate-900 font-semibold" : ""].join(" ")}
              onClick={() => {
                setMenuOpen(false);
                setNotiOpen(false);
              }}
            >
              Đánh giá CV & Gợi ý việc làm
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2" ref={wrapRef}>
          {!user ? (
            <>
              <Link href="/auth/login" className="text-xs font-medium text-slate-700 hover:text-slate-900">
                Đăng nhập
              </Link>
              <Link href="/auth/register" className="rounded-full bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800">
                Bắt đầu ngay
              </Link>
            </>
          ) : (
            <>
              {/* Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={openNoti}
                  className="relative rounded-full border border-slate-200 bg-white p-2 hover:border-slate-900"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {notiOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-medium text-slate-900">Thông báo</p>
                      <span className="text-[11px] text-slate-500">{unreadCount} chưa đọc</span>
                    </div>

                    <div className="max-h-80 overflow-auto">
                      {loadingNotis ? (
                        <div className="px-3 py-6 text-center text-slate-500">Đang tải...</div>
                      ) : notis.length === 0 ? (
                        <div className="px-3 py-6 text-center text-slate-500">Chưa có thông báo</div>
                      ) : (
                        notis.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => void markReadAndGo(n)}
                            className={["w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50", !n.isRead ? "bg-slate-50/70" : ""].join(" ")}
                          >
                            <div className="flex items-start gap-2">
                              {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500" />}
                              <div className="min-w-0">
                                <p className="text-slate-900 font-medium truncate">{n.title}</p>
                                <p className="text-slate-500 line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="px-3 py-2 border-t border-slate-100 bg-white">
                      <Link
                        href="/notifications"
                        className="block text-center text-[11px] font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setNotiOpen(false)}
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotiOpen(false);
                    setMenuOpen((p) => !p);
                  }}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">
                    {user.email[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-900">{user.email}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-md text-xs overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-medium text-slate-900">Tài khoản</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === "candidate" ? (
                        <Link
                          href="/candidate/profile"
                          className="block px-3 py-2 hover:bg-slate-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          Hồ sơ người dùng
                        </Link>
                      ) : (
                        <Link
                          href="/employer/dashboard"
                          className="block px-3 py-2 hover:bg-slate-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          Hồ sơ nhà tuyển dụng
                        </Link>
                      )}

                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600">
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
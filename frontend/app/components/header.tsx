"use client";

import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import ThemeToggle from "./ThemeToggle";

type User = {
  email: string;
  role: "candidate" | "employer";
};

type Noti = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  data?: {
    jobId?: number,
  };
};

type UnreadCountRes = { count: number };

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

  const {
    isConnected,                    // Trạng thái kết nối socket
    notifications: socketNotis,     // Notifications nhận từ socket
    unreadCount: socketUnread,      // Số chưa đọc từ socket
    setUnreadCount: setSocketUnread,// Setter để sync với API
    markAsRead: socketMarkAsRead,   // Hàm đánh dấu đã đọc
  } = useSocket();

  // State cho notifications (merge socket + API)
  const [notis, setNotis] = useState<Noti[]>([]);
  const [loadingNotis, setLoadingNotis] = useState(false);

  // State cho avatar/logo user
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

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

  // nếu cookie token đang lỗi 
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

  // Click outside -> close dropdowns
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


  // Chỉ fetch 1 lần khi mount để lấy count ban đầu
  // Sau đó socket sẽ tự động update real-time
  useEffect(() => {
    if (!user || !token) {
      setSocketUnread(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await axios.get<UnreadCountRes>(`${API_BASE}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSocketUnread(Number(res.data?.count ?? 0));
      } catch {
        // ignore
      }
    };
    // Fetch lần đầu
    fetchCount();
    // Không cần polling nữa vì có socket real-time
    // Nhưng giữ lại polling 60s để đảm bảo sync (backup)
    const intervalId = setInterval(fetchCount, 60000);
    return () => clearInterval(intervalId);
  }, [user, token, setSocketUnread]);

  // Fetch avatar/logo của user
  useEffect(() => {
    if (!user || !token) {
      setUserAvatarUrl(null);
      return;
    }

    const fetchAvatar = async () => {
      try {
        const endpoint = user.role === 'candidate'
          ? `${API_BASE}/api/candidates/me`
          : `${API_BASE}/api/employers/me`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const url = user.role === 'candidate'
          ? res.data?.avatarUrl
          : res.data?.logoUrl;

        setUserAvatarUrl(url || null);
      } catch {
        setUserAvatarUrl(null);
      }
    };

    fetchAvatar();
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

  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // load lần đầu (ví dụ user vào thẳng /#for-whom)
    setHash(window.location.hash || "");
  }, []);


  const menuItems = [
    { href: "/#features", hash: "#features", label: "Tính năng" },
    { href: "/#how-it-works", hash: "#how-it-works", label: "Cách hoạt động" },
    { href: "/#for-whom", hash: "#for-whom", label: "Đối tượng sử dụng" },
  ];

  // FETCH NOTIFICATIONS  
  const fetchNotis = async () => {
    if (!user || !token) return;
    try {
      setLoadingNotis(true);
      const res = await axios.get(`${API_BASE}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log('res :>> ', res);

      // Lấy data từ API (có thể là array hoặc object với key notifications)
      const apiNotis = res.data?.notifications || res.data || [];

      // MERGE SOCKET + API NOTIFICATIONS
      // Socket có thể có notifications mới chưa có trong API response
      // Merge và loại bỏ duplicate theo id
      const socketIds = new Set(socketNotis.map(n => n.id));
      const uniqueApiNotis = apiNotis.filter((n: Noti) => !socketIds.has(n.id));

      // Socket notifications đầu tiên (mới nhất), sau đó là API
      setNotis([...socketNotis, ...uniqueApiNotis]);
    } catch {
      // Nếu API lỗi, vẫn hiện socket notifications
      setNotis(socketNotis);
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

  // ĐÁNH DẤU ĐÃ ĐỌC VÀ NAVIGATE
  const markReadAndGo = async (n: Noti) => {
    if (!user || !token) return;

    try {
      if (!n.isRead) {
        // Gọi API đánh dấu đã đọc
        await axios.put(`${API_BASE}/api/notifications/${n.id}/read`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Cập nhật socket state
        socketMarkAsRead(n.id);

        // Cập nhật local state
        setNotis((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      }
      if (n.title === "📅 Lịch phỏng vấn mới!") {
        router.push('/candidate/profile#calendar-interview');
      }
      if (n.title === "Có ứng viên mới!") {
        const str = `${n.data}`;
        const object = JSON.parse(str);
        router.push(`/employer/jobs/${object.jobId}`);
        // console.log(`/ employer / job / ${object.jobId} `);
      }
    } catch {
      // ignore
    }

    setNotiOpen(false);
  };

  const isCandidate = user?.role === "candidate";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm
                       dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" priority />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">LVCV - AI JobMatch</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Chấm điểm CV - Tìm việc phù hợp</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap mx-6">
          {menuItems.map((item) => {
            const isActive = pathname === "/" && hash === item.hash;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "hover:text-slate-900 dark:hover:text-white",
                  isActive ? "text-slate-900 font-semibold dark:text-slate-100" : "",
                ].join(" ")}
                onClick={() => {
                  setMenuOpen(false);
                  setNotiOpen(false);
                  setHash(item.hash);
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {isCandidate && (
            <Link
              href="/candidate/job"
              className={[
                "hover:text-slate-900 dark:hover:text-white",
                pathname?.startsWith("/candidate/job") ? "text-slate-900 font-semibold dark:text-slate-100" : "",
              ].join(" ")}
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
              className={[
                "hover:text-slate-900 dark:hover:text-white",
                pathname?.startsWith("/candidate/dashboard") ? "text-slate-900 font-semibold dark:text-slate-100" : "",
              ].join(" ")}
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
        <div className="flex items-center gap-2 flex-shrink-0" ref={wrapRef}>
          {!user ? (
            <>
              <Link href="/auth/login" className="text-xs font-medium text-slate-700 hover:text-slate-900
                                                 dark:text-slate-200 dark:hover:text-white">
                Đăng nhập
              </Link>
              <Link href="/auth/register"
                className="rounded-full bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800
                           dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Bắt đầu ngay
              </Link>
            </>
          ) : (
            <>
              {/* Theme button */}
              <ThemeToggle />

              {/* Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={openNoti}
                  className="relative rounded-full border border-slate-200 bg-white p-2 hover:border-slate-900
                             dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-200"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-slate-700 dark:text-slate-200" />

                  {/* Badge hiển thị số chưa đọc (từ socket) */}
                  {socketUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white flex items-center justify-center text-[10px] text-white font-bold">
                      {socketUnread > 9 ? "9+" : socketUnread}
                    </span>
                  )}

                  {/* Indicator xanh khi socket connected */}
                  {isConnected && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                  )}
                </button>

                {/* ========== NOTIFICATION DROPDOWN ========== */}
                {notiOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden text-xs
               dark:border-slate-800 dark:bg-slate-900"
                    role="menu"
                    aria-label="Danh sách thông báo"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Thông báo</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {socketUnread} chưa đọc
                        </span>
                        {isConnected ? (
                          <span className="text-[10px] text-green-600">● Live</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">○ Offline</span>
                        )}
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-auto bg-white dark:bg-slate-900">
                      {loadingNotis ? (
                        <div className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                          Đang tải...
                        </div>
                      ) : notis.length === 0 ? (
                        <div className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                          Chưa có thông báo
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notis.map((n) => (
                            <li key={n.id}>
                              <button
                                type="button"
                                onClick={() => markReadAndGo(n)}
                                className={[
                                  "flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-slate-50",
                                  "dark:hover:bg-slate-800",
                                  !n.isRead ? "bg-slate-50/70 dark:bg-slate-800/40" : "",
                                ].join(" ")}
                                role="menuitem"
                              >
                                {!n.isRead && (
                                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-slate-900 font-medium dark:text-slate-100">
                                    {n.title}
                                  </p>
                                  <p className="text-slate-500 line-clamp-2 dark:text-slate-300">
                                    {n.message}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                      <Link
                        href="/notifications"
                        className="block text-center text-[11px] font-medium text-slate-700 hover:text-slate-900
                   dark:text-slate-200 dark:hover:text-white"
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
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900
                             dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userAvatarUrl?.startsWith('/uploads') ? `${API_BASE}${userAvatarUrl} ` : '/placeholder.png'}
                    alt="Avatar"
                    className="h-6 w-6 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  <div className="hidden sm:flex flex-col text-left max-w-[150px]">
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{user.email}</span>
                    <span className="text-[10px] text-slate-500 uppercase dark:text-slate-400">{user.role}</span>
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-md text-xs overflow-hidden
                                  dark:border-slate-800 dark:bg-slate-900">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Tài khoản</p>
                      <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === "candidate" ? (
                        <Link
                          href="/candidate/profile"
                          className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          Hồ sơ người dùng
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/employer/profile"
                            className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                            onClick={() => setMenuOpen(false)}
                          >
                            Hồ sơ nhà tuyển dụng
                          </Link>

                          <Link
                            href="/employer/dashboard"
                            className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                            onClick={() => setMenuOpen(false)}
                          >
                            Quản lý công việc
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600 dark:hover:bg-slate-800"
                      >
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

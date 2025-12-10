"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";

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

const API_BASE = "http://localhost:8080";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);

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

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const user = useMemo<User | null>(() => {
    if (typeof window === "undefined") return null;

    const token = Cookies.get("token");
    const role = Cookies.get("role") as User["role"] | undefined;
    const email = Cookies.get("email");

    if (token && role && email) return { email, role };
    return null;
  }, [pathname, authTick]);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return Cookies.get("token") || "";
  }, [pathname, authTick]);

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
        // BE chưa có -> im lặng
      }
    };

    // Fetch lần đầu
    fetchCount();

    // Không cần polling nữa vì có socket real-time
    // Nhưng giữ lại polling 60s để đảm bảo sync (backup)
    const intervalId = setInterval(fetchCount, 60000);
    return () => clearInterval(intervalId);
  }, [user, token, setSocketUnread]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    Cookies.remove("email", { path: "/" });

    setMenuOpen(false);
    setNotiOpen(false);
    setAuthTick((t) => t + 1);

    router.push("/");
    router.refresh();
  };

  const menuItems = [
    { href: "/#features", label: "Tính năng" },
    { href: "/#how-it-works", label: "Cách hoạt động" },
    { href: "/#for-whom", label: "Đối tượng sử dụng" },
  ];

  // FETCH NOTIFICATIONS  
  const fetchNotis = async () => {
    if (!user || !token) return;
    try {
      setLoadingNotis(true);
      const res = await axios.get(`${API_BASE}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const openNoti = async () => {
    if (!user || !token) return;
    setMenuOpen(false);
    setNotiOpen((prev) => {
      const next = !prev;
      if (next) fetchNotis();
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

          {/*  Candidate-only: Danh sách việc làm */}
          {isCandidate && (
            <Link
              href="/candidate/job"
              className={[
                "hover:text-slate-900",
                pathname?.startsWith("/job") ? "text-slate-900 font-semibold" : "",
              ].join(" ")}
              onClick={() => {
                setMenuOpen(false);
                setNotiOpen(false);
              }}
            >
              Danh sách việc làm
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
              <Link
                href="/auth/register"
                className="rounded-full bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800"
              >
                Bắt đầu ngay
              </Link>
            </>
          ) : (
            <>
              {/* ========== BELL ICON VỚI BADGE ========== */}
              <div className="relative">
                <button
                  type="button"
                  onClick={openNoti}
                  className="relative rounded-full border border-slate-200 bg-white p-2 hover:border-slate-900"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-slate-700" />

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
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-medium text-slate-900">Thông báo</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{socketUnread} chưa đọc</span>
                        {/* Hiển thị trạng thái socket */}
                        {isConnected ? (
                          <span className="text-[10px] text-green-600">● Live</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">○ Offline</span>
                        )}
                      </div>
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
                            onClick={() => markReadAndGo(n)}
                            className={[
                              "w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50",
                              !n.isRead ? "bg-slate-50/70" : "",
                            ].join(" ")}
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
                    {user.email[0].toUpperCase()}
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
                          href="/candidate/dashboard"
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

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
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
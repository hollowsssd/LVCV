"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Header() {
  const pathname = usePathname();

  // nav config
  const nav = [
    { label: "Việc làm", href: "/jobs" },
    { label: "Công ty", href: "/companies" },
    { label: "Cẩm nang", href: "/guide" },
  ];

  // xác định active (hỗ trợ cả route động /foo/123)
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const baseItem =
    "relative inline-flex items-center h-10 text-sm font-semibold text-neutral-700 dark:text-neutral-200 transition";
  const activeBar =
    "pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full bg-black dark:bg-white rounded-full";
  const hoverBar =
    "pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 bg-black/70 dark:bg-white/70 rounded-full transition-[left,width] duration-200 group-hover:left-0 group-hover:w-full";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative flex items-center">
          <Image
            src="/logo.png"
            alt="LVCV Logo"
            width={110}
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`group ${baseItem} ${
                isActive(item.href)
                  ? "text-black dark:text-white"
                  : "hover:text-black dark:hover:text-white"
              }`}
            >
              {item.label}
              <span className={isActive(item.href) ? activeBar : hoverBar} />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition font-semibold"
          >
            Đăng nhập
          </Link>
          <Link
            href="/profile_com"
            className="rounded-lg px-3 py-1.5 text-sm bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-semibold"
          >
            Đăng tuyển
          </Link>
        </div>
      </div>
    </header>
  );
}
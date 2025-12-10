"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
    page: number;
    totalPages: number;
    basePath?: string;        // "/employer/dashboard"
    paramName?: string;       // "page"
    maxPagesToShow?: number;  // 5
    cleanFirstPage?: boolean; // bỏ ?page=1
};

export default function Pagination({
    page,
    totalPages,
    basePath = "",
    paramName = "page",
    maxPagesToShow = 5,
    cleanFirstPage = true,
}: Props) {
    const searchParams = useSearchParams();
    if (totalPages <= 1) return null;

    const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
    const current = clamp(page, 1, totalPages);

    const makeHref = (p: number) => {
        const sp = new URLSearchParams(searchParams.toString());
        if (cleanFirstPage && p <= 1) sp.delete(paramName);
        else sp.set(paramName, String(p));
        const qs = sp.toString();
        return qs ? `${basePath}?${qs}` : (basePath || "");
    };

    // Window 5 trang quanh current
    const half = Math.floor(maxPagesToShow / 2);
    let start = clamp(current - half, 1, totalPages);
    let end = clamp(start + maxPagesToShow - 1, 1, totalPages);
    start = clamp(end - maxPagesToShow + 1, 1, totalPages);

    const windowPages: number[] = [];
    for (let i = start; i <= end; i++) windowPages.push(i);

    const prev = Math.max(1, current - 1);
    const next = Math.min(totalPages, current + 1);

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-300">
                Trang{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">{current}</span> /{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
                {/* FIRST */}
                <Link
                    href={makeHref(1)}
                    aria-disabled={current === 1}
                    className={`rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-700
                        hover:border-slate-900
                        dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-slate-200
                        ${current === 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                    First
                </Link>

                {/* PREV */}
                <Link
                    href={makeHref(prev)}
                    aria-disabled={current === 1}
                    className={`rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-700
                        hover:border-slate-900
                        dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-slate-200
                        ${current === 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                    Prev
                </Link>

                <div className="flex items-center gap-1">
                    {/* 1 ... */}
                    {start > 1 && (
                        <>
                            <PageBtn p={1} current={current} href={makeHref(1)} />
                            {start > 2 && <span className="px-1 text-slate-400 dark:text-slate-500">…</span>}
                        </>
                    )}

                    {/* window pages */}
                    {windowPages.map((p) => (
                        <PageBtn key={p} p={p} current={current} href={makeHref(p)} />
                    ))}

                    {/* ... last */}
                    {end < totalPages && (
                        <>
                            {end < totalPages - 1 && <span className="px-1 text-slate-400 dark:text-slate-500">…</span>}
                            <PageBtn p={totalPages} current={current} href={makeHref(totalPages)} />
                        </>
                    )}
                </div>

                {/* NEXT */}
                <Link
                    href={makeHref(next)}
                    aria-disabled={current === totalPages}
                    className={`rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-700
                        hover:border-slate-900
                        dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-slate-200
                        ${current === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                    Next
                </Link>

                {/* LAST */}
                <Link
                    href={makeHref(totalPages)}
                    aria-disabled={current === totalPages}
                    className={`rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-700
                        hover:border-slate-900
                        dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-slate-200
                        ${current === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                    Last
                </Link>
            </div>
        </nav>
    );
}

function PageBtn({ p, current, href }: { p: number; current: number; href: string }) {
    const active = p === current;

    return (
        <Link
            href={href}
            className={`h-9 w-9 grid place-items-center rounded-full border text-sm transition
        ${active
                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                    : "border-slate-200 bg-white/70 text-slate-700 hover:border-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-slate-200"
                }`}
        >
            {p}
        </Link>
    );
}

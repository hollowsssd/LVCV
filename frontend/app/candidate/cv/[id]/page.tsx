"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import type { CvEvaluateReport } from "@/app/candidate/cv/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

type ApiErrorResponse = { message?: string; detail?: string };

type CvDetailApiRes = {
  id: number;
  score?: number;
  updatedAt?: string;
  feedback?: string | null; // report được lưu ở feedback
  title?: string | null;
};

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-right shadow-sm
                    dark:border-slate-700 dark:bg-slate-900/80">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {value}/100
      </p>
    </div>
  );
}

function ListBox({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-100 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
      : "border-amber-100 bg-amber-50/80 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100";

  return (
    <div className={`rounded-3xl border p-5 space-y-2 ${cls}`}>
      <h3 className="text-sm font-semibold">
        {tone === "good" ? "✅ " : "⚠️ "}
        {title}
      </h3>
      {items.length ? (
        <ul className="list-disc list-inside text-xs space-y-1.5">
          {items.map((s, i) => (
            <li key={`${i}-${s.slice(0, 20)}`}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs opacity-80">—</p>
      )}
    </div>
  );
}

function extractReport(api: CvDetailApiRes): CvEvaluateReport | null {
  if (!api.feedback) return null;
  try {
    return JSON.parse(api.feedback) as CvEvaluateReport;
  } catch {
    return null;
  }
}

export default function CvDetailPage({ params }: { params: { id: string } }) {
  const token = Cookies.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<CvDetailApiRes | null>(null);
  const [report, setReport] = useState<CvEvaluateReport | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        const res = await axios.get<CvDetailApiRes>(`${API_BASE}/api/cvs/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!mounted) return;

        setApiData(res.data);
        setReport(extractReport(res.data));
      } catch (err) {
        const e = err as AxiosError<ApiErrorResponse>;
        if (!mounted) return;
        setApiData(null);
        setReport(null);
        setErrMsg(e.response?.data?.message ?? "Không tải được CV.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [params.id, token]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm text-sm text-slate-600
                      dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
        Đang tải báo cáo...
      </div>
    );
  }

  if (!apiData || !report) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                      dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Không tải được báo cáo
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {errMsg ?? "Thiếu feedback JSON trong /api/cvs/:id"}
        </p>
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
        >
          ← Về Dashboard
        </Link>
      </div>
    );
  }

  const updatedAt = apiData.updatedAt ? apiData.updatedAt.slice(0, 10) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Báo cáo phân tích CV
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            CV ID:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {apiData.id}
            </span>{" "}
            · Lần phân tích:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {updatedAt}
            </span>
          </p>
          {apiData.title ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Title: <span className="font-medium">{apiData.title}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <ScoreBox label="CV Score" value={report.score} />
          <ScoreBox label="Mức phù hợp" value={report.fitScore} />
        </div>
      </div>

      {/* Tổng quan */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-3
                          dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Job title (AI)</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {report.jobTitle || "—"}
            </p>
          </div>
          <div className="space-y-1 text-right max-w-xs">
            <p className="text-xs text-slate-500 dark:text-slate-400">recommend_query</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 break-words">
              {report.recommendQuery || "—"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                        dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Nhận xét tổng quan
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {report.summary || "—"}
          </p>
        </div>
      </section>

      {/* Điểm mạnh / yếu / chi tiết */}
      <section className="grid md:grid-cols-3 gap-6">
        <ListBox title="Điểm mạnh" items={report.strengths ?? []} tone="good" />
        <ListBox title="Hạn chế" items={report.weaknesses ?? []} tone="warn" />

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-3 shadow-sm
                        dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            📊 Điểm chi tiết
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Trình bày:{" "}
              <b>{report.detailScores?.trinh_bay ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Nội dung:{" "}
              <b>{report.detailScores?.noi_dung ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Kinh nghiệm:{" "}
              <b>{report.detailScores?.kinh_nghiem ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Kỹ năng:{" "}
              <b>{report.detailScores?.ky_nang ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 col-span-2
                            dark:border-slate-700 dark:bg-slate-900/60">
              Thành tựu:{" "}
              <b>{report.detailScores?.thanh_tuu ?? 0}</b>
            </div>
          </div>
        </div>
      </section>

      {/* Góp ý chi tiết */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                          dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          ✏️ Góp ý chi tiết
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {report.fixes || "—"}
        </p>
      </section>

      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
        >
          ← Về Dashboard
        </Link>
      </div>
    </div>
  );
}
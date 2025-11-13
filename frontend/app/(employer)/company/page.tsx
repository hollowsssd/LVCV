"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import {
  Building2,
  Upload,
  Users,
  MapPin,
  Tag as TagIcon,
  Briefcase,
  Save,
  CheckCircle2,
} from "lucide-react";

/* =========================
   Constants trùng với CompaniesPage
========================= */
const INDUSTRIES = ["Software", "Fintech", "E-commerce", "AI/ML", "Data", "Mobile"];
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

/* =========================
   Type KHỚP VỚI LIST/DETAIL
========================= */
type Company = {
  id: string;
  name: string;
  logo: string;
  cover?: string;
  industry: string;
  hq: string;          // Thành phố / HQ (ví dụ: TP.HCM)
  size: string;
  address?: string;    // ➜ mới: địa chỉ chi tiết
  email?: string;
  phone?: string;
  website?: string;
  stack: string[];
  openRoles: number;
  blurb: string;
};

/* =========================
   Small UI (type-safe, always controlled)
========================= */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  hint?: string;
};
function Input(props: InputProps) {
  const { label, required, hint, value, type, ...others } = props;

  let safeValue: string | number = "";
  if (typeof value === "number") safeValue = value;
  else if (typeof value === "string") safeValue = value;
  else safeValue = "";

  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        {...others}
        type={type}
        value={safeValue}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      />
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
};
function Textarea(props: TextareaProps) {
  const { label, required, value, ...others } = props;
  const safeValue = typeof value === "string" ? value : "";

  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <textarea
        {...others}
        value={safeValue}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
};
function Select(props: SelectProps) {
  const { label, required, value, children, ...others } = props;
  const safeValue =
    typeof value === "string" || typeof value === "number" ? value : "";

  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <select
        {...others}
        value={safeValue}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
      >
        {children}
      </select>
    </label>
  );
}

function ChipsInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };

  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2">
        <TagIcon size={16} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder || "Nhập công nghệ và nhấn Enter (VD: Next.js)"}
          className="flex-1 bg-transparent outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Thêm
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((t) => (
            <span
              key={t}
              className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700"
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== t))}
                className="opacity-50 group-hover:opacity-100"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 p-5 md:p-6 backdrop-blur-sm">
      <h2 className="text-base md:text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* =========================
   Preview Card (chỉ show tóm tắt)
========================= */
function CompanyPreview({ c }: { c: Company }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/40 p-5">
      <h3 className="font-semibold text-sm mb-2">Xem trước </h3>

      <div className="group flex flex-col h-full">
        <div className="flex items-start gap-3">
          <Image
            src={c.logo || "/logo.png"}
            alt={`${c.name || "Company"} logo`}
            width={48}
            height={48}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight line-clamp-1">
              {c.name || "Tên công ty"}
            </p>

            <div className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1">
                <Building2 size={14} /> {c.industry || "Ngành nghề"}
              </span>
              {c.size && (
                <span className="inline-flex items-center gap-1">
                  <Users size={14} /> {c.size}
                </span>
              )}
              {c.hq && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {c.hq}
                </span>
              )}
            </div>

            {/* KHÔNG hiển thị email/phone/website/address ở card danh sách */}

            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
              {c.blurb || "Giới thiệu ngắn của công ty hiển thị ở thẻ danh sách."}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(c.stack.length ? c.stack : ["Next.js", "React"])
                .slice(0, 3)
                .map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700"
                  >
                    {t}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-1 flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400 inline-flex items-center gap-1">
            <Briefcase size={14} /> {(c.openRoles ?? 0)} vị trí
          </span>

          <div className="flex items-center gap-2">
            <button className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700">
              Theo dõi
            </button>
            <Link
              href="#"
              className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
const STORAGE_KEY = "add_company_draft_v1";

export default function AddCompanyPage() {
  const [draft, setDraft] = React.useState<Company>({
    id: "tmp",
    name: "",
    logo: "/logo.png",
    cover: "",
    industry: "",
    hq: "",
    size: "",
    address: "",   // ➜ mới
    email: "",
    phone: "",
    website: "",
    stack: [],
    openRoles: 0,
    blurb: "",
  });

  const set = <K extends keyof Company>(k: K, v: Company[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // load auto
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDraft(JSON.parse(raw));
    } catch {}
  }, []);
  // autosave
  React.useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 900);
    return () => clearTimeout(t);
  }, [draft]);

  // ── Validate helpers
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizeWebsite = (value: string) => {
    const v = value.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };
  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };
  const phoneAllowed = /^[+0-9\s\-()]*$/;
  const digitsCount = (s: string) => (s.match(/\d/g) || []).length;

  // validate
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Tên công ty là bắt buộc.");
  if (!draft.industry.trim()) errors.push("Ngành nghề là bắt buộc.");
  if (!draft.hq.trim()) errors.push("Trụ sở là bắt buộc.");
  if (!draft.size.trim()) errors.push("Quy mô là bắt buộc.");
  if (!draft.blurb.trim()) errors.push("Giới thiệu ngắn là bắt buộc.");
  if (draft.email && !emailRe.test(draft.email.trim())) {
    errors.push("Email không hợp lệ.");
  }
  if (draft.website) {
    const w = normalizeWebsite(draft.website);
    if (!isValidUrl(w)) errors.push("Website không hợp lệ.");
  }
  if (draft.phone) {
    if (!phoneAllowed.test(draft.phone)) {
      errors.push("Số điện thoại chỉ cho phép ký tự +, số, khoảng trắng, -, ( ).");
    } else if (digitsCount(draft.phone) < 8) {
      errors.push("Số điện thoại phải có tối thiểu 8 chữ số.");
    }
  }
  if (draft.address && draft.address.trim().length < 5) {
    errors.push("Địa chỉ công ty quá ngắn (tối thiểu 5 ký tự).");
  }

  const handleSubmit = async () => {
    if (errors.length) {
      alert("Vui lòng kiểm tra lại thông tin.");
      return;
    }
    const payload: Company = {
      ...draft,
      address: draft.address?.trim() || undefined,
      email: draft.email?.trim() || undefined,
      phone: draft.phone?.trim() || undefined,
      website: draft.website ? normalizeWebsite(draft.website) : undefined,
      openRoles: Math.max(0, Number(draft.openRoles || 0)),
    };

    // TODO: call API tạo company
    console.log("SUBMIT COMPANY:", payload);
    alert("✅ Mock: Tạo công ty thành công!");
    // router.push(`/detail_com/${newId}`)
  };

  // normalize on blur
  const onBlurEmail = (value: string) => value.trim().toLowerCase();
  const onBlurWebsite = (value: string) => (value.trim() ? normalizeWebsite(value) : "");
  const onBlurPhone = (value: string) => value.trim();
  const onBlurAddress = (value: string) => value.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Thêm công ty</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT FORM */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Thông tin cơ bản">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên công ty"
                  required
                  placeholder="VD: NovaTech"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <Select
                  label="Ngành nghề"
                  required
                  value={draft.industry}
                  onChange={(e) => set("industry", e.target.value)}
                >
                  <option value="">Chọn ngành</option>
                  {INDUSTRIES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Trụ sở (HQ)"
                  required
                  placeholder="TP.HCM / Hà Nội / Đà Nẵng..."
                  value={draft.hq}
                  onChange={(e) => set("hq", e.target.value)}
                />
                <Select
                  label="Quy mô"
                  required
                  value={draft.size}
                  onChange={(e) => set("size", e.target.value)}
                >
                  <option value="">Chọn quy mô</option>
                  {SIZES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Địa chỉ công ty"
                  placeholder="Ví dụ: Tầng 10, 123 Nguyễn Huệ, Quận 1, TP.HCM"
                  value={draft.address}
                  onChange={(e) => set("address", e.target.value)}
                  onBlur={(e) => set("address", onBlurAddress(e.target.value))}
             
                />

                <Input
                  label="Email liên hệ"
                  type="email"
                  autoComplete="email"
                  placeholder="hr@company.com"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={(e) => set("email", onBlurEmail(e.target.value))}
                
                />
                <Input
                  label="Số điện thoại"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\s\-()]{8,}"
                  placeholder="+84 912 345 678"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  onBlur={(e) => set("phone", onBlurPhone(e.target.value))}
                  
                />

                <Input
                  label="Website"
                  type="url"
                  autoComplete="url"
                  placeholder="company.com hoặc https://company.com"
                  value={draft.website}
                  onChange={(e) => set("website", e.target.value)}
                  onBlur={(e) => set("website", onBlurWebsite(e.target.value))}
           
                />

                <Input
                  label="Vị trí đang tuyển"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  required
                  value={draft.openRoles}
                  onChange={(e) =>
                    set("openRoles", Math.max(0, Number(e.target.value || 0)))
                  }
                />

                {/* Logo */}
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium">Logo công ty</span>
                  <div className="mt-1 flex items-center gap-3">
                    <Image
                      src={draft.logo || "/logo.png"}
                      alt="logo"
                      width={60}
                      height={60}
                      className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white"
                    />
                    <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-neutral-400 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm">
                      <Upload size={16} />
                      Chọn logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          set("logo", URL.createObjectURL(f));
                        }}
                      />
                    </label>
                  </div>
                </label>

                {/* Cover */}
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium">Ảnh cover</span>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="relative w-40 h-20 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700">
                      {draft.cover ? (
                        <Image
                          src={draft.cover}
                          alt="cover"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-300 dark:bg-neutral-800" />
                      )}
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-neutral-400 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm">
                      <Upload size={16} />
                      Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          set("cover", URL.createObjectURL(f));
                        }}
                      />
                    </label>
                  </div>
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Tech stack">
              <ChipsInput
                label="Stack (tối đa hiển thị 4 tag ở card)"
                value={draft.stack}
                onChange={(v) => set("stack", v)}
                placeholder="VD: Next.js, React, TypeScript, Tailwind"
              />
            </SectionCard>

            <SectionCard title="Giới thiệu">
              <Textarea
                label="Giới thiệu ngắn hiển thị ở thẻ công ty"
                required
                rows={3}
                value={draft.blurb}
                onChange={(e) => set("blurb", e.target.value)}
                placeholder="Sản phẩm số cho hàng triệu người dùng. Văn hoá chủ động, ship nhanh..."
              />
            </SectionCard>

            {errors.length > 0 && (
              <div className="rounded-xl border border-rose-300/70 bg-rose-50/70 p-3 text-sm">
                <b>Vui lòng kiểm tra:</b>
                <ul className="list-disc pl-5 mt-1">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
                }
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                <Save size={16} /> Lưu nháp
              </button>

              <button
                disabled={errors.length > 0}
                onClick={handleSubmit}
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 inline-flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Tạo công ty
              </button>
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="lg:col-span-1 space-y-4">
            <CompanyPreview c={draft} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
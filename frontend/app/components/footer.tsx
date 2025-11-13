"use client";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 text-sm">
      <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-neutral-600 dark:text-neutral-400">
        
        {/* ==== Logo + Slogan ==== */}
        <div className="flex flex-col">
          <div className="relative h-18 w-48 mb-4">
            <Image
              src="/logo.png" // thay bằng ảnh logo thật của bạn
              alt="LVCV Logo"
              fill
              priority
              className="object-contain"
            />
          </div>

        </div>

        {/* ==== Khám phá ==== */}
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            Khám phá
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="#" className="hover:underline">Việc làm</Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">Công ty</Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">Sự kiện</Link>
            </li>
          </ul>
        </div>

        {/* ==== Tài nguyên ==== */}
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            Tài nguyên
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="#" className="hover:underline">Cẩm nang nghề nghiệp</Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">Hướng dẫn viết CV</Link>
            </li>
          </ul>
        </div>

        {/* ==== Pháp lý ==== */}
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            Pháp lý
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="#" className="hover:underline">Điều khoản</Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">Quyền riêng tư</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ==== Copyright ==== */}
      <div className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-500">
        © {new Date().getFullYear()} <span className="font-semibold">LVCV</span>. All rights reserved.
      </div>
    </footer>
  );
}
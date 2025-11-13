'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, UserRound, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // ✅ hiển thị lỗi realtime
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  // ✅ Regex email chuẩn
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ Validate email
  React.useEffect(() => {
    if (email === '') return setEmailError(null);
    setEmailError(emailRegex.test(email) ? null : 'Email không hợp lệ');
  }, [email]);

  // ✅ Validate password
  React.useEffect(() => {
    if (password === '') return setPasswordError(null);
    setPasswordError(password.length >= 6 ? null : 'Mật khẩu phải ≥ 6 ký tự');
  }, [password]);

  // ✅ Validate confirm password
  React.useEffect(() => {
    if (confirm === '') return setConfirmError(null);
    setConfirmError(confirm === password ? null : 'Mật khẩu nhập lại không khớp');
  }, [confirm, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block submit nếu có lỗi
    if (emailError || passwordError || confirmError) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log({ name, email, password });
      alert("Tạo tài khoản thành công!");
      // TODO: Chuyển hướng sang login
      // router.push('/login')
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    loading ||
    !name ||
    !email ||
    !password ||
    !confirm ||
    emailError ||
    passwordError ||
    confirmError;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-4">
      

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

     <div className="flex flex-col items-center mb-6">
          <Link
            href="/"
            className="relative h-14 w-40 hover:opacity-90 transition"
          >
            <Image
              src="/logo.png"
              alt="LVCV Logo"
              fill
              priority
              className="object-contain"
            />
          </Link>          <h1 className="mt-4 text-2xl font-semibold">Tạo tài khoản</h1>
        </div>


        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6"
        >
          {/* FULL NAME */}
          <label className="text-sm font-medium">Họ tên</label>
          <div className="mt-2 mb-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <UserRound size={18}/>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-transparent outline-none"
              required
            />
          </div>

          {/* EMAIL */}
          <label className="text-sm font-medium">Email</label>
          <div className="mt-2 mb-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <Mail size={18}/>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent outline-none"
              required
            />
          </div>
          {emailError && <p className="text-xs text-red-500 mb-2">{emailError}</p>}

          {/* PASSWORD */}
          <label className="text-sm font-medium">Mật khẩu</label>
          <div className="mt-2 mb-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <Lock size={18}/>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="p-1 hover:opacity-60"
            >
              {show ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          {passwordError && <p className="text-xs text-red-500 mb-2">{passwordError}</p>}

          {/* CONFIRM PASSWORD */}
          <label className="text-sm font-medium">Nhập lại mật khẩu</label>
          <div className="mt-2 mb-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <Lock size={18}/>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent outline-none"
              required
            />
          </div>
          {confirmError && <p className="text-xs text-red-500 mb-2">{confirmError}</p>}

          {/* SUBMIT */}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý…' : 'Đăng ký'}
          </button>

          {/* Login */}
          <p className="mt-5 text-center text-sm">
            Đã có tài khoản?
            <Link href="/login" className="underline underline-offset-4 ml-1">
              Đăng nhập
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
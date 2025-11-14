'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, UserRound, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Role = 'CANDIDATE' | 'EMPLOYER' | '';

export default function RegisterPage() {
  const router = useRouter();

  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [role, setRole] = React.useState<Role>('');
  const [loading, setLoading] = React.useState(false);

  // real-time errors
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [roleError, setRoleError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  React.useEffect(() => {
    if (email === '') return setEmailError(null);
    setEmailError(emailRegex.test(email) ? null : 'Email không hợp lệ');
  }, [email]);

  React.useEffect(() => {
    if (password === '') return setPasswordError(null);
    setPasswordError(password.length >= 6 ? null : 'Mật khẩu phải ≥ 6 ký tự');
  }, [password]);

  React.useEffect(() => {
    if (confirm === '') return setConfirmError(null);
    setConfirmError(confirm === password ? null : 'Mật khẩu nhập lại không khớp');
  }, [confirm, password]);

  React.useEffect(() => {
    if (role) setRoleError(null);
  }, [role]);
const API = "http://localhost:8080"; // hoặc URL backend của bạn

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // validate role
    if (!role) {
      setRoleError('Vui lòng chọn loại tài khoản');
      return;
    }

    // Block submit nếu có lỗi
    if (emailError || passwordError || confirmError) return;

    setLoading(true);
    try {
      // Gọi API đăng ký (thay URL bằng backend thực của bạn)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.message || 'Đăng ký thất bại, thử lại sau.';
        setSubmitError(msg);
        return;
      }

      // Thành công
      // Bạn có thể show toast / modal ở đây
      // Redirect theo role
      if (role === 'CANDIDATE') {
        router.push('/profile'); // chỉnh nếu route khác
      } else if (role === 'EMPLOYER') {
        router.push('/recruiter/dashboard'); // chỉnh nếu route khác
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại.');
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
    !role ||
    !!emailError ||
    !!passwordError ||
    !!confirmError;

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
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Tạo tài khoản</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm p-6"
        >
          {/* FULL NAME */}
  

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

          {/* ROLE */}
          <label className="text-sm font-medium">Bạn là</label>
          <div className="mt-2 mb-3 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="CANDIDATE"
                checked={role === 'CANDIDATE'}
                onChange={() => setRole('CANDIDATE')}
                className="accent-black dark:accent-white"
              />
              <span className="text-sm">Người dùng</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="EMPLOYER"
                checked={role === 'EMPLOYER'}
                onChange={() => setRole('EMPLOYER')}
                className="accent-black dark:accent-white"
              />
              <span className="text-sm">Nhà tuyển dụng</span>
            </label>
          </div>
          {roleError && <p className="text-xs text-red-500 mb-2">{roleError}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={disabled}
            className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý…' : 'Đăng ký'}
          </button>

          {submitError && <p className="text-sm text-center text-red-500 mt-3">{submitError}</p>}

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
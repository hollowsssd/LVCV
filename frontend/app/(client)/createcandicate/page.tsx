// app/(client)/candidates/new/page.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';

export default function AddCandidatePage() {
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [sex, setSex] = React.useState<'male' | 'female' | null>(null);
  const [address, setAddress] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-9])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{4})$/;

  // Preview ảnh khi chọn
  React.useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  // Validation
  const validate = (): boolean => {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (VD: 0987654321)');
      return false;
    }
    if (!dob) {
      setError('Vui lòng chọn ngày sinh');
      return false;
    }
    if (sex === null) {
      setError('Vui lòng chọn giới tính');
      return false;
    }
    setError(null);
    return true;
  };

  // Xử lý chọn ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Ảnh phải nhỏ hơn 3MB');
      return;
    }
    setAvatarFile(file);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('phone', phone.trim());
    formData.append('dob', dob);
    formData.append('sex', sex === 'male' ? '1' : '0');
    formData.append('address', address.trim());
    formData.append('summary', summary.trim());
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Lỗi server');
      }

      setSuccess('Thêm ứng viên thành công!');
      // Reset form
      setFullName('');
      setPhone('');
      setDob('');
      setSex(null);
      setAddress('');
      setSummary('');
      setAvatarFile(null);
      setAvatarPreview(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setPhone('');
    setDob('');
    setSex(null);
    setAddress('');
    setSummary('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950">
      <Header />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">Thêm ứng viên mới</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Điền đầy đủ thông tin để tạo hồ sơ ứng viên
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 lg:p-12">
          {/* Thông báo */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl">
              {success}
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:border-black dark:focus:border-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:border-black dark:focus:border-white outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <label className="block text-sm font-medium mb-2">Ngày sinh *</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:border-black dark:focus:border-white outline-none transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Giới tính *</label>
              <div className="flex gap-6">
                <label className={`flex-1 py-3 px-6 rounded-xl border text-center cursor-pointer transition ${sex === 'male' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                  <input type="radio" name="sex" className="hidden" checked={sex === 'male'} onChange={() => setSex('male')} />
                  Nam
                </label>
                <label className={`flex-1 py-3 px-6 rounded-xl border text-center cursor-pointer transition ${sex === 'female' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                  <input type="radio" name="sex" className="hidden" checked={sex === 'female'} onChange={() => setSex('female')} />
                  Nữ
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium mb-2">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Quận 1, TP.HCM"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:border-black dark:focus:border-white outline-none transition"
            />
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium mb-2">Tóm tắt kinh nghiệm</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="Mô tả ngắn về kinh nghiệm, kỹ năng nổi bật..."
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:border-black dark:focus:border-white outline-none transition resize-none"
            />
          </div>

          {/* Avatar */}
          <div className="mt-8">
            <label className="block text-sm font-medium mb-3">Ảnh đại diện</label>
            <div className="flex justify-center">
              <label className="cursor-pointer">
                {avatarPreview ? (
                  <div className="relative inline-block">
                    <img src={avatarPreview} alt="Preview" className="w-48 h-48 object-cover rounded-full border-4 border-neutral-200 dark:border-neutral-700" />
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:bg-neutral-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 border-4 border-dashed border-neutral-400 dark:border-neutral-600 rounded-full flex flex-col items-center justify-center text-neutral-500 hover:border-black dark:hover:border-white transition">
                    <div className="text-5xl mb-2">↑</div>
                    <div className="text-sm">Click để tải ảnh</div>
                    <div className="text-xs mt-1">PNG, JPG ≤ 3MB</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            >
              Làm lại
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition font-medium"
            >
              {submitting ? 'Đang gửi...' : 'Thêm ứng viên'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
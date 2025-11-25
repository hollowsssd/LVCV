"use client";

type ToastProps = {
  type: "success" | "error";
  message: string;
  onClose: () => void;
};

export default function Toast({ type, message, onClose }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          max-w-xs rounded-2xl border px-4 py-3 shadow-lg text-sm flex items-start gap-2
          ${type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-red-50 border-red-200 text-red-900"}
        `}
      >
        <div className="mt-0.5">
          {type === "success" ? "✅" : "⚠️"}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {type === "success" ? "Thành công" : "Có lỗi xảy ra"}
          </p>
          <p className="text-xs mt-0.5">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

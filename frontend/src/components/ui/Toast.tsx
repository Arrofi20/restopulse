import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, text: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border border-green-700 bg-green-900/90 text-green-300'
              : toast.type === 'warning'
              ? 'border border-yellow-700 bg-yellow-900/90 text-yellow-300'
              : 'border border-red-700 bg-red-900/90 text-red-300'
          }`}
          role="alert"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="ml-4 text-current opacity-60 hover:opacity-100"
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

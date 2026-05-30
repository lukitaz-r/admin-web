'use client';

import { useEffect } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onDismiss?.(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const isSuccess = message.type === 'success';

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-lg text-sm font-medium border
        ${isSuccess
          ? 'bg-success-dim border-success/30 text-success'
          : 'bg-danger-dim border-danger/30 text-danger'
        }
        animate-[fadeIn_0.3s_var(--ease-smooth)]`}
    >
      {isSuccess
        ? <Check size={18} className="shrink-0" />
        : <AlertTriangle size={18} className="shrink-0" />
      }
      <span className="flex-1">{message.text}</span>
      <button
        onClick={onDismiss}
        className="text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}

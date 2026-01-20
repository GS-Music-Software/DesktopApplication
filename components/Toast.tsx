import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Toast as ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  on_remove: (id: string) => void;
}

export function Toast({ toast, on_remove }: ToastProps) {
  const [is_removing, set_is_removing] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        set_is_removing(true);
        setTimeout(() => on_remove(toast.id), 200);
      }, toast.duration - 200);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, on_remove]);

  const get_icon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const get_styles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 min-w-[300px] max-w-md px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg',
        get_styles(),
        is_removing ? 'animate-toast-out' : 'animate-toast-in'
      )}
    >
      {get_icon()}
      <p className="flex-1 text-sm text-white font-medium">{toast.message}</p>
      <button
        onClick={() => {
          set_is_removing(true);
          setTimeout(() => on_remove(toast.id), 200);
        }}
        className="p-1 text-zinc-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

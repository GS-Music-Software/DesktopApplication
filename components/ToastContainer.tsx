import { useToast } from '../contexts/ToastContext';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, remove_toast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} on_remove={remove_toast} />
        ))}
      </div>
    </div>
  );
}

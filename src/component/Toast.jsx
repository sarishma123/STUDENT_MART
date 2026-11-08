import { CheckCircle2, X, XCircle } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  return (
    <div className={`toast toast--${isError ? 'error' : 'success'}`} role="status" aria-live="polite">
      {isError ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
      <span>{toast.message}</span>
      <button type="button" className="toast__dismiss" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}

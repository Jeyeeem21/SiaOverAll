import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ToastContext = createContext(null);
let nextToastId = 1;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const show = useCallback((message, type = 'info') => { const id = nextToastId++; setToasts((items) => [...items, { id, message: String(message), type }]); window.setTimeout(() => dismiss(id), type === 'error' ? 5500 : 3500); return id; }, [dismiss]);
  useEffect(() => { const nativeAlert = window.alert; window.alert = (message) => show(message, 'info'); return () => { window.alert = nativeAlert; }; }, [show]);
  const value = useMemo(() => ({ show, success: (message) => show(message, 'success'), error: (message) => show(message, 'error'), info: (message) => show(message, 'info') }), [show]);
  return <ToastContext.Provider value={value}>{children}<div aria-live="polite" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'grid', gap: 10, width: 'min(380px, calc(100vw - 32px))' }}>{toasts.map((toast) => { const colors = toast.type === 'success' ? ['#ecfdf5', '#047857'] : toast.type === 'error' ? ['#fef2f2', '#b91c1c'] : ['#eff6ff', '#1d4ed8']; return <div key={toast.id} role="status" style={{ display: 'flex', gap: 10, alignItems: 'start', padding: '14px 16px', background: colors[0], color: '#111827', borderLeft: `4px solid ${colors[1]}`, borderRadius: 8, boxShadow: '0 10px 24px rgba(0,0,0,.16)' }}><span style={{ color: colors[1], fontWeight: 700 }}>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}</span><span style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button></div>; })}</div></ToastContext.Provider>;
}
export function useToast() { const toast = useContext(ToastContext); if (!toast) throw new Error('useToast must be used within ToastProvider'); return toast; }

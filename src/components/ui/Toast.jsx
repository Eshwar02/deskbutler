import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

const ToastContext = createContext(null);

/**
 * Toast Provider - Wrap your app with this
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, options = {}) => {
    const {
      type = 'info',
      duration = 5000,
      id = Date.now()
    } = options;

    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to show toasts
 * 
 * @returns {{
 *   toast: (message: string, options?: {type?: 'success'|'error'|'info'|'warning', duration?: number}) => number,
 *   success: (message: string, duration?: number) => number,
 *   error: (message: string, duration?: number) => number,
 *   info: (message: string, duration?: number) => number,
 *   warning: (message: string, duration?: number) => number,
 *   dismiss: (id: number) => void
 * }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { addToast, removeToast } = context;

  return {
    toast: addToast,
    success: (message, duration) => addToast(message, { type: 'success', duration }),
    error: (message, duration) => addToast(message, { type: 'error', duration }),
    info: (message, duration) => addToast(message, { type: 'info', duration }),
    warning: (message, duration) => addToast(message, { type: 'warning', duration }),
    dismiss: removeToast
  };
}

/**
 * Toast Container Component
 */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="ui-toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

/**
 * Individual Toast Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {'success' | 'error' | 'info' | 'warning'} [props.type='info'] - Toast type
 * @param {number} [props.duration=5000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {Function} props.onClose - Close handler
 */
function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M13 7l-6 6m0-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l8 16H2L10 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 8v4m0 2v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M10 10v4m0-6v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  };

  const classNames = [
    'ui-toast',
    `ui-toast--${type}`,
    isExiting && 'ui-toast--exiting'
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="alert">
      <div className="ui-toast__icon">
        {icons[type]}
      </div>
      
      <div className="ui-toast__message">
        {message}
      </div>

      <button
        className="ui-toast__close"
        onClick={handleClose}
        aria-label="Close toast"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {duration > 0 && (
        <div className="ui-toast__progress">
          <div 
            className="ui-toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default Toast;

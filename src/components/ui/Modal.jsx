import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Premium Modal Component with Glassmorphism Backdrop
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.title] - Modal title
 * @param {boolean} [props.closeOnEscape=true] - Close on ESC key
 * @param {boolean} [props.closeOnBackdrop=true] - Close on backdrop click
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Modal size
 * @param {string} [props.className] - Additional CSS classes
 */
const Modal = forwardRef(({
  isOpen,
  onClose,
  children,
  title,
  closeOnEscape = true,
  closeOnBackdrop = true,
  size = 'md',
  className = '',
}, ref) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => modalRef.current?.focus()
  }));

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements?.length) {
      focusableElements[0].focus();
    }

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFocusTrap = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  if (!isOpen) return null;

  const modalClassNames = [
    'ui-modal',
    `ui-modal--${size}`,
    isOpen && 'ui-modal--open',
    className
  ].filter(Boolean).join(' ');

  return createPortal(
    <div className="ui-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={modalClassNames}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onKeyDown={handleFocusTrap}
        tabIndex={-1}
      >
        {title && (
          <div className="ui-modal__header">
            <h2 id="modal-title" className="ui-modal__title">
              {title}
            </h2>
            <button
              className="ui-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="ui-modal__content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = 'Modal';

export default Modal;

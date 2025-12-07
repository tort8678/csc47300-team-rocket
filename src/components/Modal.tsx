import { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import '../styles/modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  showCloseButton?: boolean;
  isConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title, 
  message, 
  type = 'info',
  showCloseButton = true,
  isConfirm = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        )}
        {title && (
          <h2 className={`modal-title modal-title-${type}`}>{title}</h2>
        )}
        <p className={`modal-message ${(!title ? 'header-message' : '')}`}>{message}</p>
        <div className="modal-actions">
          {isConfirm ? (
            <>
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                <X/>
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (onConfirm) {
                    onConfirm();
                  }
                  onClose();
                }}
              >
                <Check/>
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={onClose}
            >
              <Check/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


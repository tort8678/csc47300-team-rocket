import { useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  showCloseButton = true 
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
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button 
            className={`modal-button modal-button-${type}`}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}


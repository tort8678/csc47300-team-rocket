import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Modal from '../components/Modal';

interface ModalContextType {
  showModal: (message: string, type?: 'info' | 'success' | 'error' | 'warning', title?: string) => void;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const showModal = (
    msg: string, 
    modalType: 'info' | 'success' | 'error' | 'warning' = 'info',
    modalTitle?: string
  ) => {
    setMessage(msg);
    setType(modalType);
    setTitle(modalTitle);
    setIsConfirm(false);
    setIsOpen(true);
  };

  const showConfirm = (msg: string, modalTitle?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setMessage(msg);
      setType('warning');
      setTitle(modalTitle || 'Confirm');
      setIsConfirm(true);
      setConfirmResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (confirmResolver) {
      confirmResolver(true);
      setConfirmResolver(null);
    }
  };

  const hideModal = () => {
    if (isConfirm && confirmResolver) {
      confirmResolver(false);
      setConfirmResolver(null);
    }
    setIsOpen(false);
    setIsConfirm(false);
    setMessage('');
    setTitle(undefined);
  };

  return (
    <ModalContext.Provider value={{ showModal, showConfirm, hideModal }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={hideModal}
        onConfirm={handleConfirm}
        message={message}
        type={type}
        title={title}
        isConfirm={isConfirm}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}


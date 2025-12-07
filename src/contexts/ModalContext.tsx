import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Modal from '../components/Modal';

interface ModalContextType {
  showModal: (message: string, type?: 'info' | 'success' | 'error' | 'warning', title?: string) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
  const [title, setTitle] = useState<string | undefined>(undefined);

  const showModal = (
    msg: string, 
    modalType: 'info' | 'success' | 'error' | 'warning' = 'info',
    modalTitle?: string
  ) => {
    setMessage(msg);
    setType(modalType);
    setTitle(modalTitle);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
    setMessage('');
    setTitle(undefined);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={hideModal}
        message={message}
        type={type}
        title={title}
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


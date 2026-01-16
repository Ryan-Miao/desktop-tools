import React, { ReactNode } from 'react';
import './MaximizableModal.css';

interface MaximizableModalProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const MaximizableModal: React.FC<MaximizableModalProps> = ({
  title,
  icon,
  onClose,
  children,
  className = ''
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{icon && <span style={{ marginRight: '6px' }}>{icon}</span>}{title}</h2>
          <div className="window-controls">
            <button
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="关闭"
            >✕</button>
          </div>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MaximizableModal;

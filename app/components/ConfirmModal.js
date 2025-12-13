'use client';

import { useEffect } from 'react';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onCancel}
        aria-label="Close modal"
      />

      {/* Modal dialog */}
      <div
        className="relative max-w-md w-full mx-4 p-8"
        style={{
          background: 'var(--white)',
          border: '2px solid var(--border-subtle)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {title}
        </h2>

        <p className="body-text" style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
          {message}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="transition-all duration-300 hover:scale-105"
            style={{
              background: '#b5533d',
              color: 'var(--white)',
              padding: '0.875rem 2rem',
              border: '2px solid #b5533d',
              borderRadius: '4px',
              fontFamily: 'var(--font-crimson)',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

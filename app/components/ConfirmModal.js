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
      {/* Overlay with aurora background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(10, 1, 24, 0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onCancel}
        aria-label="Close modal"
      />

      {/* Modal dialog with glass effect */}
      <div
        className="relative glass-card max-w-md w-full mx-4 p-6 animate-in"
        style={{
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(107, 45, 255, 0.4)',
        }}
      >
        <h2
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: 'var(--font-outfit)',
            color: 'var(--glass-white)',
            textShadow: '0 2px 12px rgba(255, 0, 80, 0.5)'
          }}
        >
          {title}
        </h2>

        <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 glass-card font-medium transition-all duration-300 hover:scale-105"
            style={{
              color: 'var(--glass-white)',
              borderRadius: '12px',
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2.5 font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 80, 0.8), rgba(255, 50, 100, 0.8))',
              color: 'var(--glass-white)',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(255, 0, 80, 0.5)',
              border: '1px solid rgba(255, 100, 150, 0.3)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

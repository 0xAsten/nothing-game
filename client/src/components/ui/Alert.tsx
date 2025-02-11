import React from 'react'

interface AlertProps {
  type: 'error' | 'warning' | 'success'
  message: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up
        ${
          type === 'error'
            ? 'bg-red-500/95 text-white'
            : type === 'warning'
            ? 'bg-amber-500/95 text-white'
            : 'bg-green-500/95 text-white'
        }`}
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

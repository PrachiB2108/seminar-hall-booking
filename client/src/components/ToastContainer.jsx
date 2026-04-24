import React, { useState, useEffect } from 'react'

// Module-level setter so showToast can be called from anywhere
let _addToast = () => {}

export function showToast(message, type = 'success') {
  _addToast({ message, type, id: Date.now() + Math.random() })
}

const ICONS = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' }

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = (toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== toast.id)),
        3500
      )
    }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast alert-${t.type}`}>
          <span>{ICONS[t.type] || ''}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

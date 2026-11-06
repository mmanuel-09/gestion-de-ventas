import { useEffect, useRef } from 'react'

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'primary',
}) {
  const dialogRef = useRef(null)
  const confirmButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previouslyFocused = document.activeElement
    confirmButtonRef.current?.focus()

    // Keep keyboard focus inside the modal until it closes.
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable?.[0]
      const last = focusable?.[focusable.length - 1]

      if (!first || !last) {
        event.preventDefault()
        dialogRef.current?.focus()
      } else if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        const destination = event.shiftKey ? last : first
        destination.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="confirm-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        ref={dialogRef}
        className={`confirm-modal confirm-modal-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        tabIndex="-1"
      >
        <h2 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h2>
        <p id="confirm-modal-message" className="confirm-modal-message">
          {message}
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="confirm-modal-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmModal

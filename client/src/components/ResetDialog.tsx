interface ResetDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ResetDialog({ onConfirm, onCancel }: ResetDialogProps) {
  return (
    <div className="reset-overlay">
      <div className="reset-dialog">
        <h2 className="reset-title">Reset Game?</h2>
        <p className="reset-message">
          Are you sure you want to reset your game? This action cannot be undone
          and you will lose all your progress.
        </p>
        <div className="reset-buttons">
          <button className="reset-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="reset-confirm" onClick={onConfirm}>
            Reset Game
          </button>
        </div>
      </div>
    </div>
  )
}

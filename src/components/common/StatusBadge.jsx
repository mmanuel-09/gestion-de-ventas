function StatusBadge({ variant = 'neutral', label, icon }) {
  return (
    <span className={`status-badge status-badge-${variant}`} role="status">
      {icon && (
        <span className="status-badge-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </span>
  )
}

export default StatusBadge

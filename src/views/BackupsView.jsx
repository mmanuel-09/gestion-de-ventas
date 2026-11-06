
function BackupsView({
  backupMessage,
  backupError,
  createBackup,
  restoreBackup,
}) {
  return (
    <section className="panel content-panel backup-panel">
      <div className="panel-heading">
        <div>
          <h2>Copias de seguridad</h2>
          <p>
            Las copias de seguridad están disponibles en la aplicación de
            escritorio de LOGU. Esta versión web es una demostración.
          </p>
        </div>
      </div>

      {backupMessage && (
        <div className="backup-feedback" role="status">
          {backupMessage}
        </div>
      )}

      {backupError && (
        <div className="backup-feedback backup-error" role="alert">
          {backupError}
        </div>
      )}

      <div className="backup-actions">
        <article className="backup-action-card">
          <div className="backup-action-icon" aria-hidden="true">↓</div>
          <div>
            <h3>Crear una copia</h3>
            <p>
              La creación de archivos de respaldo requiere la aplicación de
              escritorio. En esta demo no se generan archivos.
            </p>
          </div>
          <button
            type="button"
            className="primary-action"
            onClick={createBackup}
          >
            Crear copia de seguridad
          </button>
        </article>

        <article className="backup-action-card backup-restore-card">
          <div className="backup-action-icon" aria-hidden="true">↑</div>
          <div>
            <h3>Restaurar una copia</h3>
            <p>
              La restauración de datos requiere la aplicación de escritorio.
              Esta demostración no permite seleccionar ni restaurar archivos.
            </p>
          </div>
          <button
            type="button"
            className="backup-restore-button"
            onClick={restoreBackup}
          >
            Seleccionar y restaurar
          </button>
        </article>
      </div>
    </section>
  )
}

export default BackupsView

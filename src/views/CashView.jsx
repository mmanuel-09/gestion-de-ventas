
import { useState } from 'react'
import ConfirmModal from '../components/common/ConfirmModal'
import StatusBadge from '../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../utils/formatters'

function CashView({
  cashStatus,
  cashOverview,
  cashActionError,
  cashActionMessage,
  setCashReloadKey,
  cashError,
  openingAmount,
  setOpeningAmount,
  handleCashOpen,
  cashActionBusy,
  movementType,
  setMovementType,
  movementAmount,
  setMovementAmount,
  movementReason,
  setMovementReason,
  handleCashMovement,
  countedAmount,
  setCountedAmount,
  handleCashClose,
}) {
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)

  function requestCashClose(event) {
    event.preventDefault()
    setIsCloseConfirmOpen(true)
  }

  function confirmCashClose() {
    setIsCloseConfirmOpen(false)
    handleCashClose({ preventDefault: () => undefined })
  }

  return (
    <section className="panel content-panel cash-panel">
      <div className="panel-heading cash-heading">
        <div>
          <h2>Arqueo de caja diaria</h2>
          <p>Control de efectivo en cajón, retiros, ingresos y cierre de turno.</p>
        </div>

        {cashStatus === 'loaded' && (
          <StatusBadge
            variant={cashOverview.currentSession ? 'success' : 'neutral'}
            label={cashOverview.currentSession ? 'Caja Abierta' : 'Caja Cerrada'}
          />
        )}
      </div>

      {cashStatus === 'loading' && (
        <div className="cash-message" role="status">
          Consultando el estado de la caja…
        </div>
      )}

      {cashStatus === 'error' && (
        <div className="cash-message cash-error" role="alert">
          <p>{cashError}</p>
          <button
            type="button"
            className="text-action"
            onClick={() => setCashReloadKey((key) => key + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {cashActionError && (
        <p className="cash-action-error" role="alert">
          {cashActionError}
        </p>
      )}

      {cashActionMessage && (
        <p className="cash-action-success" role="status">
          {cashActionMessage}
        </p>
      )}

      {/* ESTADO 1: CAJA CERRADA / APERTURA */}
      {cashStatus === 'loaded' && !cashOverview.currentSession && (
        <div className="cash-open-state">
          <div className="cash-empty-copy">
            <span className="cash-state-icon" aria-hidden="true">$</span>
            <div>
              <h3>
                {cashOverview.sessions.length === 0
                  ? 'Todavía no hay registros de caja'
                  : 'La caja está cerrada'}
              </h3>
              <p>
                Abrí la caja indicando el fondo inicial disponible para dar cambio.
              </p>
            </div>
          </div>

          <form className="cash-form cash-open-form" onSubmit={handleCashOpen}>
            <label className="cash-field">
              <span>Fondo inicial (cambio en cajón)</span>
              <span className="cash-input-wrap">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={openingAmount}
                  onChange={(event) => setOpeningAmount(event.target.value)}
                  aria-label="Fondo inicial en pesos"
                  placeholder="0.00"
                />
              </span>
            </label>
            <button
              type="submit"
              className="primary-action"
              disabled={cashActionBusy}
            >
              {cashActionBusy ? 'Abriendo…' : 'Abrir caja diaria'}
            </button>
          </form>
        </div>
      )}

      {/* ESTADO 2: CAJA ABIERTA / METRICAS Y OPERACIONES */}
      {cashStatus === 'loaded' && cashOverview.currentSession && (
        <>
          <div className="cash-session-meta">
            <span>Caja #{cashOverview.currentSession.id}</span>
            <span>Abierta el {formatDateTime(cashOverview.currentSession.openedAt)}</span>
          </div>

          <div className="cash-metrics-grid">
            <article className="cash-metric cash-metric-primary">
              <span>Efectivo en cajón (Teórico)</span>
              <strong>
                {formatCurrency(cashOverview.currentSession.expectedCashCents / 100)}
              </strong>
              <small>Fondo inicial + ventas en efectivo + ingresos - retiros</small>
            </article>

            <article className="cash-metric">
              <span>Fondo inicial</span>
              <strong>
                {formatCurrency(cashOverview.currentSession.openingCashCents / 100)}
              </strong>
              <small>Cambio disponible al abrir</small>
            </article>

            <article className="cash-metric">
              <span>Ventas en efectivo</span>
              <strong>
                {formatCurrency(cashOverview.currentSession.cashSalesCents / 100)}
              </strong>
              <small>Cobrado en dinero físico</small>
            </article>
          </div>

          <div className="cash-payment-totals">
            <h3>Cobros digitales / otros medios</h3>
            <div className="cash-payment-grid">
              {[
                ['Débito', cashOverview.currentSession.debitSalesCents],
                ['Crédito', cashOverview.currentSession.creditSalesCents],
                ['Transferencia / QR', cashOverview.currentSession.transferSalesCents],
                ['Mercado Pago', cashOverview.currentSession.mercadoPagoSalesCents],
                ['Cuenta Corriente', cashOverview.currentSession.accountSalesCents],
              ].map(([label, amount]) => (
                <div className="cash-payment-total" key={label}>
                  <span>{label}</span>
                  <strong>{formatCurrency(amount / 100)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="cash-movement-totals">
            <span>
              Ingresos extras: <strong>{formatCurrency(cashOverview.currentSession.cashEntriesCents / 100)}</strong>
            </span>
            <span>
              Retiros / Gastos: <strong>{formatCurrency(cashOverview.currentSession.cashWithdrawalsCents / 100)}</strong>
            </span>
          </div>

          <div className="cash-actions-grid">
            {/* FORMULARIO DE INGRESO / RETIRO MANUAL */}
            <form
              className="cash-form cash-operation-form cash-action-card cash-movement-card"
              onSubmit={handleCashMovement}
            >
              <h3>Ingreso / Retiro de efectivo</h3>
              <label className="cash-field">
                <span>Tipo de movimiento</span>
                <select
                  value={movementType}
                  onChange={(event) => setMovementType(event.target.value)}
                >
                  <option value="entry">Ingreso de dinero (ej. recarga de cambio)</option>
                  <option value="withdrawal">Retiro de dinero (ej. pago a proveedor)</option>
                </select>
              </label>

              <label className="cash-field">
                <span>Monto</span>
                <span className="cash-input-wrap">
                  <span>$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={movementAmount}
                    onChange={(event) => setMovementAmount(event.target.value)}
                    placeholder="0.00"
                  />
                </span>
              </label>

              <label className="cash-field">
                <span>Motivo / Detalle</span>
                <input
                  type="text"
                  maxLength="200"
                  required
                  value={movementReason}
                  onChange={(event) => setMovementReason(event.target.value)}
                  placeholder="Ej.: Pago a repartidor de sodas / Recarga cambio"
                />
              </label>

              <button
                type="submit"
                className="secondary-action"
                disabled={cashActionBusy}
              >
                Registrar movimiento
              </button>
            </form>

            {/* FORMULARIO DE ARQUEO Y CIERRE DE CAJA */}
            <form
              className="cash-form cash-operation-form cash-action-card cash-close-card"
              onSubmit={requestCashClose}
            >
              <div className="cash-critical-heading">
                <span className="cash-critical-marker" aria-hidden="true">!</span>
                <div>
                  <h3>Cierre de Caja Diaria</h3>
                  <p>Acción final: verificá el efectivo contado antes de cerrar.</p>
                </div>
              </div>
              <p>
                Efectivo teórico esperado en cajón: <strong>{formatCurrency(cashOverview.currentSession.expectedCashCents / 100)}</strong>
              </p>

              <label className="cash-field">
                <span>Efectivo real en cajón (recuento físico)</span>
                <span className="cash-input-wrap">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={countedAmount}
                    onChange={(event) => setCountedAmount(event.target.value)}
                    placeholder={(cashOverview.currentSession.expectedCashCents / 100).toFixed(2)}
                  />
                </span>
              </label>

              <button
                type="submit"
                className="cash-close-action"
                disabled={cashActionBusy}
              >
                {cashActionBusy ? 'Cerrando…' : 'Cerrar y arqueas caja'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* HISTORIAL DE SESIONES DE CAJA */}
      {cashStatus === 'loaded' && cashOverview.sessions.length > 0 && (
        <div className="cash-history">
          <div className="cash-history-heading">
            <h3>Historial de sesiones de caja</h3>
            <span>{cashOverview.sessions.length} sesiones</span>
          </div>

          <div className="cash-session-list">
            {cashOverview.sessions.map((session) => (
              <details className="cash-session-record" key={session.id}>
                <summary>
                  <span>Caja #{session.id}</span>
                  <span>{formatDateTime(session.openedAt)}</span>
                  <StatusBadge
                    variant={session.status === 'open' ? 'success' : 'neutral'}
                    label={session.status === 'open' ? 'Caja Abierta' : 'Caja Rendida'}
                  />
                  <strong>{formatCurrency(session.expectedCashCents / 100)}</strong>
                </summary>

                <div className="cash-session-detail">
                  <span>Fondo inicial: {formatCurrency(session.openingCashCents / 100)}</span>
                  <span>Ventas en efectivo: {formatCurrency(session.cashSalesCents / 100)}</span>
                  <span>Débito: {formatCurrency(session.debitSalesCents / 100)}</span>
                  <span>Crédito: {formatCurrency(session.creditSalesCents / 100)}</span>
                  <span>Transferencias / QR: {formatCurrency(session.transferSalesCents / 100)}</span>
                  <span>Ingresos extras: {formatCurrency(session.cashEntriesCents / 100)}</span>
                  <span>Retiros / Gastos: {formatCurrency(session.cashWithdrawalsCents / 100)}</span>

                  {session.status === 'closed' && (
                    <>
                      <span>Efectivo contado: {formatCurrency(session.countedCashCents / 100)}</span>
                      <StatusBadge
                        variant={
                          session.differenceCents < 0
                            ? 'danger'
                            : session.differenceCents > 0
                              ? 'warning'
                              : 'success'
                        }
                        label={
                          session.differenceCents < 0
                            ? `Faltante: ${formatCurrency(Math.abs(session.differenceCents) / 100)}`
                            : session.differenceCents > 0
                              ? `Sobrante: ${formatCurrency(session.differenceCents / 100)}`
                              : 'Caja Rendida · Sin diferencia'
                        }
                      />
                      <span>Cerrada el {formatDateTime(session.closedAt)}</span>
                    </>
                  )}

                  {session.movements.length > 0 && (
                    <div className="cash-movement-history">
                      <strong>Movimientos registrados en el turno</strong>
                      {session.movements.map((movement) => (
                        <span key={movement.id}>
                          {movement.type === 'entry' ? 'Ingreso' : 'Retiro'} · {movement.reason} · {formatCurrency(movement.amountCents / 100)} · {formatDateTime(movement.createdAt)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={isCloseConfirmOpen}
        title="Cerrar caja diaria"
        message="Se registrará el efectivo contado y se finalizará esta sesión de caja. ¿Confirmás el cierre?"
        confirmText="Confirmar cierre"
        cancelText="Volver"
        variant="danger"
        onConfirm={confirmCashClose}
        onCancel={() => setIsCloseConfirmOpen(false)}
      />
    </section>
  )
}

export default CashView

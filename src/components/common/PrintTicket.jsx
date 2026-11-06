
import { useEffect } from 'react'
import {
  formatCurrency,
  formatDateTime,
} from '../../utils/formatters'

function PrintTicket({ ticket, onAfterPrint }) {
  useEffect(() => {
    if (!ticket) return undefined

    function handleAfterPrint() {
      onAfterPrint?.()
    }

    window.addEventListener('afterprint', handleAfterPrint)

    const frame = window.requestAnimationFrame(() => {
      window.print()
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [ticket, onAfterPrint])

  if (!ticket) {
    return null
  }

  return (
    <div className="print-ticket-container" aria-hidden="true">
      <article className="print-ticket">
        <header className="print-ticket-header">
          <h1>RAMON</h1>
          <p>Punto de Venta</p>
          <span>DEMO</span>
        </header>

        <div className="print-ticket-meta">
          <p>Comprobante de demostración</p>
          <p>Ticket: #{ticket.id}</p>
          <p>{formatDateTime(ticket.createdAt)}</p>
        </div>

        <div className="print-ticket-items">
          {ticket.items.map((item, index) => (
            <div
              className="print-ticket-item"
              key={`${ticket.id}-${item.name}-${index}`}
            >
              <strong>{item.name}</strong>

              <div className="print-ticket-item-detail">
                <span>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </span>
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="print-ticket-summary">
          <div>
            <span>Medio de pago</span>
            <strong>{ticket.paymentMethod}</strong>
          </div>

          <div className="print-ticket-total">
            <span>TOTAL</span>
            <strong>{formatCurrency(ticket.total)}</strong>
          </div>

          {ticket.change > 0 && (
            <div>
              <span>Vuelto</span>
              <strong>{formatCurrency(ticket.change)}</strong>
            </div>
          )}
        </div>

        <footer className="print-ticket-footer">
          <p>¡Gracias por tu compra!</p>
          <small>
            Demostración web. No válido como comprobante fiscal.
          </small>
        </footer>
      </article>
    </div>
  )
}

export default PrintTicket

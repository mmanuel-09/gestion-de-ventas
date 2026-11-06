
import { Fragment, useState } from 'react'
import { formatCurrency, formatDateTime } from '../utils/formatters'

function ReportsView({
  salesStatus,
  sales,
  salesError,
  setSalesReloadKey,
  openPage,
  printTicket,
  reportData,
  reportRange,
  reportPeriod,
  selectReportPeriod,
  reportDates,
  setReportDates,
  applyCustomReportRange,
  reportStatus,
  reportError,
  setReportReloadKey,
}) {
  const [expandedSaleId, setExpandedSaleId] = useState(null)
  const [printingSaleId, setPrintingSaleId] = useState(null)
  const [printError, setPrintError] = useState('')

  async function reprintSale(sale) {
    if (printingSaleId !== null) return

    setPrintingSaleId(sale.id)
    setPrintError('')

    try {
      const result = await printTicket({
        id: sale.id,
        items: sale.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          subtotal: item.lineTotalCents / 100,
        })),
        total: sale.totalCents / 100,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
        change: 0,
      })

      if (result?.success !== true) {
        setPrintError(
          result?.error || 'No se pudo imprimir el comprobante.',
        )
      }
    } catch (error) {
      setPrintError(
        error instanceof Error
          ? error.message
          : 'No se pudo imprimir el comprobante.',
      )
    } finally {
      setPrintingSaleId(null)
    }
  }

  const salesInRange = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt)

    return (
      Number.isFinite(saleDate.getTime()) &&
      saleDate >= new Date(reportRange.startAt) &&
      saleDate < new Date(reportRange.endAt)
    )
  })

  return (
    <section className="panel content-panel reports-panel">
      <div className="panel-heading">
        <div>
          <h2>Resumen de ventas</h2>
          <p>
            Indicadores calculados a partir de las ventas registradas en esta
            demostración.
          </p>
        </div>
        {reportData && (
          <span className="reports-range-label">
            {reportRange.startDate} a {reportRange.endDate}
          </span>
        )}
      </div>

      <div className="reports-filters">
        <div
          className="reports-period-tabs"
          aria-label="Período del reporte"
        >
          {[
            ['today', 'Hoy'],
            ['week', 'Esta semana'],
            ['month', 'Mes actual'],
            ['custom', 'Rango personalizado'],
          ].map(([period, label]) => (
            <button
              key={period}
              type="button"
              className={reportPeriod === period ? 'selected' : ''}
              onClick={() => selectReportPeriod(period)}
              aria-pressed={reportPeriod === period}
            >
              {label}
            </button>
          ))}
        </div>

        {reportPeriod === 'custom' && (
          <form
            className="reports-custom-range"
            onSubmit={applyCustomReportRange}
          >
            <label>
              <span>Desde</span>
              <input
                type="date"
                required
                value={reportDates.startDate}
                onChange={(event) =>
                  setReportDates((dates) => ({
                    ...dates,
                    startDate: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Hasta</span>
              <input
                type="date"
                required
                value={reportDates.endDate}
                onChange={(event) =>
                  setReportDates((dates) => ({
                    ...dates,
                    endDate: event.target.value,
                  }))
                }
              />
            </label>

            <button type="submit" className="secondary-action">
              Aplicar rango
            </button>
          </form>
        )}
      </div>

      {reportStatus === 'loading' && (
        <div className="reports-message" role="status">
          Preparando el resumen de ventas…
        </div>
      )}

      {reportStatus === 'error' && (
        <div className="reports-message reports-error" role="alert">
          <p>{reportError}</p>
          <button
            type="button"
            className="text-action"
            onClick={() => setReportReloadKey((key) => key + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {reportStatus === 'loaded' &&
        reportData &&
        !reportData.hasCompletedSales && (
          <div className="reports-message reports-empty">
            <h3>No hay ventas completadas en este período</h3>
            <p>Probá otro rango para consultar otras operaciones.</p>

            {reportData.cancelledSalesCount > 0 && (
              <span>
                {reportData.cancelledSalesCount}{' '}
                {reportData.cancelledSalesCount === 1
                  ? 'operación anulada'
                  : 'operaciones anuladas'}{' '}
                excluidas de los importes netos.
              </span>
            )}
          </div>
        )}

      {reportStatus === 'loaded' && reportData?.hasCompletedSales && (
        <>
          {reportData.cancelledSalesCount > 0 && (
            <div className="reports-cancelled-note">
              {reportData.cancelledSalesCount}{' '}
              {reportData.cancelledSalesCount === 1
                ? 'operación anulada'
                : 'operaciones anuladas'}{' '}
              en el período; no suman a las ventas netas.
            </div>
          )}

          <div className="reports-metrics-grid reports-metrics-separated">
            <article className="reports-metric reports-metric-primary">
              <span>Total facturado</span>
              <strong>
                {formatCurrency(reportData.totalSoldCents / 100)}
              </strong>
            </article>

            <article className="reports-metric">
              <span>Cantidad de ventas</span>
              <strong>{reportData.completedSalesCount}</strong>
            </article>

            <article className="reports-metric">
              <span>Promedio por venta</span>
              <strong>
                {formatCurrency(reportData.averageTicketCents / 100)}
              </strong>
            </article>

            <article className="reports-metric">
              <span>Unidades vendidas</span>
              <strong>{reportData.unitsSold}</strong>
            </article>
          </div>

          <section className="reports-section">
            <div className="reports-section-heading">
              <h3>Desglose por medio de pago</h3>
              <span>Operaciones completadas</span>
            </div>

            <div className="reports-payments-grid">
              {[
                ['Efectivo', 'Efectivo'],
                ['Mercado Pago / QR', 'Mercado Pago'],
                ['Débito', 'Débito'],
                ['Crédito', 'Crédito'],
                ['Cta Cte', 'Cuenta Corriente'],
                ['Transferencia', 'Transferencia'],
              ].map(([label, method]) => (
                <article
                  className="reports-payment-card"
                  key={method}
                >
                  <span>{label}</span>
                  <strong>
                    {formatCurrency(
                      (reportData.paymentTotals[method] ?? 0) / 100,
                    )}
                  </strong>
                </article>
              ))}
            </div>
          </section>

          <section className="reports-section">
            <div className="reports-section-heading">
              <h3>Comparación diaria</h3>
              <span>Importe neto por fecha local</span>
            </div>

            <div className="reports-daily-list">
              {reportData.dailySales.map((day) => {
                const maximum = Math.max(
                  ...reportData.dailySales.map(
                    (item) => item.totalCents,
                  ),
                  1,
                )

                const date = new Date(`${day.day}T00:00:00`)

                const dayLabel = new Intl.DateTimeFormat('es-AR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                }).format(date)

                return (
                  <div className="reports-daily-row" key={day.day}>
                    <span className="reports-daily-date">
                      {dayLabel}
                    </span>

                    <div
                      className="reports-daily-track"
                      role="img"
                      aria-label={`${dayLabel}: ${formatCurrency(
                        day.totalCents / 100,
                      )}, ${day.salesCount} ventas`}
                    >
                      <span
                        style={{
                          width: `${Math.max(
                            3,
                            (day.totalCents / maximum) * 100,
                          )}%`,
                        }}
                      />
                    </div>

                    <strong>
                      {formatCurrency(day.totalCents / 100)}
                    </strong>

                    <small>{day.salesCount} v.</small>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="reports-rankings-grid">
            {[
              ['Más unidades', reportData.productsByUnits, 'unitsSold'],
              ['Mayor importe', reportData.productsByRevenue, 'revenueCents'],
            ].map(([title, products, metric]) => (
              <section
                className="reports-section reports-ranking"
                key={title}
              >
                <div className="reports-section-heading">
                  <h3>{title}</h3>
                  <span>Productos vendidos</span>
                </div>

                <div className="table-wrap">
                  <table className="inventory-table reports-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>
                          {metric === 'unitsSold' ? 'Unidades' : 'Importe'}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.slice(0, 10).map((product) => (
                        <tr key={product.productId}>
                          <td>
                            <span className="reports-product-name">
                              {product.name}
                            </span>
                            <small>{product.code}</small>
                          </td>

                          <td>
                            {metric === 'unitsSold'
                              ? `${product.unitsSold} u.`
                              : formatCurrency(product.revenueCents / 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {reportStatus === 'loaded' && reportData && (
        <section className="reports-section reports-history-section">
          <div className="reports-section-heading">
            <h3>Historial de comprobantes</h3>

            <span>
              {salesStatus === 'loaded'
                ? `${salesInRange.length} operaciones`
                : 'Ventas de la demostración'}
            </span>
          </div>

          {salesStatus === 'loading' && (
            <div className="reports-message" role="status">
              Preparando el historial de comprobantes…
            </div>
          )}

          {salesStatus === 'error' && (
            <div className="reports-message reports-error" role="alert">
              <p>{salesError}</p>
              <button
                type="button"
                className="text-action"
                onClick={() => setSalesReloadKey((key) => key + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {salesStatus === 'loaded' && salesInRange.length === 0 && (
            <div className="reports-message reports-empty">
              <p>No hay comprobantes en el período seleccionado.</p>

              {sales.length === 0 && (
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => openPage('venta')}
                >
                  Nueva venta
                </button>
              )}
            </div>
          )}

          {salesStatus === 'loaded' && salesInRange.length > 0 && (
            <div className="table-wrap">
              <table className="inventory-table reports-table sales-history-table">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>ID comprobante</th>
                    <th>Medio de pago</th>
                    <th>Total</th>
                    <th>Detalle</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {salesInRange.map((sale) => (
                    <Fragment key={sale.id}>
                      <tr>
                        <td>{formatDateTime(sale.createdAt)}</td>
                        <td>#{sale.id}</td>
                        <td>{sale.paymentMethod}</td>
                        <td>{formatCurrency(sale.totalCents / 100)}</td>

                        <td>
                          <button
                            type="button"
                            className="sale-details-toggle"
                            aria-expanded={expandedSaleId === sale.id}
                            onClick={() =>
                              setExpandedSaleId((current) =>
                                current === sale.id ? null : sale.id,
                              )
                            }
                          >
                            {expandedSaleId === sale.id
                              ? 'Ocultar'
                              : 'Ver ítems'}
                          </button>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="sale-details-toggle"
                            onClick={() => reprintSale(sale)}
                            disabled={printingSaleId !== null}
                          >
                            {printingSaleId === sale.id
                              ? 'Imprimiendo…'
                              : 'Imprimir'}
                          </button>
                        </td>
                      </tr>

                      {expandedSaleId === sale.id && (
                        <tr>
                          <td colSpan="6">
                            <div className="table-wrap">
                              <table className="inventory-table reports-table">
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th>Código</th>
                                    <th>Cantidad</th>
                                    <th>Precio unitario</th>
                                    <th>Importe</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {sale.items.map((item) => (
                                    <tr
                                      key={`${sale.id}-${item.productId}`}
                                    >
                                      <td>{item.name}</td>
                                      <td>{item.code}</td>
                                      <td>{item.quantity}</td>
                                      <td>
                                        {formatCurrency(
                                          item.unitPriceCents / 100,
                                        )}
                                      </td>
                                      <td>
                                        {formatCurrency(
                                          item.lineTotalCents / 100,
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {printError && (
            <p className="reports-message reports-error" role="alert">
              {printError}
            </p>
          )}
        </section>
      )}
    </section>
  )
}

export default ReportsView

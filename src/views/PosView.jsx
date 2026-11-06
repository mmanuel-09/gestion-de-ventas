
import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmModal from '../components/common/ConfirmModal'
import StatusBadge from '../components/common/StatusBadge'
import { formatCurrency } from '../utils/formatters'

function PosView({
  visibleProducts = [],
  query,
  setQuery,
  categories = [],
  category,
  setCategory,
  addToCart,
  itemCount,
  clearCart,
  cartItems = [],
  changeQuantity,
  paymentMethod,
  setPaymentMethod,
  total,
  notice,
  confirmSale,
  lastSale,
  printTicket,
  isSavingSale,
  isCashOpen = true,
}) {
  const [amountPaid, setAmountPaid] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false)
  const [isPrintingTicket, setIsPrintingTicket] = useState(false)
  const [printError, setPrintError] = useState('')
  const searchRef = useRef(null)
  const productGridRef = useRef(null)

  const requestClearCart = useCallback(() => {
    if (cartItems.length > 0) setIsClearCartConfirmOpen(true)
  }, [cartItems.length])

  const confirmClearCart = useCallback(() => {
    clearCart()
    setIsClearCartConfirmOpen(false)
    window.requestAnimationFrame(() => searchRef.current?.focus())
  }, [clearCart])

  const handleConfirmSale = useCallback(async () => {
    if (cartItems.length === 0 || !isCashOpen || isSavingSale) return

    const paid = Number(amountPaid.replace(',', '.')) || 0
    const change =
      paymentMethod === 'Efectivo' ? Math.max(paid - total, 0) : 0

    const result = await confirmSale({ change })

    if (result?.success) {
      setAmountPaid('')
      setPrintError('')
      searchRef.current?.focus()
    }
  }, [
    cartItems.length,
    isCashOpen,
    isSavingSale,
    amountPaid,
    paymentMethod,
    total,
    confirmSale,
  ])

  async function handlePrintTicket() {
    if (!lastSale || isPrintingTicket) return

    setIsPrintingTicket(true)
    setPrintError('')

    try {
      const result = await printTicket(lastSale)

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
      setIsPrintingTicket(false)
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSelectedIndex(0))
    return () => window.cancelAnimationFrame(frame)
  }, [visibleProducts])

  // Enfoque automático al buscador al abrir la pantalla o presionar F1
  useEffect(() => {
    searchRef.current?.focus()

    function handleKeyDown(e) {
      if (isClearCartConfirmOpen) return

      const isCatalogTarget =
        e.target === searchRef.current ||
        productGridRef.current?.contains(e.target)

      if (isCatalogTarget && e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((index) =>
          Math.min(index + 1, Math.max(visibleProducts.length - 1, 0)),
        )
      } else if (isCatalogTarget && e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((index) => Math.max(index - 1, 0))
      } else if (
        isCatalogTarget &&
        e.key === 'Enter' &&
        visibleProducts.length > 0
      ) {
        e.preventDefault()
        addToCart(
          visibleProducts[Math.min(selectedIndex, visibleProducts.length - 1)],
        )
      } else if (e.key === 'F1') {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (
        e.key === 'F2' &&
        cartItems.length > 0 &&
        isCashOpen &&
        !isSavingSale
      ) {
        e.preventDefault()
        handleConfirmSale()
      } else if (e.key === 'Escape' && cartItems.length > 0) {
        e.preventDefault()
        requestClearCart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    cartItems,
    isCashOpen,
    isSavingSale,
    requestClearCart,
    isClearCartConfirmOpen,
    handleConfirmSale,
    visibleProducts,
    selectedIndex,
    addToCart,
  ])

  // Cálculo de vuelto para cobros en efectivo
  const numericPaid = parseFloat(amountPaid.replace(',', '.')) || 0
  const changeDue = numericPaid > total ? numericPaid - total : 0

  return (
    <div className="sales-layout-container">
      {/* 1. BARRA SUPERIOR DE ESTADO EN VENTA */}
      <header className="pos-status-bar">
        <div className="pos-status-item">
          <StatusBadge
            variant={isCashOpen ? 'success' : 'warning'}
            icon={<span className="dot" />}
            label={isCashOpen ? 'Caja Abierta' : 'Caja Cerrada (Abrir en Caja)'}
          />
        </div>

        <div className="pos-status-item">
          <span className="label">Lector de código:</span>
          <strong className="value text-success">✓ Listo para escanear</strong>
        </div>

        <div className="pos-status-item">
          <span className="label">Ítems en ticket:</span>
          <strong className="value">{itemCount} u.</strong>
        </div>
      </header>

      <div className="sales-layout">
        {/* COLUMNA IZQUIERDA: CATÁLOGO Y BÚSQUEDA */}
        <section className="catalog-panel panel">
          <div className="panel-heading catalog-heading">
            <div>
              <h2>Catálogo de Productos</h2>
              <p>Buscá por nombre o escanear código de barras.</p>
            </div>

            <span className="subtle-count">
              {visibleProducts.length} productos
            </span>
          </div>

          <label className="search-box">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escanear código o buscar nombre..."
              aria-label="Buscar productos por nombre o código"
            />

            <span className="search-hint">
              <kbd className="key-badge">F1</kbd> Buscar
            </span>
          </label>

          <div
            className="category-list"
            aria-label="Filtrar por categoría"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-chip ${category === item ? 'selected' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            className="catalog-keyboard-help"
            aria-label="Atajos para navegar productos"
          >
            <kbd className="key-badge">↑</kbd>
            <kbd className="key-badge">↓</kbd>
            <span>Navegar</span>
            <span aria-hidden="true">·</span>
            <kbd className="key-badge">Enter</kbd>
            <span>Agregar al ticket</span>
          </div>

          <div className="product-grid" ref={productGridRef}>
            {visibleProducts.map((product, index) => (
              <article
                className={`product-card ${index === selectedIndex ? 'selected-card' : ''}`}
                key={product.id}
                tabIndex={0}
                onFocus={() => setSelectedIndex(index)}
              >
                <div className="product-card-top">
                  <div className={`product-mark ${product.color}`}>
                    {product.initials}
                  </div>

                  <span className="product-category">
                    {product.category}
                  </span>
                </div>

                <h3>{product.name}</h3>
                <span className="product-sku">Cód. {product.sku}</span>

                <div className="product-card-bottom">
                  <div>
                    <strong className="product-price">
                      {formatCurrency(product.price)}
                    </strong>

                    <span
                      className={`stock-label ${
                        product.stock <= (product.minStock || 5)
                          ? 'stock-low'
                          : ''
                      }`}
                    >
                      Stock: {product.stock} u.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="add-product"
                    onClick={() => addToCart(product)}
                    aria-label={`Agregar ${product.name} a la venta`}
                    title="Agregar a la venta"
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="empty-products">
              <span className="empty-symbol" aria-hidden="true">
                ⌕
              </span>

              <h3>No se encontraron coincidencias</h3>
              <p>Revisá el texto del buscador o probá limpiar el filtro.</p>

              <button
                type="button"
                className="text-action"
                onClick={() => {
                  setQuery('')
                  setCategory('Todos')
                  searchRef.current?.focus()
                }}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          <div className="catalog-footnote">
            <span className="footnote-dot" />
            Catálogo de demostración. Los cambios se reinician al recargar la página.
          </div>
        </section>

        {/* COLUMNA DERECHA: TICKET Y COBRO */}
        <section className="ticket-panel panel">
          <div className="ticket-heading">
            <div>
              <h2>Venta Actual</h2>
              <p>Revisá los productos agregados.</p>
            </div>

            <span className="ticket-count">{itemCount}</span>
          </div>

          <div className="ticket-meta">
            <span>DETALLE DEL TICKET</span>

            <button
              type="button"
              className="text-action"
              onClick={requestClearCart}
              disabled={cartItems.length === 0}
            >
              Vaciar (Esc)
            </button>
          </div>

          <div className="cart-list">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon" aria-hidden="true">
                  ＋
                </div>

                <h3>Ticket vacío</h3>
                <p>
                  Escaneá o hacé clic en un producto para agregarlo.
                </p>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                  <div className={`cart-item-mark ${product.color}`}>
                    {product.initials}
                  </div>

                  <div className="cart-item-info">
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(product.price)} c/u</span>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => changeQuantity(product.id, -1)}
                        aria-label={`Quitar una unidad de ${product.name}`}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() => changeQuantity(product.id, 1)}
                        aria-label={`Agregar una unidad de ${product.name}`}
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item-total">
                    {formatCurrency(product.price * quantity)}
                  </strong>
                </div>
              ))
            )}
          </div>

          <div className="ticket-footer">
            <label className="payment-label" htmlFor="payment-method">
              Medio de Pago
            </label>

            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Mercado Pago">Mercado Pago / QR</option>
              <option value="Débito">Tarjeta Débito</option>
              <option value="Crédito">Tarjeta Crédito</option>
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Cuenta Corriente">Cuenta Corriente (Fiado)</option>
            </select>

            {/* Calculadora de vuelto */}
            {paymentMethod === 'Efectivo' && cartItems.length > 0 && (
              <div className="cash-calculator">
                <label className="cash-calculator-row">
                  <span>Paga con</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </label>

                <div className="cash-calculator-change">
                  <span>Vuelto:</span>
                  <strong>{formatCurrency(changeDue)}</strong>
                </div>
              </div>
            )}

            <div className="total-line total-line-final">
              <strong>TOTAL</strong>
              <strong className="gigantic-total">
                {formatCurrency(total)}
              </strong>
            </div>

            {notice && (
              <p className="sale-notice" role="status">
                {notice}
              </p>
            )}

            {lastSale && (
              <button
                type="button"
                className="secondary-action ticket-print-action"
                onClick={handlePrintTicket}
                disabled={isPrintingTicket}
              >
                {isPrintingTicket
                  ? 'Imprimiendo…'
                  : `Imprimir Ticket #${lastSale.id}`}
              </button>
            )}

            {printError && (
              <p className="sale-notice error-notice" role="alert">
                {printError} El comprobante sigue disponible para reintentar.
              </p>
            )}

            {!isCashOpen && (
              <p className="sale-notice error-notice" role="alert">
                La caja diaria está cerrada. Abrila desde la pestaña "Caja".
              </p>
            )}

            <button
              type="button"
              className="confirm-sale primary-pay-button"
              onClick={handleConfirmSale}
              disabled={cartItems.length === 0 || isSavingSale || !isCashOpen}
            >
              <span>
                {!isCashOpen
                  ? 'Caja cerrada'
                  : isSavingSale
                    ? 'Registrando…'
                    : (
                      <>
                        Cobrar <kbd className="key-badge">F2</kbd>{' '}
                        {total > 0 ? formatCurrency(total) : ''}
                      </>
                    )}
              </span>

              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>

      {/* BARRA DE ATAJOS RÁPIDOS */}
      <footer className="keyboard-shortcuts-bar">
        <span className="shortcut-tag">
          <kbd className="key-badge">F1</kbd> Buscador
        </span>
        <span className="shortcut-tag">
          <kbd className="key-badge">F2</kbd> Cobrar
        </span>
        <span className="shortcut-tag">
          <kbd className="key-badge">Esc</kbd> Vaciar ticket
        </span>
      </footer>

      <ConfirmModal
        isOpen={isClearCartConfirmOpen}
        title="Vaciar venta actual"
        message="Se quitarán todos los productos del ticket. ¿Querés continuar?"
        confirmText="Vaciar ticket"
        cancelText="Seguir vendiendo"
        variant="danger"
        onConfirm={confirmClearCart}
        onCancel={() => setIsClearCartConfirmOpen(false)}
      />
    </div>
  )
}

export default PosView

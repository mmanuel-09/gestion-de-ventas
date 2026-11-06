
import { useState } from 'react'
import { navigation, pageDescriptions } from './constants/navigation'
import useProducts from './hooks/useProducts'
import useCart from './hooks/useCart'
import useCash from './hooks/useCash'
import useReports from './hooks/useReports'
import useBackups from './hooks/useBackups'
import PosView from './views/PosView'
import ProductsView from './views/ProductsView'
import CashView from './views/CashView'
import ReportsView from './views/ReportsView'
import BackupsView from './views/BackupsView'
import PrintTicket from './components/common/PrintTicket'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('venta')

  const productState = useProducts()

  const cartState = useCart({
    products: productState.products,
    setProducts: productState.setProducts,
  })

  const cashState = useCash({
    sales: cartState.sales,
  })

  const reportsState = useReports({
    sales: cartState.sales,
  })

  const backupsState = useBackups()

  const currentPage =
    navigation.find((item) => item.id === activePage) ?? navigation[0]

  function handleProductCreated(product, message) {
    productState.handleProductCreated(product, message)
    cartState.setNotice('')
  }

  function openPage(pageId) {
    setActivePage(pageId)
    cartState.setNotice('')

    if (pageId !== 'productos') {
      productState.setProductMessage('')
    }
  }

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">LG</div>

            <div className="brand-copy">
              <strong>RAMON</strong>
              <span>Punto de Venta</span>
            </div>
          </div>

          <div className="sidebar-label">MENÚ PRINCIPAL</div>

          <nav className="main-navigation" aria-label="Navegación principal">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => openPage(item.id)}
                aria-current={activePage === item.id ? 'page' : undefined}
              >
                <span
                  className={`nav-icon icon-${item.id}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {item.id === 'venta' && (
                  <span className="nav-shortcut">F1</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-spacer" />

          <div className="sidebar-note">
            <span className="sidebar-note-icon" aria-hidden="true">
              i
            </span>

            <div>
              <strong>Versión de demostración</strong>
              <p>Los datos se reinician al recargar la página.</p>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">C</div>

            <div className="profile-copy">
              <strong>Mi comercio</strong>
              <span>Demo web</span>
            </div>

            <span className="profile-menu" aria-hidden="true">
              ···
            </span>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="page-heading">
              <div className="breadcrumb">
                PUNTO DE VENTA / {currentPage.label.toUpperCase()}
              </div>

              <h1>{currentPage.label}</h1>
              <p>{pageDescriptions[activePage]}</p>
            </div>

            <div className="topbar-right">
              <span className="demo-badge">
                <span className="demo-dot" />
                DEMO
              </span>

              <div className="date-display">
                <span className="date-icon" aria-hidden="true">
                  ▦
                </span>

                <span>
                  {new Intl.DateTimeFormat('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date())}
                </span>
              </div>
            </div>
          </header>

          <div className="main-content">
            {activePage === 'venta' && (
              <PosView
                visibleProducts={cartState.visibleProducts}
                query={cartState.query}
                setQuery={cartState.setQuery}
                categories={cartState.categories}
                category={cartState.category}
                setCategory={cartState.setCategory}
                addToCart={cartState.addToCart}
                itemCount={cartState.itemCount}
                clearCart={cartState.clearCart}
                cartItems={cartState.cartItems}
                changeQuantity={cartState.changeQuantity}
                paymentMethod={cartState.paymentMethod}
                setPaymentMethod={cartState.setPaymentMethod}
                total={cartState.total}
                notice={cartState.notice}
                confirmSale={cartState.confirmSale}
                lastSale={cartState.lastSale}
                printTicket={cartState.printTicket}
                isSavingSale={cartState.isSavingSale}
                isCashOpen={Boolean(cashState.cashOverview.currentSession)}
              />
            )}

            {activePage === 'productos' && (
              <ProductsView
                {...productState}
                addToCart={cartState.addToCart}
                setActivePage={setActivePage}
                handleProductCreated={handleProductCreated}
              />
            )}

            {activePage === 'caja' && (
              <CashView
                cashStatus={cashState.cashStatus}
                cashOverview={cashState.cashOverview}
                cashActionError={cashState.cashActionError}
                cashActionMessage={cashState.cashActionMessage}
                setCashReloadKey={cashState.setCashReloadKey}
                cashError={cashState.cashError}
                openingAmount={cashState.openingAmount}
                setOpeningAmount={cashState.setOpeningAmount}
                handleCashOpen={cashState.handleCashOpen}
                cashActionBusy={cashState.cashActionBusy}
                movementType={cashState.movementType}
                setMovementType={cashState.setMovementType}
                movementAmount={cashState.movementAmount}
                setMovementAmount={cashState.setMovementAmount}
                movementReason={cashState.movementReason}
                setMovementReason={cashState.setMovementReason}
                handleCashMovement={cashState.handleCashMovement}
                countedAmount={cashState.countedAmount}
                setCountedAmount={cashState.setCountedAmount}
                handleCashClose={cashState.handleCashClose}
              />
            )}

            {activePage === 'reportes' && (
              <ReportsView
                salesStatus={cartState.salesStatus}
                sales={cartState.sales}
                salesError={cartState.salesError}
                setSalesReloadKey={cartState.setSalesReloadKey}
                openPage={openPage}
                printTicket={cartState.printTicket}
                reportData={reportsState.reportData}
                reportRange={reportsState.reportRange}
                reportPeriod={reportsState.reportPeriod}
                selectReportPeriod={reportsState.selectReportPeriod}
                reportDates={reportsState.reportDates}
                setReportDates={reportsState.setReportDates}
                applyCustomReportRange={reportsState.applyCustomReportRange}
                reportStatus={reportsState.reportStatus}
                reportError={reportsState.reportError}
                setReportReloadKey={reportsState.setReportReloadKey}
              />
            )}

            {activePage === 'configuracion' && (
              <BackupsView
                backupMessage={backupsState.backupMessage}
                backupError={backupsState.backupError}
                createBackup={backupsState.createBackup}
                restoreBackup={backupsState.restoreBackup}
              />
            )}
          </div>

          <footer className="app-footer">
            <span>
              RAMON <span className="footer-separator">·</span> Demo web
            </span>

            <span>
              <span className="footer-status-dot" />
              Datos temporales de demostración
            </span>
          </footer>
        </main>
      </div>

      <PrintTicket
        ticket={cartState.ticketToPrint}
        onAfterPrint={cartState.clearTicketToPrint}
      />
    </>
  )
}

export default App

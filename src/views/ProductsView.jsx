import { useMemo, useState } from 'react'
import ConfirmModal from '../components/common/ConfirmModal'
import ProductForm from '../components/ProductForm'
import StatusBadge from '../components/common/StatusBadge'
import { formatCurrency } from '../utils/formatters'

function ProductsView({
  products,
  productMessage,
  setProductMessage,
  isProductFormOpen,
  setIsProductFormOpen,
  editingProduct,
  setEditingProduct,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  handleProductCreated,
  addToCart,
  setActivePage,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [busyProductId, setBusyProductId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [productToDelete, setProductToDelete] = useState(null)

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(
      (a, b) => a.localeCompare(b, 'es-AR'),
    ),
    [products],
  )

  const criticalProductsCount = products.filter(
    (product) => product.stock <= product.minStock,
  ).length

  const visibleProducts = products.filter((product) => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-AR')
    const matchesQuery =
      !normalizedQuery ||
      product.name.toLocaleLowerCase('es-AR').includes(normalizedQuery) ||
      product.sku.toLocaleLowerCase('es-AR').includes(normalizedQuery)
    const matchesCategory =
      category === 'Todas' || product.category === category
    const matchesStock = !criticalOnly || product.stock <= product.minStock

    return matchesQuery && matchesCategory && matchesStock
  })

  async function changeStock(product, amount) {
    const nextStock = product.stock + amount

    if (nextStock < 0 || busyProductId !== null) {
      return
    }

    setBusyProductId(product.id)
    setActionError('')

    try {
      const updatedProduct = await updateStock(product.id, nextStock)
      handleProductCreated(
        updatedProduct,
        `Existencias de "${product.name}" actualizadas.`,
      )
    } catch (error) {
      console.error('[Productos] No se pudo actualizar el stock:', error)
      setActionError(
        error instanceof Error
          ? error.message
          : 'No se pudieron actualizar las existencias.',
      )
    } finally {
      setBusyProductId(null)
    }
  }

  async function removeProduct(product) {
    if (busyProductId !== null) {
      return
    }

    setProductToDelete(null)
    setBusyProductId(product.id)
    setActionError('')

    try {
      await deleteProduct(product.id)
    } catch (error) {
      console.error('[Productos] No se pudo eliminar el producto:', error)
      setActionError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el producto.',
      )
    } finally {
      setBusyProductId(null)
    }
  }

  function openCreateForm() {
    setProductMessage('')
    setActionError('')
    setEditingProduct(null)
    setIsProductFormOpen(true)
  }

  function openEditForm(product) {
    setProductMessage('')
    setActionError('')
    setEditingProduct(product)
    setIsProductFormOpen(true)
  }

  return (
    <section className="panel content-panel products-management">
      <div className="products-metrics-grid">
        <article className="products-metric-card">
          <span>Total de Productos</span>
          <strong>{products.length}</strong>
        </article>
        <article className="products-metric-card">
          <span>Categorías Activas</span>
          <strong>{categories.length}</strong>
        </article>
        <article className="products-metric-card products-metric-critical">
          <span>Alerta de Stock Crítico</span>
          <strong>{criticalProductsCount}</strong>
        </article>
      </div>

      <div className="panel-heading products-management-heading">
        <div>
          <h2>Catálogo y existencias</h2>
          <p>Administrá productos, precios y niveles de stock.</p>
        </div>
        <span className="subtle-count">
          {visibleProducts.length} de {products.length} productos
        </span>
      </div>

      <div className="products-toolbar">
        <label className="search-box products-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o código..."
            aria-label="Buscar productos por nombre o código"
          />
        </label>

        <select
          className="products-category-filter"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrar por categoría"
        >
          <option value="Todas">Todas las categorías</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <button
          type="button"
          className={`secondary-action products-critical-filter ${criticalOnly ? 'selected' : ''}`}
          onClick={() => setCriticalOnly((value) => !value)}
          aria-pressed={criticalOnly}
        >
          Stock Crítico ({criticalProductsCount})
        </button>

        <button
          type="button"
          className="primary-action products-new-button"
          onClick={openCreateForm}
        >
          <span aria-hidden="true">+</span>
          Nuevo Producto
        </button>
      </div>

      {productMessage && (
        <p className="product-success-message" role="status">
          {productMessage}
        </p>
      )}
      {actionError && (
        <p className="product-form-error" role="alert">{actionError}</p>
      )}

      <div className="table-wrap products-table-wrap">
        <table className="inventory-table products-table">
          <thead>
            <tr>
              <th>Marca</th>
              <th className="products-name-column">Nombre</th>
              <th className="products-sku-column">Código SKU</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th className="products-stock-column">Stock Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => {
              const isCritical = product.stock <= product.minStock
              const isBusy = busyProductId === product.id

              return (
                <tr
                  key={product.id}
                  className={isCritical ? 'products-row-critical' : ''}
                >
                  <td>
                    <span className={`table-product-mark ${product.color}`}>
                      {product.initials}
                    </span>
                  </td>
                  <td className="products-name-cell">
                    <strong className="products-table-name">{product.name}</strong>
                    <StatusBadge
                      variant={product.active === false ? 'neutral' : 'success'}
                      label={product.active === false ? 'Inactivo' : 'Activo'}
                    />
                  </td>
                  <td className="products-sku-cell">{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td className="products-stock-cell">
                    <div className="products-stock-control">
                      <button
                        type="button"
                        onClick={() => changeStock(product, -1)}
                        disabled={isBusy || product.stock <= 0}
                        aria-label={`Quitar una unidad de ${product.name}`}
                      >
                        −
                      </button>
                      <span className={isCritical ? 'stock-critical-value' : ''}>
                        {product.stock}
                      </span>
                      {product.stock === 0 ? (
                        <StatusBadge variant="danger" label="Sin Stock" />
                      ) : isCritical ? (
                        <StatusBadge variant="warning" label="Stock Crítico" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => changeStock(product, 1)}
                        disabled={isBusy}
                        aria-label={`Agregar una unidad a ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="products-row-actions">
                      <button
                        type="button"
                        className="products-edit-action"
                        onClick={() => openEditForm(product)}
                        disabled={busyProductId !== null}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="products-delete-action"
                        onClick={() => setProductToDelete(product)}
                        disabled={busyProductId !== null}
                      >
                        Eliminar
                      </button>
                      <button
                        type="button"
                        className="products-sell-action"
                        onClick={() => {
                          addToCart(product)
                          setActivePage('venta')
                        }}
                        disabled={busyProductId !== null}
                      >
                        Vender
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {visibleProducts.length === 0 && (
          <div className="products-empty-state">
            No hay productos que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>

      <p className="page-footnote">
        Catálogo de demostración. Los cambios se mantienen mientras la página
        esté abierta y se reinician al recargarla.
      </p>

      {isProductFormOpen && (
        <ProductForm
          key={editingProduct?.id ?? 'new'}
          categories={categories}
          product={editingProduct}
          createProduct={createProduct}
          updateProduct={updateProduct}
          onClose={() => {
            setIsProductFormOpen(false)
            setEditingProduct(null)
          }}
          onCreated={handleProductCreated}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Eliminar producto"
        message={
          productToDelete
            ? `¿Querés retirar "${productToDelete.name}" del catálogo? Se conservará su historial de ventas.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => productToDelete && removeProduct(productToDelete)}
        onCancel={() => setProductToDelete(null)}
      />
    </section>
  )
}

export default ProductsView

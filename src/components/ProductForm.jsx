import { useState } from 'react'

function ProductForm({
  categories,
  onClose,
  onCreated,
  product,
  createProduct,
  updateProduct,
}) {
  const [form, setForm] = useState(() => ({
    code: product?.code ?? product?.sku ?? '',
    name: product?.name ?? '',
    category: product?.category ?? '',
    price: product ? String(product.price) : '',
    stock: String(product?.stock ?? 0),
    minStock: String(product?.minStock ?? 0),
  }))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const code = form.code.trim().toUpperCase()
    const name = form.name.trim()
    const category = form.category.trim()
    const price = Number(form.price)
    const stock = Number(form.stock)
    const minStock = Number(form.minStock)

    if (!code || !name || !category) {
      setError('Completá el código, el nombre y la categoría.')
      return
    }

    if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) {
      setError('Ingresá un precio válido igual o mayor que cero.')
      return
    }

    if (!Number.isSafeInteger(Math.round(price * 100))) {
      setError('El precio ingresado es demasiado grande.')
      return
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
      setError('El stock inicial debe ser un entero igual o mayor que cero.')
      return
    }

    if (!Number.isSafeInteger(minStock) || minStock < 0) {
      setError('El stock mínimo debe ser un entero igual o mayor que cero.')
      return
    }

    if (product ? !updateProduct : !createProduct) {
      setError(
        product
          ? 'La función para editar productos no está disponible.'
          : 'La función para guardar productos no está disponible.',
      )
      return
    }

    setSaving(true)

    try {
      const productData = {
        code,
        name,
        category,
        priceCents: Math.round(price * 100),
        stock,
        minStock,
      }
      const savedProduct = product
        ? await updateProduct({ ...productData, id: product.id })
        : await createProduct(productData)

      onCreated(savedProduct)
    } catch (err) {
      console.error('[Productos] No se pudo guardar el producto:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el producto.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="product-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose()
        }
      }}
    >
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <header className="product-modal-header">
          <div>
            <span className="product-modal-eyebrow">CATÁLOGO</span>
            <h2 id="product-form-title">
              {product ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p>
              {product
                ? 'Actualizá los datos del artículo.'
                : 'Completá los datos del artículo que querés incorporar.'}
            </p>
          </div>

          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="product-form-fields">
            <label className="product-form-field">
              <span>Nombre del producto *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={120}
                placeholder="Ej. Arroz largo fino 1 kg"
                autoFocus
                required
              />
            </label>

            <label className="product-form-field">
              <span>Código interno o de barras *</span>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                maxLength={60}
                placeholder="Ej. 7791234567890"
                autoCapitalize="characters"
                required
              />
              <small>El código debe ser único.</small>
            </label>

            <label className="product-form-field">
              <span>Categoría *</span>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                list="product-category-options"
                maxLength={60}
                placeholder="Ej. Almacén"
                required
              />
              <datalist id="product-category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="product-form-field">
              <span>Precio de venta (ARS) *</span>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0,00"
                required
              />
            </label>

            <div className="product-form-two-columns">
              <label className="product-form-field">
                <span>Stock inicial *</span>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label className="product-form-field">
                <span>Stock mínimo *</span>
                <input
                  name="minStock"
                  type="number"
                  value={form.minStock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </label>
            </div>
          </div>

          {error && (
            <p className="product-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="product-modal-actions">
            <button
              type="button"
              className="product-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="product-save-button"
              disabled={saving}
            >
              {saving
                ? 'Guardando…'
                : product
                  ? 'Guardar cambios'
                  : 'Guardar producto'}
            </button>
          </div>

          <p className="product-form-footnote">
            Producto de demostración. Los cambios no se conservan al recargar la página.
          </p>
        </form>
      </section>
    </div>
  )
}

export default ProductForm

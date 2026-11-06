
import { useCallback, useMemo, useState } from 'react'
import { formatCurrency } from '../utils/formatters'

function useCart({ products, setProducts }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [notice, setNotice] = useState('')
  const [isSavingSale, setIsSavingSale] = useState(false)
  const [sales, setSales] = useState([])
  const [lastSale, setLastSale] = useState(null)
  const [ticketToPrint, setTicketToPrint] = useState(null)

  const categories = useMemo(
    () => ['Todos', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-AR')

    return products.filter((product) => {
      const matchesCategory =
        category === 'Todos' || product.category === category

      const productName = String(product.name ?? '').toLocaleLowerCase('es-AR')
      const productCode = String(product.code ?? '').toLocaleLowerCase('es-AR')
      const productSku = String(product.sku ?? '').toLocaleLowerCase('es-AR')

      const matchesQuery =
        !normalizedQuery ||
        productName.includes(normalizedQuery) ||
        productCode.includes(normalizedQuery) ||
        productSku.includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [products, query, category])

  const cartItems = cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.id),
    }))
    .filter((item) => item.product)

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id)

    if (product.stock <= 0) {
      setNotice('Este producto no tiene stock disponible.')
      return
    }

    if (existingItem && existingItem.quantity >= product.stock) {
      setNotice('Alcanzaste el stock disponible de este producto.')
      return
    }

    setCart((currentCart) => {
      const found = currentCart.find((item) => item.id === product.id)

      if (found) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { id: product.id, quantity: 1 }]
    })

    setNotice('')
  }

  function changeQuantity(productId, amount) {
    const product = products.find((item) => item.id === productId)

    if (!product) {
      return
    }

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + amount),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )

    setNotice('')
  }

  function clearCart() {
    setCart([])
    setNotice('')
  }

  async function confirmSale({ change = 0 } = {}) {
    if (cartItems.length === 0) {
      setNotice('Agregá algún producto antes de continuar.')
      return { success: false, error: 'El carrito está vacío.' }
    }

    if (isSavingSale) {
      return { success: false, error: 'La venta se está procesando.' }
    }

    setIsSavingSale(true)
    setNotice('')

    try {
      const createdAt = new Date().toISOString()
      const saleId = Date.now()

      const saleItems = cartItems.map(({ product, quantity }) => {
        const unitPriceCents = Math.round(product.price * 100)

        return {
          productId: product.id,
          name: product.name,
          code: product.code ?? product.sku,
          quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * quantity,
        }
      })

      const totalCents = saleItems.reduce(
        (sum, item) => sum + item.lineTotalCents,
        0,
      )

      const sale = {
        id: saleId,
        createdAt,
        paymentMethod,
        totalCents,
        items: saleItems,
      }

      const ticket = {
        id: saleId,
        items: saleItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          subtotal: item.lineTotalCents / 100,
        })),
        total: totalCents / 100,
        paymentMethod,
        createdAt,
        change,
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) => {
          const soldItem = saleItems.find(
            (item) => item.productId === product.id,
          )

          if (!soldItem) {
            return product
          }

          return {
            ...product,
            stock: Math.max(0, product.stock - soldItem.quantity),
          }
        }),
      )

      setSales((currentSales) => [sale, ...currentSales])
      setCart([])
      setLastSale(ticket)
      setNotice(
        `Venta #${saleId} registrada en la demostración. Total: ${formatCurrency(totalCents / 100)}.`,
      )

      return { success: true, sale: ticket }
    } catch (error) {
      console.error('[Demo] No se pudo registrar la venta:', error)

      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la venta.'

      setNotice(message)
      return { success: false, error: message }
    } finally {
      setIsSavingSale(false)
    }
  }

  async function printTicket(ticket) {
    if (!ticket || !Array.isArray(ticket.items) || ticket.items.length === 0) {
      return {
        success: false,
        error: 'No hay un comprobante válido para imprimir.',
      }
    }

    setTicketToPrint(ticket)

    return { success: true }
  }

  const clearTicketToPrint = useCallback(() => {
    setTicketToPrint(null)
  }, [])

  return {
    query,
    setQuery,
    category,
    setCategory,
    cart,
    setCart,
    paymentMethod,
    setPaymentMethod,
    notice,
    setNotice,
    isSavingSale,
    sales,
    salesStatus: 'loaded',
    salesError: '',
    lastSale,
    ticketToPrint,
    clearTicketToPrint,
    setSalesReloadKey: () => {},
    categories,
    visibleProducts,
    cartItems,
    itemCount,
    total,
    addToCart,
    changeQuantity,
    clearCart,
    confirmSale,
    printTicket,
  }
}

export default useCart

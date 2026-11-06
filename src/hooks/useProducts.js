
import { useState } from 'react'
import {
  demoProducts,
  normalizeProduct,
} from '../constants/mockProducts'

function useProducts() {
  const [products, setProducts] = useState(() =>
    demoProducts.map((product, index) =>
      normalizeProduct(product, index),
    ),
  )
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [productMessage, setProductMessage] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)

  function createProduct(input) {
    const code = input.code.trim().toUpperCase()

    if (products.some((product) => product.sku === code)) {
      throw new Error('Ya existe un producto con ese código.')
    }

    return normalizeProduct(
      {
        id: Date.now(),
        ...input,
        code,
        sku: code,
        price: input.priceCents / 100,
      },
      products.length,
    )
  }

  function updateProduct(input) {
    const code = input.code.trim().toUpperCase()

    if (
      products.some(
        (product) =>
          product.sku === code && product.id !== input.id,
      )
    ) {
      throw new Error('Ya existe otro producto con ese código.')
    }

    const index = products.findIndex(
      (product) => product.id === input.id,
    )

    if (index === -1) {
      throw new Error('No se encontró el producto que querés editar.')
    }

    return normalizeProduct(
      {
        ...products[index],
        ...input,
        code,
        sku: code,
        price: input.priceCents / 100,
      },
      index,
    )
  }

  function updateStock(id, stock) {
    const product = products.find((item) => item.id === id)

    if (!product) {
      throw new Error('No se encontró el producto.')
    }

    return {
      ...product,
      stock,
    }
  }

  function deleteProduct(id) {
    const exists = products.some((product) => product.id === id)

    if (!exists) {
      throw new Error('No se encontró el producto.')
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id),
    )

    setProductMessage(
      'Producto eliminado del catálogo de demostración.',
    )
  }

  function handleProductCreated(product, message) {
    setProducts((currentProducts) => {
      const exists = currentProducts.some(
        (item) => item.id === product.id,
      )

      const nextProducts = exists
        ? currentProducts.map((item) =>
            item.id === product.id ? product : item,
          )
        : [...currentProducts, product]

      return nextProducts.sort((a, b) =>
        a.name.localeCompare(b.name, 'es-AR'),
      )
    })

    setProductMessage(
      message ??
        `Producto "${product.name}" actualizado en la demostración.`,
    )

    setIsProductFormOpen(false)
    setEditingProduct(null)
  }

  return {
    products,
    setProducts,
    isProductFormOpen,
    setIsProductFormOpen,
    productMessage,
    setProductMessage,
    editingProduct,
    setEditingProduct,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    handleProductCreated,
  }
}

export default useProducts

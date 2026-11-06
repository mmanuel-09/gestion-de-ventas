
export const demoProducts = [
  {
    id: 1,
    name: 'Gaseosa cola 1,5 L',
    category: 'Bebidas',
    price: 2800,
    stock: 18,
    minStock: 5,
    sku: 'DEMO-001',
    initials: 'GC',
    color: 'coral',
  },
  {
    id: 2,
    name: 'Agua mineral 500 ml',
    category: 'Bebidas',
    price: 900,
    stock: 24,
    minStock: 5,
    sku: 'DEMO-002',
    initials: 'AG',
    color: 'blue',
  },
  {
    id: 3,
    name: 'Alfajor de chocolate',
    category: 'Golosinas',
    price: 700,
    stock: 42,
    minStock: 5,
    sku: 'DEMO-003',
    initials: 'AL',
    color: 'violet',
  },
  {
    id: 4,
    name: 'Yerba mate 1 kg',
    category: 'Almacén',
    price: 3500,
    stock: 10,
    minStock: 5,
    sku: 'DEMO-004',
    initials: 'YM',
    color: 'green',
  },
  {
    id: 5,
    name: 'Galletitas surtidas',
    category: 'Almacén',
    price: 1200,
    stock: 16,
    minStock: 5,
    sku: 'DEMO-005',
    initials: 'GA',
    color: 'yellow',
  },
  {
    id: 6,
    name: 'Leche entera 1 L',
    category: 'Lácteos',
    price: 1600,
    stock: 12,
    minStock: 5,
    sku: 'DEMO-006',
    initials: 'LE',
    color: 'cyan',
  },
]

export const productVisuals = {
  'DEMO-001': { initials: 'GC', color: 'coral' },
  'DEMO-002': { initials: 'AG', color: 'blue' },
  'DEMO-003': { initials: 'AL', color: 'violet' },
  'DEMO-004': { initials: 'YM', color: 'green' },
  'DEMO-005': { initials: 'GA', color: 'yellow' },
  'DEMO-006': { initials: 'LE', color: 'cyan' },
}

export const productColors = [
  'coral',
  'blue',
  'violet',
  'green',
  'yellow',
  'cyan',
]

export function normalizeProduct(product, index) {
  const visual = productVisuals[product.code ?? product.sku]

  const initialsFromName = String(product.name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

  return {
    ...product,
    initials: visual?.initials || initialsFromName || 'PR',
    color: visual?.color || productColors[index % productColors.length],
  }
}

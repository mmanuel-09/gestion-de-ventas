
const invalidCurrency = '$ 0,00'

export function centsToPesos(cents) {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('El importe en centavos debe ser un entero válido.')
  }

  return cents / 100
}

export function pesosToCents(amount) {
  if (
    amount === null ||
    amount === undefined ||
    (typeof amount === 'string' && amount.trim() === '')
  ) {
    throw new Error('El importe debe ser un número válido.')
  }

  const numericAmount =
    typeof amount === 'string'
      ? Number(amount.trim().replace(',', '.'))
      : Number(amount)

  if (!Number.isFinite(numericAmount)) {
    throw new Error('El importe debe ser un número válido.')
  }

  const cents = Math.round(
    (numericAmount + Math.sign(numericAmount) * Number.EPSILON) * 100,
  )

  if (!Number.isSafeInteger(cents)) {
    throw new Error('El importe supera el límite permitido.')
  }

  return cents
}

export function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return invalidCurrency
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return invalidCurrency
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/[\u00a0\u202f]/g, ' ')
}

export function parseCurrencyInput(value, label) {
  const normalized = String(value).trim().replace(',', '.')

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(
      `${label} debe ser un importe válido con hasta dos decimales.`,
    )
  }

  const cents = Math.round(
    (Number(normalized) + Number.EPSILON) * 100,
  )

  if (!Number.isSafeInteger(cents)) {
    throw new Error(`${label} supera el importe permitido.`)
  }

  return cents
}

export { formatDateTime } from './dateHelpers.js'

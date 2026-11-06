
import { useMemo, useState } from 'react'
import {
  createReportRange,
  getPresetDates,
  formatDateInput,
} from '../utils/dateHelpers'

const paymentMethods = [
  'Efectivo',
  'Mercado Pago',
  'Débito',
  'Crédito',
  'Cuenta Corriente',
  'Transferencia',
]

function useReports({ sales = [] }) {
  const [reportPeriod, setReportPeriod] = useState('today')
  const [reportDates, setReportDates] = useState(() =>
    getPresetDates('today'),
  )
  const [reportRange, setReportRange] = useState(() => {
    const dates = getPresetDates('today')
    return createReportRange(dates.startDate, dates.endDate)
  })
  const [reportError, setReportError] = useState('')

  const reportData = useMemo(() => {
    const startAt = new Date(reportRange.startAt).getTime()
    const endAt = new Date(reportRange.endAt).getTime()

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt).getTime()

      return (
        Number.isFinite(saleDate) &&
        saleDate >= startAt &&
        saleDate < endAt
      )
    })

    const totalSoldCents = filteredSales.reduce(
      (sum, sale) => sum + sale.totalCents,
      0,
    )

    const completedSalesCount = filteredSales.length

    const unitsSold = filteredSales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )

    const paymentTotals = Object.fromEntries(
      paymentMethods.map((method) => [
        method,
        filteredSales
          .filter((sale) => sale.paymentMethod === method)
          .reduce((sum, sale) => sum + sale.totalCents, 0),
      ]),
    )

    const dailySalesMap = new Map()
    const productsMap = new Map()

    filteredSales.forEach((sale) => {
      const day = formatDateInput(new Date(sale.createdAt))
      const currentDay = dailySalesMap.get(day) ?? {
        day,
        totalCents: 0,
        salesCount: 0,
      }

      currentDay.totalCents += sale.totalCents
      currentDay.salesCount += 1
      dailySalesMap.set(day, currentDay)

      sale.items.forEach((item) => {
        const currentProduct = productsMap.get(item.productId) ?? {
          productId: item.productId,
          name: item.name,
          code: item.code,
          unitsSold: 0,
          revenueCents: 0,
        }

        currentProduct.unitsSold += item.quantity
        currentProduct.revenueCents += item.lineTotalCents

        productsMap.set(item.productId, currentProduct)
      })
    })

    const products = [...productsMap.values()]

    return {
      hasCompletedSales: completedSalesCount > 0,
      cancelledSalesCount: 0,
      totalSoldCents,
      completedSalesCount,
      averageTicketCents:
        completedSalesCount > 0
          ? Math.round(totalSoldCents / completedSalesCount)
          : 0,
      unitsSold,
      paymentTotals,
      dailySales: [...dailySalesMap.values()].sort((a, b) =>
        a.day.localeCompare(b.day),
      ),
      productsByUnits: [...products].sort(
        (a, b) => b.unitsSold - a.unitsSold,
      ),
      productsByRevenue: [...products].sort(
        (a, b) => b.revenueCents - a.revenueCents,
      ),
    }
  }, [sales, reportRange])

  function selectReportPeriod(period) {
    setReportPeriod(period)
    setReportError('')

    if (period === 'custom') {
      return
    }

    const dates = getPresetDates(period)
    const range = createReportRange(dates.startDate, dates.endDate)

    setReportDates(dates)
    setReportRange(range)
  }

  function applyCustomReportRange(event) {
    event.preventDefault()

    try {
      setReportRange(
        createReportRange(reportDates.startDate, reportDates.endDate),
      )
      setReportPeriod('custom')
      setReportError('')
    } catch (error) {
      setReportError(error.message)
    }
  }

  return {
    reportPeriod,
    reportDates,
    setReportDates,
    reportRange,
    reportData,
    reportStatus: 'loaded',
    reportError,
    setReportReloadKey: () => {},
    selectReportPeriod,
    applyCustomReportRange,
  }
}

export default useReports

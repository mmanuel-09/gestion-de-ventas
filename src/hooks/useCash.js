
import { useMemo, useState } from 'react'
import { parseCurrencyInput } from '../utils/formatters'

function useCash({ sales = [] }) {
  const [sessions, setSessions] = useState([])
  const [cashActionError, setCashActionError] = useState('')
  const [cashActionMessage, setCashActionMessage] = useState('')
  const [cashActionBusy, setCashActionBusy] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('0')
  const [movementType, setMovementType] = useState('entry')
  const [movementAmount, setMovementAmount] = useState('')
  const [movementReason, setMovementReason] = useState('')
  const [countedAmount, setCountedAmount] = useState('')

  const cashOverview = useMemo(() => {
    function getSessionSummary(session) {
      const start = new Date(session.openedAt).getTime()
      const end = session.closedAt
        ? new Date(session.closedAt).getTime()
        : Infinity

      const sessionSales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt).getTime()
        return saleDate >= start && saleDate <= end
      })

      const sumByMethod = (method) =>
        sessionSales
          .filter((sale) => sale.paymentMethod === method)
          .reduce((sum, sale) => sum + sale.totalCents, 0)

      const cashSalesCents = sumByMethod('Efectivo')
      const debitSalesCents = sumByMethod('Débito')
      const creditSalesCents = sumByMethod('Crédito')
      const transferSalesCents = sumByMethod('Transferencia')
      const mercadoPagoSalesCents = sumByMethod('Mercado Pago')
      const accountSalesCents = sumByMethod('Cuenta Corriente')

      const cashEntriesCents = session.movements
        .filter((movement) => movement.type === 'entry')
        .reduce((sum, movement) => sum + movement.amountCents, 0)

      const cashWithdrawalsCents = session.movements
        .filter((movement) => movement.type === 'withdrawal')
        .reduce((sum, movement) => sum + movement.amountCents, 0)

      const expectedCashCents =
        session.openingCashCents +
        cashSalesCents +
        cashEntriesCents -
        cashWithdrawalsCents

      return {
        ...session,
        cashSalesCents,
        debitSalesCents,
        creditSalesCents,
        transferSalesCents,
        mercadoPagoSalesCents,
        accountSalesCents,
        cashEntriesCents,
        cashWithdrawalsCents,
        expectedCashCents,
        countedCashCents: session.countedCashCents ?? null,
        differenceCents:
          session.countedCashCents == null
            ? null
            : session.countedCashCents - expectedCashCents,
      }
    }

    const summarizedSessions = sessions.map(getSessionSummary)

    return {
      currentSession:
        summarizedSessions.find((session) => session.status === 'open') ??
        null,
      sessions: summarizedSessions,
    }
  }, [sessions, sales])

  async function runCashAction(action, successMessage) {
    if (cashActionBusy) {
      return false
    }

    setCashActionBusy(true)
    setCashActionError('')
    setCashActionMessage('')

    try {
      action()
      setCashActionMessage(successMessage)
      return true
    } catch (error) {
      setCashActionError(
        error instanceof Error
          ? error.message
          : 'No se pudo completar la operación de caja.',
      )
      return false
    } finally {
      setCashActionBusy(false)
    }
  }

  function handleCashOpen(event) {
    event.preventDefault()

    let openingCashCents

    try {
      openingCashCents = parseCurrencyInput(
        openingAmount,
        'El efectivo inicial',
      )
    } catch (error) {
      setCashActionError(error.message)
      return
    }

    if (cashOverview.currentSession) {
      setCashActionError('Ya hay una caja abierta.')
      return
    }

    runCashAction(
      () => {
        setSessions((currentSessions) => [
          {
            id: Date.now(),
            status: 'open',
            openedAt: new Date().toISOString(),
            closedAt: null,
            openingCashCents,
            countedCashCents: null,
            movements: [],
          },
          ...currentSessions,
        ])
      },
      'Caja abierta correctamente en la demostración.',
    )
  }

  function handleCashMovement(event) {
    event.preventDefault()

    const currentSession = cashOverview.currentSession

    if (!currentSession) {
      setCashActionError('No hay una caja abierta.')
      return
    }

    let amountCents

    try {
      amountCents = parseCurrencyInput(movementAmount, 'El importe')
    } catch (error) {
      setCashActionError(error.message)
      return
    }

    if (!movementReason.trim()) {
      setCashActionError('Ingresá el motivo del movimiento.')
      return
    }

    runCashAction(
      () => {
        const movement = {
          id: Date.now(),
          type: movementType === 'entry' ? 'entry' : 'withdrawal',
          reason: movementReason.trim(),
          amountCents,
          createdAt: new Date().toISOString(),
        }

        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session.id === currentSession.id
              ? {
                  ...session,
                  movements: [...session.movements, movement],
                }
              : session,
          ),
        )

        setMovementAmount('')
        setMovementReason('')
      },
      movementType === 'entry'
        ? 'Entrada de efectivo registrada.'
        : 'Salida de efectivo registrada.',
    )
  }

  function handleCashClose(event) {
    event.preventDefault()

    const currentSession = cashOverview.currentSession

    if (!currentSession) {
      setCashActionError('No hay una caja abierta.')
      return
    }

    let countedCashCents

    try {
      countedCashCents = parseCurrencyInput(
        countedAmount,
        'El efectivo contado',
      )
    } catch (error) {
      setCashActionError(error.message)
      return
    }

    runCashAction(
      () => {
        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session.id === currentSession.id
              ? {
                  ...session,
                  status: 'closed',
                  closedAt: new Date().toISOString(),
                  countedCashCents,
                }
              : session,
          ),
        )
      },
      'Caja cerrada correctamente en la demostración.',
    )
  }

  return {
    cashOverview,
    cashStatus: 'loaded',
    cashError: '',
    setCashReloadKey: () => {},
    cashActionError,
    cashActionMessage,
    cashActionBusy,
    openingAmount,
    setOpeningAmount,
    movementType,
    setMovementType,
    movementAmount,
    setMovementAmount,
    movementReason,
    setMovementReason,
    countedAmount,
    setCountedAmount,
    runCashAction,
    handleCashOpen,
    handleCashMovement,
    handleCashClose,
  }
}

export default useCash


export function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function shiftDateInput(value, days) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isSafeInteger(days)
  ) {
    return ''
  }

  const [year, month, day] = value.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)

  if (formatDateInput(startDate) !== value) {
    return ''
  }

  const date = new Date(year, month - 1, day + days)

  return formatDateInput(date)
}

export function formatDateTime(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  let date

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string') {
    date = new Date(value)
  } else {
    return '—'
  }

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const part = (type) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')} hs`
}

export function createReportRange(startDate, endDate) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/

  if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
    throw new Error('Ingresá un rango de fechas válido.')
  }

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)

  if (
    formatDateInput(start) !== startDate ||
    formatDateInput(end) !== endDate
  ) {
    throw new Error('Una de las fechas seleccionadas no existe.')
  }

  if (startDate > endDate) {
    throw new Error('La fecha inicial no puede ser posterior a la fecha final.')
  }

  const endExclusive = new Date(endYear, endMonth - 1, endDay + 1)

  return {
    startDate,
    endDate,
    startAt: start.toISOString(),
    endAt: endExclusive.toISOString(),
  }
}

export function getPresetDates(period) {
  const today = formatDateInput(new Date())

  if (period === 'week') {
    const weekday = new Date(`${today}T00:00:00`).getDay()

    return {
      startDate: shiftDateInput(today, -((weekday + 6) % 7)),
      endDate: today,
    }
  }

  if (period === 'last7') {
    return {
      startDate: shiftDateInput(today, -6),
      endDate: today,
    }
  }

  if (period === 'month') {
    return {
      startDate: `${today.slice(0, 7)}-01`,
      endDate: today,
    }
  }

  return {
    startDate: today,
    endDate: today,
  }
}

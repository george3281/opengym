const API = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

export const GYM_HOURS = Array.from({ length: 17 }, (_, i) => i + 6)
export const HEAT_COLORS = ['#27272a', 'rgba(249,115,22,0.38)', '#f97316', '#ef4444'] as const

export type HourSlot = { hour: number; occupancy: number }
export type DayForecast = { offset: number; hours: HourSlot[] }

export function todayIdx() {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

export function semesterProgress() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()
  const pct = (start: Date, end: Date) => {
    const span = end.getTime() - start.getTime()
    if (span <= 0) return 0.5
    return Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / span))
  }
  if ((m === 7 && d >= 25) || (m > 7 && m < 11) || (m === 11 && d <= 13)) {
    return pct(new Date(y, 7, 25), new Date(y, 11, 13))
  }
  if ((m === 0 && d >= 20) || (m > 0 && m < 4) || (m === 4 && d <= 9)) {
    return pct(new Date(y, 0, 20), new Date(y, 4, 9))
  }
  return 0.5
}

export function formatHour(h: number) {
  if (h === 12) return '12PM'
  if (h < 12) return `${h}AM`
  return `${h - 12}PM`
}

export function dayLabel(offset: number) {
  if (offset === 0) return 'Today'
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days[(todayIdx() + offset) % 7]
}

export function occupancyColor(occ: number, heat = false) {
  if (occ < 0.3) return heat ? HEAT_COLORS[0] : '#22c55e'
  if (occ < 0.5) return heat ? HEAT_COLORS[1] : '#f59e0b'
  if (occ < 0.7) return heat ? HEAT_COLORS[2] : '#f97316'
  return heat ? HEAT_COLORS[3] : '#ef4444'
}

export function statusLabel(occ: number, closed = false) {
  if (closed) return { label: 'Closed', color: '#6b7280' }
  if (occ < 0.3) return { label: 'Pretty quiet', color: '#22c55e' }
  if (occ < 0.5) return { label: 'Moderate', color: '#f59e0b' }
  if (occ < 0.7) return { label: 'Getting busy', color: '#f97316' }
  return { label: 'Very busy', color: '#ef4444' }
}

export async function fetchLive() {
  const res = await fetch(`${API}/occupancy`)
  if (!res.ok) throw new Error('Live occupancy unavailable')
  return res.json() as Promise<{ occupancy: number; is_closed: boolean }>
}

export async function fetchWeather() {
  const res = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=41.8077&longitude=-72.2526&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/New_York'
  )
  const data = await res.json()
  const code = data.current.weather_code as number
  let weather = 5
  if (code === 0) weather = 8
  else if (code <= 2) weather = 2
  else if (code === 3) weather = 3
  else if (code <= 48) weather = 7
  else if (code <= 67) weather = 4
  else if (code <= 77) weather = 6
  else if (code <= 82) weather = 4
  else if (code <= 86) weather = 6
  return { weather, temperature: data.current.temperature_2m as number }
}

export async function fetchDay(
  dayOffset: number,
  dayIdx: number,
  sp: number,
  weather: number,
  temperature: number
): Promise<HourSlot[]> {
  const dow = (dayIdx + dayOffset) % 7
  return Promise.all(
    GYM_HOURS.map(async (hour) => {
      try {
        const res = await fetch(`${API}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hour,
            day_of_week: dow,
            semester_progress: sp,
            weather,
            temperature,
          }),
        })
        if (!res.ok) throw new Error()
        const pred = await res.json()
        return { hour, occupancy: pred.is_closed ? 0 : pred.occupancy }
      } catch {
        return { hour, occupancy: 0 }
      }
    })
  )
}

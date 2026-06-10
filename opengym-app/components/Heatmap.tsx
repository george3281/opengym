import { Fragment } from 'react'
import { formatHour, occupancyColor, dayLabel, GYM_HOURS, HEAT_COLORS, type HourSlot } from '@/lib/api'

const DAYS = [1, 2, 3]

export default function WeeklyHeatmap({ data }: { data: HourSlot[][] }) {
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: '32px repeat(3, 1fr)' }}>
        <div />
        {DAYS.map((d) => (
          <p key={d} className="text-[10px] text-center pb-0.5 text-gray-600">
            {dayLabel(d).slice(0, 3)}
          </p>
        ))}
        {GYM_HOURS.map((h, i) => (
          <Fragment key={h}>
            <p className="text-[10px] text-gray-600 flex items-center justify-end pr-1">
              {h % 3 === 0 ? formatHour(h) : ''}
            </p>
            {DAYS.map((d) => (
              <div
                key={d}
                className="h-4 rounded-sm"
                style={{ backgroundColor: occupancyColor(data[d]?.[i]?.occupancy ?? 0, true) }}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <span className="text-[10px] text-gray-600">Empty</span>
        {HEAT_COLORS.map((c) => (
          <div key={c} className="w-4 h-2 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-gray-600">Packed</span>
      </div>
    </div>
  )
}

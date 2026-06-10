'use client'

import { useEffect, useRef } from 'react'
import { formatHour, occupancyColor, dayLabel, type DayForecast } from '@/lib/api'

export default function HourlyForecast({ days, hour }: { days: DayForecast[]; hour: number }) {
  const nowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  }, [])

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
      <div className="flex">
        {days.map((day) => (
          <div key={day.offset} className="flex flex-col">
            <p
              className={`text-[10px] pb-1.5 whitespace-nowrap px-2 text-gray-500 ${
                day.offset > 0 ? 'border-l border-zinc-700 ml-2' : ''
              }`}
            >
              {dayLabel(day.offset).toUpperCase()}
            </p>
            <div className="flex">
              {day.hours.map((slot) => {
                const isNow = day.offset === 0 && slot.hour === hour
                return (
                  <div
                    key={slot.hour}
                    ref={isNow ? nowRef : undefined}
                    className={`flex flex-col items-center min-w-[58px] py-1 ${
                      isNow ? 'bg-blue-950 rounded-lg px-1' : ''
                    }`}
                  >
                    <span className={`text-[11px] mb-1 ${isNow ? 'text-blue-400' : 'text-gray-500'}`}>
                      {isNow ? 'Now' : formatHour(slot.hour)}
                    </span>
                    <span className="text-[15px] font-medium text-white">
                      {Math.round(slot.occupancy * 100)}%
                    </span>
                    <div
                      className="w-3 h-1 rounded-full mt-1.5"
                      style={{ backgroundColor: occupancyColor(slot.occupancy) }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

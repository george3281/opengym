import { formatHour, type HourSlot } from '@/lib/api'

export default function TodaySummary({ peak, quietest }: { peak: number; quietest: HourSlot }) {
  const time = formatHour(quietest.hour)
  const pct = Math.round(quietest.occupancy * 100)
  return (
    <>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-3 pb-3 border-b border-zinc-700">
        UConn Rec Center projected to peak at {peak}% today. Quietest window around {time}.
      </p>
      <div className="flex items-center gap-2 bg-[#0d2e1a] rounded-xl px-3 py-2.5 mb-3">
        <p className="text-[13px] text-green-400">
          Best time today: <strong>{time}</strong> — only {pct}% full
        </p>
      </div>
    </>
  )
}

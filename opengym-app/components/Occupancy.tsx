import { statusLabel } from '@/lib/api'

export default function OccupancyHero({
  occupancy,
  closed = false,
}: {
  occupancy: number
  closed?: boolean
}) {
  const status = statusLabel(occupancy, closed)
  return (
    <div className="flex flex-col items-center pt-10 pb-6">
      <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">Current Occupancy</p>
      <p className="text-8xl font-medium text-white leading-none">{Math.round(occupancy * 100)}%</p>
      <div className="flex items-center gap-2 mt-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
        <span className="text-xl font-medium text-white">{status.label}</span>
      </div>
    </div>
  )
}

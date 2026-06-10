'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, registerables } from 'chart.js'
import { formatHour, type HourSlot } from '@/lib/api'

ChartJS.register(...registerables)

export default function Chart({ forecast, hour }: { forecast: HourSlot[]; hour: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !forecast.length) return

    chartRef.current?.destroy()
    const nowIdx = forecast.findIndex((f) => f.hour === hour)

    chartRef.current = new ChartJS(canvas, {
      type: 'line',
      data: {
        labels: forecast.map((f) => formatHour(f.hour)),
        datasets: [{
          data: forecast.map((f) => Math.round(f.occupancy * 100)),
          borderColor: '#3b82f6',
          borderWidth: 2,
          fill: true,
          backgroundColor: (ctx) => {
            const { chartArea, ctx: c } = ctx.chart
            if (!chartArea) return 'rgba(59,130,246,0.25)'
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            g.addColorStop(0, 'rgba(59,130,246,0.25)')
            g.addColorStop(1, 'rgba(59,130,246,0)')
            return g
          },
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 0, maxTicksLimit: 6 },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#6b7280', font: { size: 9 }, callback: (v) => `${v}%`, maxTicksLimit: 4 },
            border: { display: false },
            min: 0,
            max: 100,
          },
        },
      },
      plugins: [{
        id: 'nowLine',
        afterDraw(chart) {
          if (nowIdx < 0 || !chart.chartArea) return
          const x = chart.scales.x.getPixelForValue(nowIdx)
          const { ctx, chartArea } = chart
          ctx.save()
          ctx.strokeStyle = '#60a5fa'
          ctx.lineWidth = 1
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.moveTo(x, chartArea.top)
          ctx.lineTo(x, chartArea.bottom)
          ctx.stroke()
          ctx.restore()
        },
      }],
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [forecast, hour])

  return (
    <div className="relative h-[110px] w-full mt-3 pt-3 border-t border-zinc-700">
      <canvas ref={canvasRef} />
    </div>
  )
}

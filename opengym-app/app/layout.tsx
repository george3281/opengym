import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'opengym::uconn',
  description: 'UConn Rec Center occupancy predictions',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OpenGym',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

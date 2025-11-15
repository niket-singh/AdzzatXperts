'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { ToastProvider } from '@/components/ToastContainer'
import { WebSocketProvider } from '@/lib/websocket-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

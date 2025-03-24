import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { MoodChat } from '@/components/mood-chat'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AuthProvider } from "@/lib/auth"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mood Tracker',
  description: 'Track your daily moods and emotions',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="mood-tracker-theme">
            <div className="relative min-h-screen bg-background text-foreground">
              {/* Background pattern using CSS grid */}
              <div 
                className="fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                  backgroundImage: `linear-gradient(to right, hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                                   linear-gradient(to bottom, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
                  backgroundSize: '4rem 4rem',
                }}
              />
              
              {/* Gradient blobs */}
              <div className="fixed top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
              <div className="fixed bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
              
              {/* Content wrapper */}
              <div className="relative z-10 flex min-h-screen flex-col">
                {/* Theme switcher */}
                <div className="fixed top-4 right-4 z-50">
                  <ThemeSwitcher />
                </div>
                
                {/* Main content */}
                <main className="flex-1">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    {children}
                  </div>
                </main>
              </div>
              
              {/* Overlays */}
              <Toaster />
              <MoodChat />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

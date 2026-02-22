import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Home, FileQuestion } from 'lucide-react'

import appCss from '../styles.css?url'

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-muted/30">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild className="gap-2">
        <Link to="/">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}

export const Route = createRootRoute({
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'CampusHub - Academic Management System' },
      {
        name: 'description',
        content:
          'A modern full-stack academic management system for universities and colleges.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC: run before any other scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('campushub-theme');
                const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.add(isDark ? 'dark' : 'light');
              } catch (e) {}
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="campushub-theme">
      <Outlet />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
        }}
      />
    </ThemeProvider>
  )
}

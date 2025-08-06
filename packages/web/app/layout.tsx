import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'etcetera.exchange',
  description: 'A whimsical collection of random objects from the Bluesky universe',
  keywords: ['bluesky', 'objects', 'collection', 'whimsical', 'random', 'magical'],
  authors: [{ name: 'etcetera.exchange' }],
  creator: 'etcetera.exchange',
  publisher: 'etcetera.exchange',
  metadataBase: new URL('https://etcetera.exchange'),
  openGraph: {
    title: 'etcetera.exchange',
    description: 'A whimsical collection of random objects from the Bluesky universe',
    url: 'https://etcetera.exchange',
    siteName: 'etcetera.exchange',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'etcetera.exchange - Whimsical Object Collection',
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'etcetera.exchange',
    description: 'A whimsical collection of random objects from the Bluesky universe',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900`}>
        <Providers>
          <div className="min-h-full">
            {children}
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(220, 94, 255, 0.2)',
                borderRadius: '12px',
                color: '#1f2937',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
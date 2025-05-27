import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://show-pr.vercel.app'),
  title: {
    default: 'ShowPR - GitHub PR Dashboard',
    template: '%s | ShowPR'
  },
  icons: {
    icon: "/logo.png",  
  },
  description: 'Visualize and manage your GitHub pull requests with an intuitive dashboard. Track your contributions and share your work with the world.',
  keywords: ['GitHub', 'Pull Requests', 'Developer Tools', 'Open Source', 'Dashboard'],
  authors: [{ name: 'Santhosh' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://show-pr.vercel.app',
    siteName: 'ShowPR',
    title: 'ShowPR - GitHub PR Dashboard',
    description: 'Visualize and manage your GitHub pull requests',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ShowPR Dashboard Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShowPR - GitHub PR Dashboard',
    description: 'Visualize and manage your GitHub pull requests',
    images: ['/logo.png'],
    creator: process.env.TWITTER_HANDLE || '@santhosh'
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
        >
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
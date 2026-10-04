import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import DemoBadge from '@/components/ui/DemoBadge';

export const metadata: Metadata = {
  title: 'LandLens — Intelligence Layer for India\'s Land Stack',
  description: 'LandLens connects fragmented land records, registration, planning, taxation and citizen services around every parcel using ULPIN-based parcel intelligence.',
  keywords: 'land records, ULPIN, cadastral, GIS, parcel intelligence, India, land governance, DILRMP',
  openGraph: {
    title: 'LandLens — Intelligence Layer for India\'s Land Stack',
    description: 'From fragmented land records to one intelligent parcel.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <DemoBadge />
        </AuthProvider>
      </body>
    </html>
  );
}

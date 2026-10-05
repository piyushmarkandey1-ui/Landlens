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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <DemoBadge />
        </AuthProvider>
      </body>
    </html>
  );
}

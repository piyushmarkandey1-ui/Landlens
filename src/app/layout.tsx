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

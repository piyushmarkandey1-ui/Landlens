import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'LandLens Citizen Portal — Understand Your Land',
  description: 'Search any parcel in Raipur, Chhattisgarh. Check land use, restrictions, zoning, and apply for services.',
};

export default function CitizenLayout({ children }: { children: ReactNode }) {
  // Deliberately NOT wrapping in AppShell — citizen experience is standalone
  return <>{children}</>;
}

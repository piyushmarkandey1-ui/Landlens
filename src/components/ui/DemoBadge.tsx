'use client';

import { AlertTriangle } from 'lucide-react';

export default function DemoBadge() {
  return (
    <div 
      className="demo-badge no-print" 
      title="This application uses synthetic demonstration data. Not real government records."
    >
      <AlertTriangle size={10} />
      Demo Data
    </div>
  );
}

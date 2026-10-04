import { NextResponse } from 'next/server';
import { CONFLICT_ALERTS, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });

  const alerts = CONFLICT_ALERTS.filter(a => a.parcelId === id);
  const open = alerts.filter(a => a.status === 'Open');

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: {
      parcel_id: id,
      ulpin: parcel.ulpin,
      summary: {
        total: alerts.length,
        open: open.length,
        critical: open.filter(a => a.severity === 'critical').length,
        high: open.filter(a => a.severity === 'high').length,
        medium: open.filter(a => a.severity === 'medium').length,
        low: open.filter(a => a.severity === 'low').length,
      },
      conflicts: alerts.map(a => ({
        conflict_id: a.id,
        alert_type: a.alertType,
        severity: a.severity,
        title: a.title,
        description: a.description,
        datasets_compared: a.datasetsCompared,
        values: a.values,
        difference: a.difference,
        detected_date: a.detectedDate,
        status: a.status,
        recommended_action: a.recommendedAction,
        provenance: { adapter_id: 'CG_ADAPTER_v2', schema_version: '2.0.0', generated_by: 'Land Truth Engine v1' },
      })),
    },
  });
}

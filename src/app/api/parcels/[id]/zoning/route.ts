import { NextResponse } from 'next/server';
import { ZONING_RECORDS, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
  const zoning = ZONING_RECORDS.find(z => z.parcelId === id);
  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: zoning ? {
      zoning_id: zoning.id,
      parcel_id: zoning.parcelId,
      ulpin: parcel.ulpin,
      current_zone_code: zoning.currentZone,
      proposed_zone_code: zoning.proposedZone,
      master_plan_reference: zoning.masterPlanPhase,
      land_use_designation: zoning.landUseDesignation,
      fsi_far: zoning.fsi,
      max_height_m: zoning.maxHeight,
      setback_front_m: zoning.setbackFront,
      setback_side_m: zoning.setbackSide,
      road_reservation: zoning.roadReservation,
      road_width_m: zoning.roadWidth,
      remarks: zoning.remarks,
      source_fields: {
        CG: { system: 'RDA', term_fsi: 'FSI', term_plan: 'Raipur Development Plan 2031', authority: 'Raipur Development Authority' },
        TN: { system: 'CMDA', term_fsi: 'FSI', term_plan: 'Chennai Master Plan 2026', authority: 'Chennai Metropolitan Development Authority' },
        MH: { system: 'PMRDA', term_fsi: 'FAR', term_plan: 'Development Plan', authority: 'Pune Metropolitan Regional Development Authority' },
        KA: { system: 'BMRDA', term_fsi: 'FAR', term_plan: 'Master Plan 2031', authority: 'Bengaluru Metropolitan Region Development Authority' },
      },
      provenance: { source: 'RDA Master Plan', source_system: 'CG_RDA_v1', source_record_id: zoning.id, adapter_id: 'CG_ADAPTER_v2', last_updated: '2024-01-01T00:00:00Z', schema_version: '2.0.0', confidence: 'high' },
    } : null,
  });
}

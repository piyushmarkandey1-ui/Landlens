import { NextResponse } from 'next/server';
import { BUILDING_PERMISSIONS, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
  const permissions = BUILDING_PERMISSIONS.filter(b => b.parcelId === id);
  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: permissions.map(b => ({
      permission_id: b.id,
      parcel_id: b.parcelId,
      ulpin: parcel.ulpin,
      application_no: b.applicationNo,
      applicant_name: b.applicantName,
      permission_type: b.type.toLowerCase().replace(/ /g, '_'),
      approved_area_sqm: b.approvedArea,
      floors: b.floors,
      status: b.status.toLowerCase().replace(/ /g, '_'),
      applied_date: b.appliedDate,
      approved_date: b.approvedDate,
      valid_upto: b.validUpto,
      issuing_authority: b.authority,
      source_fields: {
        CG: { system: 'RMC', term: 'Building Plan Approval', authority: 'Raipur Municipal Corporation' },
        TN: { system: 'Corporation', term: 'Building Permit', authority: 'Greater Chennai Corporation' },
        MH: { system: 'PMC', term: 'Building Permission', authority: 'Pune Municipal Corporation' },
      },
      provenance: { source: b.authority, source_system: 'CG_RMC_BP_v1', source_record_id: b.id, adapter_id: 'CG_ADAPTER_v2', last_updated: b.appliedDate, schema_version: '2.0.0', confidence: 'high' },
    })),
  });
}

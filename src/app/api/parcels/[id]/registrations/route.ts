import { NextResponse } from 'next/server';
import { REGISTRATIONS, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
  const registrations = REGISTRATIONS.filter(r => r.parcelId === id);
  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: registrations.map(r => ({
      registration_id: r.id,
      parcel_id: r.parcelId,
      ulpin: parcel.ulpin,
      document_no: r.documentNo,
      registration_date: r.registrationDate,
      sale_value_inr: r.saleValue,
      stamp_duty_inr: r.stampDuty,
      area_sqm: Math.round(r.areaAcres * 4046.86),
      area_acres: r.areaAcres,
      seller_name: r.sellerName,
      buyer_name: r.buyerName,
      property_type: r.propertyType,
      sub_registrar_office: r.subRegistrarOffice,
      status: r.status.toLowerCase(),
      source_fields: {
        CG: { system: 'DORIS', term_doc: 'Bainama', term_office: 'SRO', term_duty: 'Stamp Shulk' },
        TN: { system: 'TNREGINET', term_doc: 'Absolute Sale Deed', term_office: 'Sub-Registrar', term_duty: 'Stamp Duty' },
        MH: { system: 'IGRS', term_doc: 'Sale Deed', term_office: 'Sub-Registrar', term_duty: 'Stamp Duty' },
        KA: { system: 'KAVERI', term_doc: 'Sale Deed', term_office: 'Sub-Registrar', term_duty: 'Stamp Duty' },
      },
      provenance: { source: 'DORIS', source_system: 'CG_DORIS_v4', source_record_id: r.id, adapter_id: 'CG_ADAPTER_v2', last_updated: r.registrationDate, schema_version: '2.0.0', confidence: 'high' },
    })),
  });
}

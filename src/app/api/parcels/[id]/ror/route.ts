import { NextResponse } from 'next/server';
import { ROR_RECORDS, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });

  const ror = ROR_RECORDS.find(r => r.parcelId === id);

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: ror ? {
      ror_id: ror.id,
      parcel_id: ror.parcelId,
      ulpin: parcel.ulpin,
      survey_reference: ror.khasraNo,
      owner_name: ror.ownerName,
      cultivator_name: ror.cultivatorName,
      area_sqm: Math.round(ror.areaAcres * 4046.86),
      area_acres: ror.areaAcres,
      land_type: ror.landType,
      khata_no: ror.khataNo,
      irrigation_source: ror.irrigationSource,
      last_updated: ror.lastUpdated,
      is_verified: ror.isVerified,
      source_fields: {
        CG: { term_survey: 'Khasra', term_area: 'Rakba', term_record: 'B-1 Extract', term_account: 'Khatauni', value: ror.khasraNo, khatabiNo: ror.khatabiNo },
        TN: { term_survey: 'Survey Number', term_area: 'Extent', term_record: 'A-Register / Patta', term_account: 'Patta No', value: ror.khasraNo },
        MH: { term_survey: 'Gat No', term_area: 'Kshetrafal', term_record: '7/12 Extract', term_account: 'Khate Kramank', value: ror.khasraNo },
        AP: { term_survey: 'Pahani No', term_area: 'Acreage', term_record: 'Adangal', term_account: 'Pattadar Passbook', value: ror.khasraNo },
        original_area_unit: 'acres',
        original_area_value: `${ror.areaAcres} acres`,
      },
      provenance: {
        source: ror.source,
        source_system: 'CG_BHU_ABHILEKH_v3',
        source_record_id: ror.id,
        adapter_id: 'CG_ADAPTER_v2',
        last_updated: ror.lastUpdated,
        schema_version: '2.0.0',
        confidence: ror.isVerified ? 'high' : 'medium',
        status: parcel.dataHealth.ownership,
      },
    } : null,
  });
}

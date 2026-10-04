import { NextResponse } from 'next/server';
import { PARCELS } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const landUse = searchParams.get('land_use');
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const q = searchParams.get('q');

  let results = [...PARCELS];

  if (state) results = results.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
  if (landUse) results = results.filter(p => p.landUse.toLowerCase() === landUse.toLowerCase());
  if (status) results = results.filter(p => p.status.toLowerCase() === status.toLowerCase());
  if (q) results = results.filter(p =>
    p.ulpin.toLowerCase().includes(q.toLowerCase()) ||
    p.khasraNo.toLowerCase().includes(q.toLowerCase()) ||
    p.village.toLowerCase().includes(q.toLowerCase()) ||
    p.address.toLowerCase().includes(q.toLowerCase())
  );

  const total = results.length;
  const paginated = results.slice(offset, offset + limit);

  return NextResponse.json({
    meta: {
      api_version: '1.0.0',
      schema_version: '2.0.0',
      timestamp: new Date().toISOString(),
      data_note: 'Synthetic demonstration data. Not real government records.',
      total,
      limit,
      offset,
      returned: paginated.length,
    },
    data: paginated.map(p => ({
      parcel_id: p.id,
      ulpin: p.ulpin,
      survey_reference: p.khasraNo,
      survey_no: p.surveyNo,
      state: p.state,
      district: p.district,
      tehsil_or_taluk: p.tehsil,
      village_or_locality: p.village,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      area_sqm: Math.round(p.areaAcres * 4046.86),
      area_acres: p.areaAcres,
      area_hectares: Math.round(p.areaAcres * 0.4047 * 100) / 100,
      land_use: p.landUse,
      zoning_code: p.zoning,
      parcel_status: p.status.toLowerCase().replace(' ', '_'),
      data_health: p.dataHealth,
      provenance: {
        source: 'Bhu-Abhilekh / DORIS',
        source_system: 'CG_BHU_ABHILEKH_v3',
        adapter_id: 'CG_ADAPTER_v2',
        last_updated: '2024-03-01T06:00:00Z',
        schema_version: '2.0.0',
        confidence: 'medium',
      },
      _links: {
        self: `/api/parcels/${p.id}`,
        ror: `/api/parcels/${p.id}/ror`,
        registrations: `/api/parcels/${p.id}/registrations`,
        zoning: `/api/parcels/${p.id}/zoning`,
        restrictions: `/api/parcels/${p.id}/restrictions`,
        conflicts: `/api/parcels/${p.id}/conflicts`,
        timeline: `/api/parcels/${p.id}/timeline`,
        evidence: `/api/parcels/${p.id}/evidence`,
      },
    })),
  });
}

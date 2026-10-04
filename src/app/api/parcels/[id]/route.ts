import { NextResponse } from 'next/server';
import { PARCELS } from '@/lib/data';
import {
  OWNERS, ROR_RECORDS, REGISTRATIONS, MUTATIONS,
  ZONING_RECORDS, BUILDING_PERMISSIONS, TAX_RECORDS,
  ENVIRONMENTAL_RESTRICTIONS, ENCUMBRANCES, LITIGATIONS,
  SATELLITE_CHANGES, VALUATIONS, CONFLICT_ALERTS
} from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) {
    return NextResponse.json(
      { error: 'Parcel not found', code: 'PARCEL_NOT_FOUND', parcel_id: id },
      { status: 404 }
    );
  }

  const owners = OWNERS.filter(o => o.parcelId === parcel.id);
  const ror = ROR_RECORDS.find(r => r.parcelId === parcel.id);
  const registrations = REGISTRATIONS.filter(r => r.parcelId === parcel.id);
  const mutations = MUTATIONS.filter(m => m.parcelId === parcel.id);
  const zoning = ZONING_RECORDS.find(z => z.parcelId === parcel.id);
  const buildingPermissions = BUILDING_PERMISSIONS.filter(b => b.parcelId === parcel.id);
  const tax = TAX_RECORDS.find(t => t.parcelId === parcel.id);
  const restrictions = ENVIRONMENTAL_RESTRICTIONS.filter(r => r.parcelId === parcel.id);
  const encumbrances = ENCUMBRANCES.filter(e => e.parcelId === parcel.id);
  const litigations = LITIGATIONS.filter(l => l.parcelId === parcel.id);
  const satelliteChanges = SATELLITE_CHANGES.filter(s => s.parcelId === parcel.id);
  const valuation = VALUATIONS.find(v => v.parcelId === parcel.id);
  const conflicts = CONFLICT_ALERTS.filter(a => a.parcelId === parcel.id);

  return NextResponse.json({
    meta: {
      api_version: '1.0.0',
      schema_version: '2.0.0',
      timestamp: new Date().toISOString(),
      data_note: 'Synthetic demonstration data. Not real government records.',
      parcel_id: parcel.id,
    },
    data: {
      parcel_id: parcel.id,
      ulpin: parcel.ulpin,
      survey_reference: parcel.khasraNo,
      survey_no: parcel.surveyNo,
      state: parcel.state,
      district: parcel.district,
      tehsil_or_taluk: parcel.tehsil,
      village_or_locality: parcel.village,
      address: parcel.address,
      coordinates: { lat: parcel.lat, lng: parcel.lng, crs: 'WGS84' },
      area: {
        sqm: Math.round(parcel.areaAcres * 4046.86),
        acres: parcel.areaAcres,
        hectares: Math.round(parcel.areaAcres * 0.4047 * 100) / 100,
        source_terminology: { CG: 'Rakba', TN: 'Extent', MH: 'Kshetrafal' },
      },
      land_use: parcel.landUse,
      zoning_code: parcel.zoning,
      parcel_status: parcel.status.toLowerCase().replace(' ', '_'),
      data_health: parcel.dataHealth,
      connected_records: {
        owners: owners.length,
        ror: ror ? 1 : 0,
        registrations: registrations.length,
        mutations: mutations.length,
        zoning: zoning ? 1 : 0,
        building_permissions: buildingPermissions.length,
        tax_records: tax ? 1 : 0,
        restrictions: restrictions.length,
        encumbrances: encumbrances.length,
        litigations: litigations.length,
        satellite_changes: satelliteChanges.length,
        valuation: valuation ? 1 : 0,
        open_conflicts: conflicts.filter(c => c.status === 'Open').length,
      },
      owners: owners.map(o => ({
        owner_id: o.id,
        full_name: o.name,
        father_name: o.fatherName,
        ownership_type: o.ownershipType.toLowerCase(),
        share_percent: o.sharePercent,
        acquisition_date: o.acquisitionDate,
        acquisition_type: o.acquisitionType.toLowerCase().replace(' ', '_'),
        is_current_owner: o.isCurrentOwner,
        provenance: { source: 'Bhu-Abhilekh', adapter_id: 'CG_ADAPTER_v2', schema_version: '2.0.0' },
      })),
      valuation: valuation ? {
        circle_rate_per_sqm: valuation.circleRate,
        market_value_inr: valuation.marketValue,
        guidance_value_inr: valuation.guidanceValue,
        total_value_inr: valuation.totalValue,
        valuation_date: valuation.valuationDate,
        source_terminology: { CG: 'Circle Rate', TN: 'Guidance Value', MH: 'Ready Reckoner Rate' },
      } : null,
      provenance: {
        source: 'Bhu-Abhilekh',
        source_system: 'CG_BHU_ABHILEKH_v3',
        adapter_id: 'CG_ADAPTER_v2',
        last_updated: '2024-03-01T06:00:00Z',
        schema_version: '2.0.0',
        confidence: 'medium',
        status: parcel.dataHealth.ownership,
      },
    },
    _links: {
      self: `/api/parcels/${parcel.id}`,
      ror: `/api/parcels/${parcel.id}/ror`,
      registrations: `/api/parcels/${parcel.id}/registrations`,
      zoning: `/api/parcels/${parcel.id}/zoning`,
      building_permissions: `/api/parcels/${parcel.id}/building-permissions`,
      restrictions: `/api/parcels/${parcel.id}/restrictions`,
      conflicts: `/api/parcels/${parcel.id}/conflicts`,
      timeline: `/api/parcels/${parcel.id}/timeline`,
      evidence: `/api/parcels/${parcel.id}/evidence`,
    },
  });
}

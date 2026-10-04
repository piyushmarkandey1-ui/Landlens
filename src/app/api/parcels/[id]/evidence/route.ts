import { NextResponse } from 'next/server';
import { PARCELS, ROR_RECORDS, REGISTRATIONS, ZONING_RECORDS, CONFLICT_ALERTS, SATELLITE_CHANGES, ENCUMBRANCES, LITIGATIONS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });

  const ror = ROR_RECORDS.find(r => r.parcelId === id);
  const reg = REGISTRATIONS.filter(r => r.parcelId === id)[0];
  const zoning = ZONING_RECORDS.find(z => z.parcelId === id);
  const conflicts = CONFLICT_ALERTS.filter(a => a.parcelId === id);
  const satellite = SATELLITE_CHANGES.filter(s => s.parcelId === id);
  const encumbrances = ENCUMBRANCES.filter(e => e.parcelId === id);
  const litigation = LITIGATIONS.filter(l => l.parcelId === id);

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: {
      parcel_id: id,
      ulpin: parcel.ulpin,
      evidence_chain: [
        ...(ror ? [{ evidence_id: ror.id, type: 'ror', title: 'Record of Rights (B-1)', source_system: ror.source, verified: ror.isVerified, key_fields: { khasra: ror.khasraNo, area_acres: ror.areaAcres, owner: ror.ownerName }, last_updated: ror.lastUpdated }] : []),
        ...(reg ? [{ evidence_id: reg.id, type: 'registration', title: `Registration Deed — ${reg.documentNo}`, source_system: 'DORIS', verified: reg.status === 'Registered', key_fields: { doc_no: reg.documentNo, sale_value: reg.saleValue, buyer: reg.buyerName }, last_updated: reg.registrationDate }] : []),
        ...(zoning ? [{ evidence_id: zoning.id, type: 'zoning', title: `Zoning Record — ${zoning.currentZone}`, source_system: 'RDA Master Plan', verified: true, key_fields: { zone: zoning.currentZone, fsi: zoning.fsi, road_reservation: zoning.roadReservation }, last_updated: '2024-01-01' }] : []),
        ...encumbrances.map(e => ({ evidence_id: e.id, type: 'encumbrance', title: `${e.type} — ${e.creditorName}`, source_system: 'CERSAI', verified: true, key_fields: { type: e.type, amount: e.amount, status: e.status }, last_updated: e.startDate })),
        ...litigation.map(l => ({ evidence_id: l.id, type: 'litigation', title: `Court Case — ${l.caseNo}`, source_system: 'District Court Registry', verified: true, key_fields: { case_no: l.caseNo, status: l.status, court: l.court }, last_updated: l.filedDate })),
        ...satellite.map(s => ({ evidence_id: s.id, type: 'satellite', title: `Satellite Change — ${s.changeType}`, source_system: 'ISRO Bhuvan', verified: s.verificationStatus === 'Verified', key_fields: { change: s.changeType, confidence: s.confidence, status: s.verificationStatus }, last_updated: s.detectedDate })),
        ...conflicts.map(c => ({ evidence_id: c.id, type: 'conflict', title: c.title, source_system: 'Land Truth Engine', verified: false, key_fields: { type: c.alertType, severity: c.severity, status: c.status }, last_updated: c.detectedDate })),
      ],
    },
  });
}

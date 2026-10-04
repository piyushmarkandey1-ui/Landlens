import { NextResponse } from 'next/server';
import { PARCELS, REGISTRATIONS, MUTATIONS, BUILDING_PERMISSIONS, SERVICE_REQUESTS, CONFLICT_ALERTS, SATELLITE_CHANGES } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });

  const events: { date: string; type: string; title: string; detail: string; source: string; severity?: string }[] = [];

  REGISTRATIONS.filter(r => r.parcelId === id).forEach(r => {
    events.push({ date: r.registrationDate, type: 'registration', title: `Property Registered — ${r.documentNo}`, detail: `Seller: ${r.sellerName} → Buyer: ${r.buyerName} · ₹${r.saleValue.toLocaleString()}`, source: 'DORIS' });
  });
  MUTATIONS.filter(m => m.parcelId === id).forEach(m => {
    events.push({ date: m.mutationDate, type: 'mutation', title: `Mutation ${m.status} — ${m.mutationNo}`, detail: `${m.previousOwner} → ${m.newOwner} (${m.type})`, source: 'Bhu-Abhilekh' });
  });
  BUILDING_PERMISSIONS.filter(b => b.parcelId === id).forEach(b => {
    events.push({ date: b.appliedDate, type: 'building_permission', title: `Building Permission ${b.status} — ${b.applicationNo}`, detail: `${b.type} · ${b.authority}`, source: 'RMC' });
  });
  SERVICE_REQUESTS.filter(s => s.parcelId === id).forEach(s => {
    events.push({ date: s.submittedDate, type: 'service_request', title: `Service Request — ${s.type}`, detail: `${s.citizenName} · Status: ${s.status}`, source: 'LandLens' });
  });
  CONFLICT_ALERTS.filter(a => a.parcelId === id).forEach(a => {
    events.push({ date: a.detectedDate, type: 'conflict', title: a.title, detail: a.description, source: 'Land Truth Engine', severity: a.severity });
  });
  SATELLITE_CHANGES.filter(s => s.parcelId === id).forEach(s => {
    events.push({ date: s.detectedDate, type: 'satellite_change', title: `Satellite Change Detected — ${s.changeType}`, detail: `Confidence: ${s.confidence}% · Status: ${s.verificationStatus}`, source: 'ISRO Bhuvan' });
  });

  events.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: { parcel_id: id, ulpin: parcel.ulpin, total_events: events.length, events },
  });
}

import { NextResponse } from 'next/server';
import { ENVIRONMENTAL_RESTRICTIONS, LITIGATIONS, ENCUMBRANCES, PARCELS } from '@/lib/data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parcel = PARCELS.find(p => p.id === id);
  if (!parcel) return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });

  const envRestrictions = ENVIRONMENTAL_RESTRICTIONS.filter(r => r.parcelId === id);
  const encumbrances = ENCUMBRANCES.filter(e => e.parcelId === id);
  const litigations = LITIGATIONS.filter(l => l.parcelId === id);

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data.' },
    data: {
      parcel_id: id,
      ulpin: parcel.ulpin,
      summary: {
        total_restrictions: envRestrictions.length + encumbrances.filter(e => e.status === 'Active').length + litigations.filter(l => l.status === 'Active').length,
        environmental: envRestrictions.filter(r => r.isActive).length,
        encumbrances: encumbrances.filter(e => e.status === 'Active').length,
        active_litigation: litigations.filter(l => l.status === 'Active').length,
      },
      environmental_restrictions: envRestrictions.map(r => ({
        restriction_id: r.id,
        restriction_type: r.type.toLowerCase().replace(/ /g, '_'),
        authority: r.authority,
        description: r.description,
        is_active: r.isActive,
        notification_no: r.notificationNo,
        source_fields: {
          issuing_act: r.type === 'Forest Buffer' ? 'Forest Conservation Act 1980' : r.type === 'Airport Zone' ? 'Aircraft Act 1934' : 'Environment Protection Act 1986',
        },
        provenance: { source: r.authority, adapter_id: 'CG_ADAPTER_v2', schema_version: '2.0.0', confidence: 'high' },
      })),
      encumbrances: encumbrances.map(e => ({
        encumbrance_id: e.id,
        encumbrance_type: e.type.toLowerCase(),
        creditor_name: e.creditorName,
        amount_inr: e.amount,
        start_date: e.startDate,
        end_date: e.endDate,
        status: e.status.toLowerCase(),
        registration_no: e.registrationNo,
        bank_name: e.bankName,
        source_fields: {
          CG: { term: 'Bharam Praman Patra', system: 'SRO EC System' },
          TN: { term: 'Encumbrance Certificate', system: 'TNREGINET EC' },
          national: { term: 'CERSAI Registration', system: 'CERSAI' },
        },
        provenance: { source: 'CERSAI / SRO', adapter_id: 'CG_ADAPTER_v2', schema_version: '2.0.0', confidence: 'medium' },
      })),
      litigation: litigations.map(l => ({
        litigation_id: l.id,
        case_no: l.caseNo,
        court: l.court,
        case_type: l.caseType,
        plaintiff: l.plaintiff,
        defendant: l.defendant,
        filed_date: l.filedDate,
        status: l.status.toLowerCase(),
        next_hearing_date: l.nextHearingDate,
        summary: l.summary,
        provenance: { source: 'District Court Registry', source_system: 'CG_COURT_v1', adapter_id: 'CG_ADAPTER_v2', schema_version: '2.0.0', confidence: 'medium' },
      })),
    },
  });
}

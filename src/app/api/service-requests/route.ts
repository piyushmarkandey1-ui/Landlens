import { NextResponse } from 'next/server';
import { SERVICE_REQUESTS } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parcelId = searchParams.get('parcel_id');
  const trackingId = searchParams.get('tracking_id');
  const status = searchParams.get('status');

  let reqs = [...SERVICE_REQUESTS];
  if (parcelId) reqs = reqs.filter(r => r.parcelId === parcelId);
  if (trackingId) reqs = reqs.filter(r => r.trackingId === trackingId);
  if (status) reqs = reqs.filter(r => r.status.toLowerCase() === status.toLowerCase());

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), total: reqs.length, data_note: 'Synthetic demonstration data.' },
    data: reqs.map(r => ({
      request_id: r.id,
      parcel_id: r.parcelId,
      tracking_id: r.trackingId,
      citizen_name: r.citizenName,
      citizen_phone: r.citizenPhone,
      service_type: r.type,
      status: r.status,
      submitted_date: r.submittedDate,
      expected_date: r.expectedDate,
      assigned_officer: r.assignedOfficer,
      department: r.department,
      documents: r.documents,
      remarks: r.remarks,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { parcel_id, citizen_name, citizen_phone, service_type, documents } = body;

  if (!parcel_id || !citizen_name || !service_type) {
    return NextResponse.json({ error: 'Required: parcel_id, citizen_name, service_type' }, { status: 400 });
  }

  const trackingId = `TRK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;

  return NextResponse.json({
    meta: { api_version: '1.0.0', timestamp: new Date().toISOString(), data_note: 'Synthetic demonstration data. Request not persisted.' },
    data: {
      request_id: `SR${Date.now()}`,
      parcel_id,
      tracking_id: trackingId,
      citizen_name,
      citizen_phone,
      service_type,
      status: 'Submitted',
      submitted_date: new Date().toISOString().split('T')[0],
      expected_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      documents: documents || [],
      message: `Your service request has been submitted. Track using: ${trackingId}`,
    },
  }, { status: 201 });
}

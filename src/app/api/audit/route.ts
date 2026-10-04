import { NextResponse } from 'next/server';
import { AUDIT_LOGS } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parcelId = searchParams.get('parcel_id');
  const userId = searchParams.get('user_id');
  const action = searchParams.get('action');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  let logs = [...AUDIT_LOGS];
  if (parcelId) logs = logs.filter(l => l.parcelId === parcelId);
  if (userId) logs = logs.filter(l => l.userId === userId);
  if (action) logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));

  logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const total = logs.length;
  const paginated = logs.slice(offset, offset + limit);

  return NextResponse.json({
    meta: { api_version: '1.0.0', schema_version: '2.0.0', timestamp: new Date().toISOString(), total, limit, offset, returned: paginated.length, data_note: 'Synthetic demonstration data.' },
    data: paginated.map(l => ({
      log_id: l.id,
      timestamp: l.timestamp,
      user_id: l.userId,
      user_name: l.userName,
      user_role: l.userRole,
      action: l.action,
      entity_type: l.entityType,
      entity_id: l.entityId,
      parcel_id: l.parcelId,
      details: l.details,
      ip_address: l.ipAddress,
      department: l.department,
    })),
  });
}

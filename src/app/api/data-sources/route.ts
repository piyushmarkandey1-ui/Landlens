import { NextResponse } from 'next/server';
import { ENHANCED_DATA_SOURCES } from '@/lib/adapters';

export async function GET() {
  const summary = {
    total: ENHANCED_DATA_SOURCES.length,
    connected: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'CONNECTED').length,
    simulated: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'SIMULATED').length,
    unavailable: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'UNAVAILABLE').length,
    stale: ENHANCED_DATA_SOURCES.filter(d => d.api_status === 'STALE').length,
  };

  return NextResponse.json({
    meta: {
      api_version: '1.0.0',
      schema_version: '2.0.0',
      timestamp: new Date().toISOString(),
      data_note: 'No live government APIs are connected. All data is synthetic demonstration data.',
      warning: 'CONNECTED status would only be set when a real government API is live. All current sources are SIMULATED or UNAVAILABLE.',
    },
    summary,
    data: ENHANCED_DATA_SOURCES.map(ds => ({
      id: ds.id,
      name: ds.name,
      short_name: ds.short_name,
      department: ds.department,
      ministry: ds.ministry,
      state: ds.state,
      dataset: ds.dataset,
      description: ds.description,
      api_status: ds.api_status,
      connection_type: ds.connection_type,
      last_synced: ds.last_synced,
      record_count: ds.record_count,
      schema_version: ds.schema_version,
      data_freshness_days: ds.data_freshness_days,
      coverage_area: ds.coverage_area,
      adapter_id: ds.adapter_id,
      mock_endpoint: ds.endpoint_pattern,
      integration_notes: ds.notes,
    })),
  });
}

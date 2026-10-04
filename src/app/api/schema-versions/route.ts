import { NextResponse } from 'next/server';
import { SCHEMA_VERSION, NORMALIZATION_EXAMPLES } from '@/lib/adapters';

const SCHEMA_ENTITIES = [
  { entity: 'Parcel', canonical_fields: ['parcel_id','ulpin','survey_reference','state','district','tehsil_or_taluk','village_or_locality','area_sqm','area_acres','land_use','zoning_code','parcel_status','provenance'], version: SCHEMA_VERSION },
  { entity: 'Owner', canonical_fields: ['owner_id','parcel_id','ulpin','full_name','ownership_type','share_percent','acquisition_date','acquisition_type','is_current_owner','provenance'], version: SCHEMA_VERSION },
  { entity: 'RoR', canonical_fields: ['ror_id','parcel_id','ulpin','survey_reference','owner_name','area_sqm','area_acres','land_type','khata_no','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Registration', canonical_fields: ['registration_id','parcel_id','ulpin','document_no','registration_date','sale_value_inr','seller_name','buyer_name','status','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Mutation', canonical_fields: ['mutation_id','parcel_id','ulpin','mutation_reference','mutation_type','previous_owner','new_owner','status','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Zoning', canonical_fields: ['zoning_id','parcel_id','ulpin','current_zone_code','master_plan_reference','fsi_far','max_height_m','road_reservation','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'BuildingPermission', canonical_fields: ['permission_id','parcel_id','ulpin','application_no','permission_type','status','issuing_authority','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Encumbrance', canonical_fields: ['encumbrance_id','parcel_id','ulpin','encumbrance_type','creditor_name','amount_inr','status','registration_no','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Tax', canonical_fields: ['tax_id','parcel_id','ulpin','tax_demand_inr','tax_paid_inr','tax_due_inr','status','taxing_authority','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Litigation', canonical_fields: ['litigation_id','parcel_id','ulpin','case_no','court','case_type','status','provenance'], version: SCHEMA_VERSION },
  { entity: 'Restriction', canonical_fields: ['restriction_id','parcel_id','ulpin','restriction_type','authority','is_active','notification_no','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'Valuation', canonical_fields: ['valuation_id','parcel_id','ulpin','circle_rate_per_sqm','market_value_inr','guidance_value_inr','source_fields','provenance'], version: SCHEMA_VERSION },
  { entity: 'SatelliteChange', canonical_fields: ['change_id','parcel_id','ulpin','detected_date','change_type','confidence_percent','verification_status','satellite_source','provenance'], version: SCHEMA_VERSION },
  { entity: 'Utility', canonical_fields: ['utility_id','parcel_id','ulpin','utility_type','provider','status','provenance'], version: SCHEMA_VERSION },
];

export async function GET() {
  return NextResponse.json({
    meta: { api_version: '1.0.0', timestamp: new Date().toISOString() },
    data: {
      current_schema_version: SCHEMA_VERSION,
      versions: [
        { version: '1.0.0', released: '2023-06-01', status: 'deprecated', notes: 'Initial schema — no provenance fields.' },
        { version: '1.5.0', released: '2023-11-01', status: 'deprecated', notes: 'Added data_health. No source_terminology.' },
        { version: '2.0.0', released: '2024-03-01', status: 'current', notes: 'Full provenance, source_terminology, adapter_id, confidence. Multi-state ready.' },
        { version: '3.0.0', released: null, status: 'planned', notes: 'Cross-state conflict resolution, federated PostGIS, national ULPIN as primary key.' },
      ],
      provenance_fields: ['source','source_system','source_record_id','source_terminology','last_updated','schema_version','adapter_id','confidence','status'],
      entities: SCHEMA_ENTITIES,
      normalization_examples: NORMALIZATION_EXAMPLES,
      adapters: [
        { adapter_id: 'CG_ADAPTER_v2', state: 'Chhattisgarh', state_code: 'IN-CG', status: 'active', area_unit: 'acres', local_terms: ['Khasra','Rakba','B-1 Extract','Khatauni','Namantaran'] },
        { adapter_id: 'TN_ADAPTER_v2', state: 'Tamil Nadu', state_code: 'IN-TN', status: 'ready', area_unit: 'cents', local_terms: ['Survey Number','Extent','Patta','A-Register','Patta Transfer'] },
        { adapter_id: 'GENERIC_IN-MH_v1', state: 'Maharashtra', state_code: 'IN-MH', status: 'generic', area_unit: 'hectares', local_terms: ['Gat No','7/12 Extract','Ferfaraand'] },
        { adapter_id: 'GENERIC_IN-KA_v1', state: 'Karnataka', state_code: 'IN-KA', status: 'generic', area_unit: 'acres', local_terms: ['Hissa No','RTC','Hakkanda Badlava'] },
        { adapter_id: 'GENERIC_IN-AP_v1', state: 'Andhra Pradesh', state_code: 'IN-AP', status: 'generic', area_unit: 'acres', local_terms: ['Pahani No','Adangal','Pattadar Passbook'] },
      ],
    },
  });
}

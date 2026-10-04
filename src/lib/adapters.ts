/**
 * LandLens — Interoperability Adapter Architecture
 * =================================================
 * Demonstrates how different Indian state land administration systems
 * (different schemas, terminology, units, and workflows) are normalized
 * into one canonical parcel-centric model.
 *
 * Architecture:
 *   Source Systems → State Adapters → Canonical Schema → Parcel Intelligence
 *
 * ⚠ All records are synthetic demonstration data.
 */

// ============================================================================
// CANONICAL SCHEMA — Version 2.0
// Every entity carries provenance metadata.
// ============================================================================

export const SCHEMA_VERSION = '2.0.0';

/** Provenance metadata attached to every canonical record */
export interface Provenance {
  source: string;                   // e.g. "Bhu-Abhilekh", "DORIS", "TNREGINET"
  source_system: string;            // e.g. "CG_BHU_ABHILEKH_v3", "TN_TNREGINET_v2"
  source_record_id: string;         // Original ID in source system
  source_terminology: Record<string, string>; // Original field names preserved
  last_updated: string;             // ISO 8601
  schema_version: string;           // Canonical schema version
  adapter_id: string;               // Which adapter produced this record
  confidence: 'high' | 'medium' | 'low' | 'unverified';
  status: 'verified' | 'attention' | 'conflict' | 'unavailable';
}

// ---- Canonical Parcel -------------------------------------------------------

export interface CanonicalParcel {
  // === Identity ===
  parcel_id: string;                // LandLens internal ID
  ulpin: string;                    // 14-char national ULPIN
  survey_reference: string;         // Normalized survey/khasra identifier

  // === Location ===
  state: string;
  district: string;
  tehsil_or_taluk: string;          // Normalized: tehsil (CG) / taluk (TN) / mandal (AP)
  village_or_locality: string;
  ward?: string;
  address: string;
  lat: number;
  lng: number;
  geometry_geojson?: object;        // GeoJSON Feature

  // === Area — normalized to sq. metres ===
  area_sqm: number;
  area_acres: number;
  area_hectares: number;
  area_source_value: string;        // Original value e.g. "2.40 acres", "0.97 हेक्टेयर"
  area_source_unit: string;         // Original unit e.g. "acres", "hectares", "cents"

  // === Classification ===
  land_use: string;                 // Normalized land use
  land_type: string;                // Dry/Wet/Waste/Govt etc.
  zoning_code?: string;

  // === Status ===
  parcel_status: 'active' | 'disputed' | 'under_review' | 'restricted';
  data_health: Record<string, 'verified' | 'attention' | 'conflict' | 'unavailable'>;

  provenance: Provenance;
}

// ---- Canonical Owner --------------------------------------------------------

export interface CanonicalOwner {
  owner_id: string;
  parcel_id: string;
  ulpin: string;

  full_name: string;
  father_or_husband_name: string;
  aadhaar_last4?: string;
  ownership_type: 'individual' | 'joint' | 'government' | 'trust' | 'company';
  share_percent: number;
  acquisition_date: string;
  acquisition_type: 'purchase' | 'inheritance' | 'gift' | 'court_order' | 'government_allotment';
  is_current_owner: boolean;

  // Source-specific fields preserved
  source_owner_identifier?: string; // Khatauni No (CG), Patta No (TN)

  provenance: Provenance;
}

// ---- Canonical RoR (Record of Rights) ---------------------------------------

export interface CanonicalRoR {
  ror_id: string;
  parcel_id: string;
  ulpin: string;

  // === Normalized Fields ===
  survey_reference: string;         // Khasra (CG/MP), Survey No (TN/KA), Patta (AP)
  owner_name: string;
  cultivator_name?: string;
  area_sqm: number;
  area_acres: number;
  land_type: string;
  khata_no: string;                 // Normalized account reference
  irrigation_source?: string;
  last_updated: string;

  // === Source Terminology (never erased) ===
  // Chhattisgarh: Khasra, Rakba, B-1, Khatauni
  // Tamil Nadu: Survey Number, Extent, Patta, A-Register
  // Maharashtra: Gat No, Khatauni, 7/12 Extract
  // Andhra Pradesh: Survey No, Pahani, Adangal
  source_fields: {
    local_survey_term: string;      // "Khasra" / "Survey Number" / "Gat No" / "Pahani No"
    local_area_term: string;        // "Rakba" / "Extent" / "Area" / "Acreage"
    local_record_term: string;      // "B-1" / "A-Register" / "7/12" / "Adangal"
    local_account_term: string;     // "Khatauni" / "Patta" / "Khata"
    original_area_value: string;    // Verbatim from source
    original_area_unit: string;
  };

  provenance: Provenance;
}

// ---- Canonical Registration -------------------------------------------------

export interface CanonicalRegistration {
  registration_id: string;
  parcel_id: string;
  ulpin: string;

  document_no: string;
  registration_date: string;
  sale_value_inr: number;
  stamp_duty_inr: number;
  area_sqm: number;
  seller_name: string;
  buyer_name: string;
  property_type: string;
  sub_registrar_office: string;
  status: 'registered' | 'pending' | 'cancelled';

  // Source fields
  source_fields: {
    local_doc_type: string;         // "Sale Deed" / "Absolute Sale Deed" / "Gift Deed"
    local_office_term: string;      // "SRO" / "Sub-Registrar" / "Thasil Office"
    registration_system: string;    // "DORIS" / "TNREGINET" / "KAVERI"
  };

  provenance: Provenance;
}

// ---- Canonical Mutation -----------------------------------------------------

export interface CanonicalMutation {
  mutation_id: string;
  parcel_id: string;
  ulpin: string;

  mutation_reference: string;       // Normalized ref no
  mutation_date: string;
  mutation_type: 'sale' | 'inheritance' | 'gift' | 'court_order' | 'partition';
  previous_owner: string;
  new_owner: string;
  status: 'approved' | 'pending' | 'rejected';
  approved_by?: string;
  remarks?: string;

  source_fields: {
    local_mutation_term: string;    // "Mutation" (CG/MP) / "Patta Transfer" (TN) / "Hakkanda Badlava" (KA)
    local_mutation_no: string;
    local_authority: string;
  };

  provenance: Provenance;
}

// ---- Canonical Zoning / Master Plan -----------------------------------------

export interface CanonicalZoning {
  zoning_id: string;
  parcel_id: string;
  ulpin: string;

  current_zone_code: string;
  proposed_zone_code?: string;
  master_plan_reference: string;
  land_use_designation: string;
  fsi_far: number;                  // Floor Space Index / Floor Area Ratio
  max_height_m: number;
  setback_front_m: number;
  setback_side_m: number;
  road_reservation: boolean;
  road_width_m?: number;

  source_fields: {
    local_plan_name: string;        // "RDP 2031" / "CMDA 2026" / "Master Plan 2041"
    local_fsi_term: string;         // "FSI" / "FAR" / "Floor Area Ratio"
    planning_authority: string;
  };

  provenance: Provenance;
}

// ---- Canonical Building Permission ------------------------------------------

export interface CanonicalBuildingPermission {
  permission_id: string;
  parcel_id: string;
  ulpin: string;

  application_no: string;
  applicant_name: string;
  permission_type: 'new_construction' | 'addition' | 'alteration' | 'demolition';
  approved_area_sqm?: number;
  floors?: number;
  status: 'approved' | 'pending' | 'rejected' | 'expired' | 'under_review';
  applied_date: string;
  approved_date?: string;
  valid_upto?: string;
  issuing_authority: string;

  source_fields: {
    local_permission_term: string;  // "Building Plan Approval" / "Building Permit" / "Construction Permit"
    local_authority_term: string;   // "RMC" / "Corporation" / "Panchayat"
  };

  provenance: Provenance;
}

// ---- Canonical Encumbrance / Mortgage ---------------------------------------

export interface CanonicalEncumbrance {
  encumbrance_id: string;
  parcel_id: string;
  ulpin: string;

  encumbrance_type: 'mortgage' | 'lien' | 'easement' | 'attachment' | 'court_order';
  creditor_name: string;
  amount_inr?: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'released' | 'expired';
  registration_no: string;
  bank_name?: string;

  source_fields: {
    local_ec_term: string;          // "Encumbrance Certificate" / "EC" / "Bharam Praman Patra"
    local_registration_system: string; // "CERSAI" / "SRO EC System"
  };

  provenance: Provenance;
}

// ---- Canonical Tax ----------------------------------------------------------

export interface CanonicalTax {
  tax_id: string;
  parcel_id: string;
  ulpin: string;

  property_reference: string;
  annual_value_inr: number;
  tax_demand_inr: number;
  tax_paid_inr: number;
  tax_due_inr: number;
  last_payment_date?: string;
  financial_year: string;
  status: 'paid' | 'partial' | 'defaulter' | 'exempted';
  taxing_authority: string;

  source_fields: {
    local_tax_term: string;         // "Property Tax" / "House Tax" / "Building Tax"
    local_property_id_term: string; // "Property ID" / "Ward No" / "Assessment No"
    local_authority_name: string;
  };

  provenance: Provenance;
}

// ---- Canonical Litigation ---------------------------------------------------

export interface CanonicalLitigation {
  litigation_id: string;
  parcel_id: string;
  ulpin: string;

  case_no: string;
  court: string;
  case_type: string;
  plaintiff: string;
  defendant: string;
  filed_date: string;
  status: 'active' | 'disposed' | 'stayed';
  next_hearing_date?: string;
  summary: string;

  provenance: Provenance;
}

// ---- Canonical Environmental Restriction ------------------------------------

export interface CanonicalRestriction {
  restriction_id: string;
  parcel_id: string;
  ulpin: string;

  restriction_type: 'forest_buffer' | 'flood_zone' | 'wetland' | 'heritage' | 'airport_zone' | 'no_development_zone' | 'coastal_regulation' | 'eco_sensitive';
  authority: string;
  description: string;
  is_active: boolean;
  notification_no?: string;
  notification_date?: string;

  source_fields: {
    local_restriction_term: string;
    issuing_act: string;            // "Forest Conservation Act" / "CRZ Notification" / "EIA"
  };

  provenance: Provenance;
}

// ---- Canonical Valuation ----------------------------------------------------

export interface CanonicalValuation {
  valuation_id: string;
  parcel_id: string;
  ulpin: string;

  circle_rate_per_sqm: number;
  market_value_inr: number;
  guidance_value_inr: number;
  total_value_inr: number;
  valuation_date: string;
  valuation_authority: string;

  source_fields: {
    local_rate_term: string;        // "Circle Rate" / "Guidance Value" / "Ready Reckoner Rate"
    local_authority: string;
  };

  provenance: Provenance;
}

// ---- Canonical Satellite Change ---------------------------------------------

export interface CanonicalSatelliteChange {
  change_id: string;
  parcel_id: string;
  ulpin: string;

  detected_date: string;
  change_type: 'construction_started' | 'structure_added' | 'vegetation_cleared' | 'boundary_shift' | 'building_demolished';
  confidence_percent: number;
  area_affected_sqm?: number;
  requires_verification: boolean;
  verification_status: 'pending' | 'verified' | 'dismissed';
  satellite_source: string;
  image_resolution_m?: number;

  provenance: Provenance;
}

// ---- Canonical Utility / Infrastructure -------------------------------------

export interface CanonicalUtility {
  utility_id: string;
  parcel_id: string;
  ulpin: string;

  utility_type: 'water' | 'electricity' | 'gas' | 'drainage' | 'telecom' | 'road';
  connection_no?: string;
  provider: string;
  status: 'active' | 'disconnected' | 'pending' | 'not_connected';

  provenance: Provenance;
}

// ============================================================================
// STATE ADAPTER BASE
// ============================================================================

export interface AdapterConfig {
  adapter_id: string;
  state: string;
  state_code: string;         // ISO 3166-2 e.g. "IN-CG"
  supported_systems: string[];
  schema_mappings: Record<string, string>;  // source_field → canonical_field
  terminology: Record<string, string>;      // local term → canonical term
  area_unit: string;          // native area unit
  area_to_sqm: number;        // conversion factor to sq. metres
}

export abstract class StateAdapter {
  abstract config: AdapterConfig;

  /** Transform any raw source record into a provenance-tagged canonical record */
  protected makeProvenance(
    source: string,
    source_system: string,
    source_record_id: string,
    source_terminology: Record<string, string>,
    last_updated: string,
    confidence: Provenance['confidence'] = 'medium'
  ): Provenance {
    return {
      source,
      source_system,
      source_record_id,
      source_terminology,
      last_updated,
      schema_version: SCHEMA_VERSION,
      adapter_id: this.config.adapter_id,
      confidence,
      status: 'verified',
    };
  }

  /** Convert area from native unit to sq. metres */
  protected toSqm(value: number): number {
    return Math.round(value * this.config.area_to_sqm);
  }

  /** Convert area from native unit to acres */
  protected toAcres(value: number): number {
    return Math.round((value * this.config.area_to_sqm) / 4046.86 * 100) / 100;
  }

  /** Map source field name to canonical field name */
  protected mapField(sourceField: string): string {
    return this.config.schema_mappings[sourceField] || sourceField;
  }
}

// ============================================================================
// CHHATTISGARH ADAPTER
// Terminology: Khasra, Rakba (area), B-1 (RoR), Khatauni, Namantaran (mutation)
// Area unit: acres
// Systems: Bhu-Abhilekh, DORIS (CG), RDA, RMC
// ============================================================================

export class ChhattisgarhAdapter extends StateAdapter {
  config: AdapterConfig = {
    adapter_id: 'CG_ADAPTER_v2',
    state: 'Chhattisgarh',
    state_code: 'IN-CG',
    supported_systems: ['CG_BHU_ABHILEKH_v3', 'CG_DORIS_v4', 'CG_RDA_v1', 'CG_RMC_TAX_v2'],
    schema_mappings: {
      // RoR mappings
      'khasra_no': 'survey_reference',
      'rakba': 'area_acres',
      'khatauni_no': 'khata_no',
      'b1_extract_id': 'ror_id',
      'gram': 'village_or_locality',
      'tehsil': 'tehsil_or_taluk',
      // Registration mappings
      'doris_doc_no': 'document_no',
      'bainama_value': 'sale_value_inr',
      // Mutation mappings
      'namantaran_no': 'mutation_reference',
      'purva_swami': 'previous_owner',
      'naya_swami': 'new_owner',
    },
    terminology: {
      'Khasra': 'Survey Reference',
      'Rakba': 'Area',
      'B-1 Extract': 'Record of Rights (RoR)',
      'Khatauni': 'Ownership Account',
      'Namantaran': 'Mutation',
      'Patwari': 'Revenue Inspector',
      'Tehsildar': 'Revenue Officer',
      'Nazar': 'Revenue Ward',
      'Gram Panchayat': 'Local Body',
    },
    area_unit: 'acres',
    area_to_sqm: 4046.86,
  };

  transformRoR(raw: {
    khasra_no: string; rakba: number; khatauni_no: string;
    swami_naam: string; kasht_naam?: string; bhu_prakar: string;
    sinchai_strot?: string; b1_id: string; gram: string;
    tehsil: string; zila: string; last_updated: string;
  }): CanonicalRoR {
    return {
      ror_id: `CG-ROR-${raw.b1_id}`,
      parcel_id: `CG-${raw.khasra_no.replace('/', '-')}`,
      ulpin: `CG-RJP-${raw.b1_id}`,
      survey_reference: raw.khasra_no,
      owner_name: raw.swami_naam,
      cultivator_name: raw.kasht_naam,
      area_sqm: this.toSqm(raw.rakba),
      area_acres: raw.rakba,
      land_type: raw.bhu_prakar,
      khata_no: raw.khatauni_no,
      irrigation_source: raw.sinchai_strot,
      last_updated: raw.last_updated,
      source_fields: {
        local_survey_term: 'Khasra',
        local_area_term: 'Rakba',
        local_record_term: 'B-1 Extract',
        local_account_term: 'Khatauni',
        original_area_value: `${raw.rakba} acres`,
        original_area_unit: 'acres',
      },
      provenance: this.makeProvenance(
        'Bhu-Abhilekh', 'CG_BHU_ABHILEKH_v3', raw.b1_id,
        { khasra_no: raw.khasra_no, rakba: String(raw.rakba), khatauni_no: raw.khatauni_no },
        raw.last_updated, 'high'
      ),
    };
  }

  transformMutation(raw: {
    namantaran_no: string; tarikh: string; prakar: string;
    purva_swami: string; naya_swami: string; sthiti: string;
    adhikari?: string; khasra_no: string;
  }): CanonicalMutation {
    const typeMap: Record<string, CanonicalMutation['mutation_type']> = {
      'Vikray': 'sale', 'Varasat': 'inheritance', 'Dan': 'gift',
      'Nyayalay Aadesh': 'court_order', 'Vibhajan': 'partition',
    };
    return {
      mutation_id: `CG-MUT-${raw.namantaran_no}`,
      parcel_id: `CG-${raw.khasra_no.replace('/', '-')}`,
      ulpin: '',
      mutation_reference: raw.namantaran_no,
      mutation_date: raw.tarikh,
      mutation_type: typeMap[raw.prakar] || 'sale',
      previous_owner: raw.purva_swami,
      new_owner: raw.naya_swami,
      status: raw.sthiti === 'Swikrit' ? 'approved' : raw.sthiti === 'Nirast' ? 'rejected' : 'pending',
      approved_by: raw.adhikari,
      source_fields: {
        local_mutation_term: 'Namantaran',
        local_mutation_no: raw.namantaran_no,
        local_authority: 'Tehsildar / Patwari',
      },
      provenance: this.makeProvenance(
        'Bhu-Abhilekh', 'CG_BHU_ABHILEKH_v3', raw.namantaran_no,
        { namantaran_no: raw.namantaran_no, prakar: raw.prakar, sthiti: raw.sthiti },
        raw.tarikh, 'high'
      ),
    };
  }
}

// ============================================================================
// TAMIL NADU ADAPTER
// Terminology: Survey Number, Extent (area), Patta, A-Register, Chitta,
//              Adangal, Thasil (not Tehsil), Taluk (not Tehsil), Kiramam (Village)
// Area unit: cents (1 acre = 100 cents), also square feet for urban
// Systems: TNREGINET (Registration), Bhoomi Portal (Land Records)
// ============================================================================

export class TamilNaduAdapter extends StateAdapter {
  config: AdapterConfig = {
    adapter_id: 'TN_ADAPTER_v2',
    state: 'Tamil Nadu',
    state_code: 'IN-TN',
    supported_systems: ['TN_TNREGINET_v2', 'TN_BHOOMI_v1', 'TN_CMDA_v1', 'TN_TAX_v1'],
    schema_mappings: {
      // RoR / A-Register mappings
      'survey_no': 'survey_reference',
      'sub_division': 'survey_reference',
      'extent_cents': 'area_acres',    // cents → converted
      'patta_no': 'khata_no',
      'pattadar_name': 'owner_name',
      'kiramam': 'village_or_locality',
      'taluk': 'tehsil_or_taluk',
      // Registration mappings
      'tnreginet_doc_no': 'document_no',
      'market_value': 'sale_value_inr',
      // Mutation (Patta Transfer) mappings
      'patta_transfer_no': 'mutation_reference',
      'old_pattadar': 'previous_owner',
      'new_pattadar': 'new_owner',
    },
    terminology: {
      'Survey Number': 'Survey Reference',
      'Extent': 'Area',
      'Patta': 'Ownership Record (RoR)',
      'A-Register': 'Land Register',
      'Chitta': 'Land Classification Record',
      'Adangal': 'Village Account',
      'Thasil': 'Revenue Office',
      'Taluk': 'Sub-district (Tehsil)',
      'Kiramam': 'Village',
      'Pattadar': 'Land Owner',
      'Patta Transfer': 'Mutation',
      'Natham': 'Residential Settlement Land',
    },
    area_unit: 'cents',
    area_to_sqm: 40.4686, // 1 cent = 40.4686 sqm
  };

  transformRoR(raw: {
    survey_no: string; sub_division?: string; extent_cents: number;
    patta_no: string; pattadar_name: string; nature_of_land: string;
    kiramam: string; taluk: string; district: string;
    a_register_id: string; last_updated: string; irrigation?: string;
  }): CanonicalRoR {
    const surveyRef = raw.sub_division
      ? `${raw.survey_no}/${raw.sub_division}`
      : raw.survey_no;
    const areaAcres = Math.round(raw.extent_cents / 100 * 100) / 100;

    return {
      ror_id: `TN-ROR-${raw.a_register_id}`,
      parcel_id: `TN-${raw.survey_no.replace('/', '-')}`,
      ulpin: `TN-${raw.district.toUpperCase().slice(0, 3)}-${raw.a_register_id}`,
      survey_reference: surveyRef,
      owner_name: raw.pattadar_name,
      area_sqm: this.toSqm(raw.extent_cents),
      area_acres: areaAcres,
      land_type: raw.nature_of_land,
      khata_no: raw.patta_no,
      irrigation_source: raw.irrigation,
      last_updated: raw.last_updated,
      source_fields: {
        local_survey_term: 'Survey Number',
        local_area_term: 'Extent',
        local_record_term: 'A-Register / Chitta',
        local_account_term: 'Patta',
        original_area_value: `${raw.extent_cents} cents`,
        original_area_unit: 'cents',
      },
      provenance: this.makeProvenance(
        'Bhoomi Portal', 'TN_BHOOMI_v1', raw.a_register_id,
        { survey_no: raw.survey_no, extent_cents: String(raw.extent_cents), patta_no: raw.patta_no },
        raw.last_updated, 'high'
      ),
    };
  }

  transformMutation(raw: {
    patta_transfer_no: string; date: string; type: string;
    old_pattadar: string; new_pattadar: string; status: string;
    thasil_office: string; survey_no: string;
  }): CanonicalMutation {
    const typeMap: Record<string, CanonicalMutation['mutation_type']> = {
      'Sale': 'sale', 'Inheritance': 'inheritance', 'Gift': 'gift',
      'Court Order': 'court_order', 'Partition': 'partition',
    };
    return {
      mutation_id: `TN-MUT-${raw.patta_transfer_no}`,
      parcel_id: `TN-${raw.survey_no.replace('/', '-')}`,
      ulpin: '',
      mutation_reference: raw.patta_transfer_no,
      mutation_date: raw.date,
      mutation_type: typeMap[raw.type] || 'sale',
      previous_owner: raw.old_pattadar,
      new_owner: raw.new_pattadar,
      status: raw.status === 'Approved' ? 'approved' : raw.status === 'Rejected' ? 'rejected' : 'pending',
      source_fields: {
        local_mutation_term: 'Patta Transfer',
        local_mutation_no: raw.patta_transfer_no,
        local_authority: `Thasil Office — ${raw.thasil_office}`,
      },
      provenance: this.makeProvenance(
        'TNREGINET', 'TN_TNREGINET_v2', raw.patta_transfer_no,
        { patta_transfer_no: raw.patta_transfer_no, type: raw.type, status: raw.status },
        raw.date, 'high'
      ),
    };
  }
}

// ============================================================================
// GENERIC / FALLBACK ADAPTER
// Used when no state-specific adapter exists.
// Maps common fields with minimal assumptions.
// ============================================================================

export class GenericStateAdapter extends StateAdapter {
  config: AdapterConfig;

  constructor(state: string, stateCode: string, areaUnit = 'acres', areaToSqm = 4046.86) {
    super();
    this.config = {
      adapter_id: `GENERIC_${stateCode}_v1`,
      state,
      state_code: stateCode,
      supported_systems: [`${stateCode}_GENERIC_v1`],
      schema_mappings: {
        'survey_number': 'survey_reference',
        'survey_no': 'survey_reference',
        'khasra_no': 'survey_reference',
        'extent': 'area_source_value',
        'area': 'area_source_value',
        'rakba': 'area_source_value',
        'owner': 'owner_name',
        'pattadar': 'owner_name',
        'swami': 'owner_name',
        'taluk': 'tehsil_or_taluk',
        'tehsil': 'tehsil_or_taluk',
        'mandal': 'tehsil_or_taluk',
        'village': 'village_or_locality',
        'kiramam': 'village_or_locality',
        'gram': 'village_or_locality',
      },
      terminology: {
        'Survey Number / Khasra': 'Survey Reference',
        'Extent / Rakba': 'Area',
        'RoR / Patta / B-1': 'Record of Rights',
        'Mutation / Patta Transfer / Hakkanda': 'Mutation',
      },
      area_unit: areaUnit,
      area_to_sqm: areaToSqm,
    };
  }

  transformGenericRoR(raw: Record<string, string>): Partial<CanonicalRoR> {
    const surveyRef = raw['khasra_no'] || raw['survey_number'] || raw['survey_no'] || raw['patta_no'] || 'UNKNOWN';
    const areaRaw = raw['rakba'] || raw['extent'] || raw['area'] || '0';
    const areaParsed = parseFloat(areaRaw) || 0;

    return {
      survey_reference: surveyRef,
      owner_name: raw['owner'] || raw['pattadar'] || raw['swami'] || 'Unknown',
      area_sqm: this.toSqm(areaParsed),
      area_acres: this.toAcres(areaParsed),
      land_type: raw['land_type'] || raw['bhu_prakar'] || raw['nature_of_land'] || 'Unknown',
      khata_no: raw['khatauni_no'] || raw['patta_no'] || raw['khata_no'] || 'UNKNOWN',
      source_fields: {
        local_survey_term: 'Survey Reference',
        local_area_term: 'Area',
        local_record_term: 'Land Record',
        local_account_term: 'Ownership Record',
        original_area_value: areaRaw,
        original_area_unit: this.config.area_unit,
      },
      provenance: this.makeProvenance(
        this.config.state, `${this.config.state_code}_GENERIC_v1`,
        raw['record_id'] || 'UNKNOWN',
        Object.fromEntries(Object.entries(raw).slice(0, 6)),
        raw['last_updated'] || new Date().toISOString(),
        'low'
      ),
    };
  }
}

// ============================================================================
// ADAPTER REGISTRY
// ============================================================================

export const ADAPTER_REGISTRY: Record<string, StateAdapter> = {
  'IN-CG': new ChhattisgarhAdapter(),
  'IN-TN': new TamilNaduAdapter(),
  'IN-MH': new GenericStateAdapter('Maharashtra', 'IN-MH', 'hectares', 10000),
  'IN-KA': new GenericStateAdapter('Karnataka', 'IN-KA', 'acres', 4046.86),
  'IN-AP': new GenericStateAdapter('Andhra Pradesh', 'IN-AP', 'acres', 4046.86),
  'IN-UP': new GenericStateAdapter('Uttar Pradesh', 'IN-UP', 'bigha', 2529.29),
  'IN-RJ': new GenericStateAdapter('Rajasthan', 'IN-RJ', 'bigha', 2529.29),
};

export function getAdapter(stateCode: string): StateAdapter {
  return ADAPTER_REGISTRY[stateCode] || new GenericStateAdapter('Unknown', stateCode);
}

// ============================================================================
// NORMALIZATION EXAMPLES
// Side-by-side comparison of source terminology → canonical
// ============================================================================

export const NORMALIZATION_EXAMPLES = [
  {
    title: 'Survey / Plot Reference',
    states: [
      { state: 'Chhattisgarh', term: 'Khasra', example: '123/1', system: 'Bhu-Abhilekh' },
      { state: 'Tamil Nadu', term: 'Survey Number', example: '456/2B', system: 'Bhoomi Portal' },
      { state: 'Maharashtra', term: 'Gat No / CTS No', example: '789', system: '7/12 Portal' },
      { state: 'Andhra Pradesh', term: 'Survey No / Pahani No', example: '234/A', system: 'MeeSeva' },
      { state: 'Uttar Pradesh', term: 'Khata No', example: '012/34', system: 'Bhulekh' },
      { state: 'Karnataka', term: 'Hissa No', example: '56/3', system: 'Bhoomi' },
    ],
    canonical_field: 'survey_reference',
    canonical_example: 'CG-RJP-0001-0123/1',
  },
  {
    title: 'Area Measurement',
    states: [
      { state: 'Chhattisgarh', term: 'Rakba', example: '2.40 acres', system: 'Bhu-Abhilekh' },
      { state: 'Tamil Nadu', term: 'Extent', example: '240 cents', system: 'Bhoomi Portal' },
      { state: 'Maharashtra', term: 'Kshetrafal', example: '0.97 hectares', system: '7/12 Portal' },
      { state: 'Andhra Pradesh', term: 'Acreage', example: '2.40 acres', system: 'MeeSeva' },
      { state: 'Uttar Pradesh', term: 'Rukba', example: '5.76 bigha', system: 'Bhulekh' },
      { state: 'Karnataka', term: 'Acreage', example: '2.40 acres', system: 'Bhoomi' },
    ],
    canonical_field: 'area_sqm + area_acres',
    canonical_example: '9712 sqm / 2.40 acres',
  },
  {
    title: 'Record of Rights',
    states: [
      { state: 'Chhattisgarh', term: 'B-1 Extract', example: 'B1-RJP-2024-001', system: 'Bhu-Abhilekh' },
      { state: 'Tamil Nadu', term: 'Patta / A-Register', example: 'Patta-001234', system: 'Bhoomi Portal' },
      { state: 'Maharashtra', term: '7/12 Extract', example: '7/12-MH-789', system: '7/12 Portal' },
      { state: 'Andhra Pradesh', term: 'Pahani / Adangal', example: 'ADG-AP-234', system: 'MeeSeva' },
      { state: 'Uttar Pradesh', term: 'Khatauni', example: 'KHT-UP-012', system: 'Bhulekh' },
      { state: 'Karnataka', term: 'RTC (Record of Rights)', example: 'RTC-KA-56', system: 'Bhoomi' },
    ],
    canonical_field: 'ror_id',
    canonical_example: 'ROR-ULPIN-CG-RJP-0001-0001',
  },
  {
    title: 'Ownership Transfer (Mutation)',
    states: [
      { state: 'Chhattisgarh', term: 'Namantaran', example: 'NAM-2024-1234', system: 'Bhu-Abhilekh' },
      { state: 'Tamil Nadu', term: 'Patta Transfer', example: 'PT-TN-5678', system: 'TNREGINET' },
      { state: 'Maharashtra', term: 'Ferfaraand', example: 'FF-MH-9012', system: '7/12 Portal' },
      { state: 'Andhra Pradesh', term: 'Pahani Correction', example: 'PC-AP-3456', system: 'MeeSeva' },
      { state: 'Uttar Pradesh', term: 'Dakhil Kharij', example: 'DK-UP-7890', system: 'Bhulekh' },
      { state: 'Karnataka', term: 'Hakkanda Badlava', example: 'HB-KA-1234', system: 'Bhoomi' },
    ],
    canonical_field: 'mutation_reference',
    canonical_example: 'MUT-2024-CG-001234',
  },
  {
    title: 'Sub-district Administrative Unit',
    states: [
      { state: 'Chhattisgarh', term: 'Tehsil', example: 'Raipur Tehsil', system: 'Revenue Dept' },
      { state: 'Tamil Nadu', term: 'Taluk / Thasil', example: 'Saidapet Taluk', system: 'Revenue Dept' },
      { state: 'Maharashtra', term: 'Taluka', example: 'Pune Taluka', system: 'Revenue Dept' },
      { state: 'Andhra Pradesh', term: 'Mandal', example: 'Vijayawada Mandal', system: 'Revenue Dept' },
      { state: 'Uttar Pradesh', term: 'Tehsil / Pargana', example: 'Allahabad Tehsil', system: 'Revenue Dept' },
      { state: 'Karnataka', term: 'Hobli / Taluk', example: 'Bengaluru Taluk', system: 'Revenue Dept' },
    ],
    canonical_field: 'tehsil_or_taluk',
    canonical_example: 'Raipur',
  },
];

// ============================================================================
// DATA SOURCE REGISTRY (enhanced)
// ============================================================================

export interface EnhancedDataSource {
  id: string;
  name: string;
  short_name: string;
  department: string;
  ministry: string;
  state: string;           // 'National' or state name
  dataset: string;
  description: string;
  api_status: 'CONNECTED' | 'SIMULATED' | 'UNAVAILABLE' | 'STALE';
  connection_type: 'Live REST API' | 'Demo Connector' | 'Batch Import' | 'Planned';
  last_synced: string;
  record_count: number;
  schema_version: string;
  data_freshness_days: number;
  coverage_area: string;
  adapter_id: string;
  endpoint_pattern?: string;  // mock endpoint, not real
  notes: string;
}

export const ENHANCED_DATA_SOURCES: EnhancedDataSource[] = [
  {
    id: 'DS001', name: 'Bhu-Abhilekh', short_name: 'BHU',
    department: 'Board of Revenue, Chhattisgarh', ministry: 'Revenue & Disaster Management',
    state: 'Chhattisgarh', dataset: 'Record of Rights (RoR / B1 Extract)',
    description: 'State land records portal — digitized khasra, khatauni, B1 records.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-03-01T06:00:00Z', record_count: 8900000, schema_version: '3.2',
    data_freshness_days: 1, coverage_area: 'All Districts, Chhattisgarh',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/ror',
    notes: 'Demo connector. In production requires Board of Revenue API agreement.',
  },
  {
    id: 'DS002', name: 'Bhu-Naksha', short_name: 'BNAKSHA',
    department: 'Department of Land Resources (DoLR)', ministry: 'Rural Development',
    state: 'National', dataset: 'Cadastral Parcel Boundaries (GIS)',
    description: 'Digital cadastral maps — parcel boundaries, survey numbers.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-02-15T08:00:00Z', record_count: 12500000, schema_version: '2.1',
    data_freshness_days: 30, coverage_area: 'All Districts, Chhattisgarh',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id',
    notes: 'GeoJSON boundaries available via NIC/DoLR portal.',
  },
  {
    id: 'DS003', name: 'DORIS (CG)', short_name: 'DORIS',
    department: 'Registration Department, Chhattisgarh', ministry: 'Revenue & Disaster Management',
    state: 'Chhattisgarh', dataset: 'Property Registrations & Deeds',
    description: 'Document Registration Information System — sale deeds, mortgages, gift deeds.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-03-01T00:00:00Z', record_count: 4200000, schema_version: '4.0',
    data_freshness_days: 1, coverage_area: 'All Sub-Registrar Offices, Chhattisgarh',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/registrations',
    notes: 'TN equivalent: TNREGINET. Maharashtra equivalent: IGRS.',
  },
  {
    id: 'DS004', name: 'RDA Master Plan', short_name: 'RDA',
    department: 'Raipur Development Authority', ministry: 'Urban Administration & Development',
    state: 'Chhattisgarh', dataset: 'Raipur Development Plan 2031/2041',
    description: 'Urban master plan zoning, land use designations, road reservations.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-01-01T00:00:00Z', record_count: 125000, schema_version: '1.5',
    data_freshness_days: 90, coverage_area: 'Raipur Urban Area',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/zoning',
    notes: 'Equivalent: CMDA (Chennai), BMRDA (Bengaluru), HMDA (Hyderabad).',
  },
  {
    id: 'DS005', name: 'RMC Property Tax', short_name: 'RMC-TAX',
    department: 'Raipur Municipal Corporation', ministry: 'Urban Administration & Development',
    state: 'Chhattisgarh', dataset: 'Property Tax Assessment & Payment Records',
    description: 'Municipal property tax demand, payment, and defaulter data.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-03-01T00:00:00Z', record_count: 320000, schema_version: '2.3',
    data_freshness_days: 1, coverage_area: 'Raipur Municipal Area',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/tax',
    notes: 'Municipal systems vary widely by ULB. Requires per-ULB integration.',
  },
  {
    id: 'DS006', name: 'CERSAI', short_name: 'CERSAI',
    department: 'CERSAI (Central Registry)', ministry: 'Finance',
    state: 'National', dataset: 'Mortgage / Encumbrance Records',
    description: 'Central repository of security interests — mortgages, charges, liens.',
    api_status: 'UNAVAILABLE', connection_type: 'Planned',
    last_synced: '2024-02-28T00:00:00Z', record_count: 85000000, schema_version: '3.0',
    data_freshness_days: 7, coverage_area: 'National',
    adapter_id: 'GENERIC_IN_v1', endpoint_pattern: '/api/parcels/:id/restrictions',
    notes: 'Planned via RBI CERSAI API. Requires banking sector agreement.',
  },
  {
    id: 'DS007', name: 'ISRO Bhuvan', short_name: 'BHUVAN',
    department: 'ISRO / National Remote Sensing Centre', ministry: 'Space',
    state: 'National', dataset: 'Satellite Imagery & Change Detection',
    description: 'Bi-annual land use change detection using Resourcesat-2A imagery.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-02-20T00:00:00Z', record_count: 0, schema_version: '1.0',
    data_freshness_days: 180, coverage_area: 'National',
    adapter_id: 'GENERIC_IN_v1', endpoint_pattern: '/api/parcels/:id/satellite',
    notes: 'Bhuvan OGC WMS available. Change detection requires NRSC collaboration.',
  },
  {
    id: 'DS008', name: 'DGCA Airport Zones', short_name: 'DGCA',
    department: 'DGCA / Airports Authority of India', ministry: 'Civil Aviation',
    state: 'National', dataset: 'Airport Obstacle Limitation Surfaces',
    description: 'Height restriction zones and no-build areas around airports.',
    api_status: 'STALE', connection_type: 'Batch Import',
    last_synced: '2023-04-01T00:00:00Z', record_count: 850, schema_version: '1.0',
    data_freshness_days: 365, coverage_area: 'National',
    adapter_id: 'GENERIC_IN_v1', endpoint_pattern: '/api/parcels/:id/restrictions',
    notes: 'GIS layers available from AAI. Last import April 2023 — stale.',
  },
  {
    id: 'DS009', name: 'District Court Registry', short_name: 'COURT',
    department: 'District Court Raipur', ministry: 'Law & Justice',
    state: 'Chhattisgarh', dataset: 'Litigation & Property Dispute Records',
    description: 'Court cases involving land title disputes, attachment orders, injunctions.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-02-29T00:00:00Z', record_count: 28000, schema_version: '1.2',
    data_freshness_days: 7, coverage_area: 'Raipur District',
    adapter_id: 'CG_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/conflicts',
    notes: 'NJDG (National Judicial Data Grid) integration is the production path.',
  },
  {
    id: 'DS010', name: 'ULPIN Registry', short_name: 'ULPIN',
    department: 'DoLR / NIC', ministry: 'Rural Development',
    state: 'National', dataset: 'Unique Land Parcel Identification Numbers',
    description: 'National ULPIN registry mapping unique 14-digit parcel identifiers.',
    api_status: 'SIMULATED', connection_type: 'Demo Connector',
    last_synced: '2024-01-15T00:00:00Z', record_count: 630000000, schema_version: '2.0',
    data_freshness_days: 30, coverage_area: 'National',
    adapter_id: 'GENERIC_IN_v1', endpoint_pattern: '/api/parcels',
    notes: 'DILRMP ULPIN registry — central identity anchor for all parcel data.',
  },
  {
    id: 'DS011', name: 'TNREGINET', short_name: 'TNREG',
    department: 'Inspector General of Registration, Tamil Nadu', ministry: 'Revenue',
    state: 'Tamil Nadu', dataset: 'Property Registrations — Tamil Nadu',
    description: 'Tamil Nadu property registration system. Equivalent of DORIS for TN.',
    api_status: 'UNAVAILABLE', connection_type: 'Planned',
    last_synced: '2024-01-01T00:00:00Z', record_count: 6800000, schema_version: '2.0',
    data_freshness_days: 1, coverage_area: 'All Districts, Tamil Nadu',
    adapter_id: 'TN_ADAPTER_v2', endpoint_pattern: '/api/parcels/:id/registrations',
    notes: 'TN adapter built and ready. Awaiting IGRS TN API integration agreement.',
  },
  {
    id: 'DS012', name: 'PM-SVAMITVA', short_name: 'SVAMITVA',
    department: 'Ministry of Panchayati Raj / Survey of India', ministry: 'Rural Development',
    state: 'National', dataset: 'Drone Survey — Rural Habitation',
    description: 'SVAMITVA scheme drone survey data for rural habitation land records.',
    api_status: 'UNAVAILABLE', connection_type: 'Planned',
    last_synced: '2023-12-01T00:00:00Z', record_count: 24000000, schema_version: '1.0',
    data_freshness_days: 180, coverage_area: 'Rural habitations, National',
    adapter_id: 'GENERIC_IN_v1',
    notes: 'Critical for rural parcel identity. API integration with Survey of India planned.',
  },
];

// ============================================================================
// SCALABILITY PLAN
// ============================================================================

export const SCALABILITY_PLAN = {
  phases: [
    {
      phase: 1,
      title: 'Single City (Raipur)',
      description: 'Current prototype. One district, synthetic data, demo connectors.',
      parcels: '~8.9M records (synthetic)',
      adapters: 1,
      departments: 7,
      timeline: 'Prototype (Now)',
      infra: 'Single Node / Vercel',
      requirements: [
        'CG Adapter live',
        'Board of Revenue API agreement',
        'RDA + RMC integration',
        'District Court NJDG connector',
      ],
    },
    {
      phase: 2,
      title: 'One State (Chhattisgarh)',
      description: 'Scale to all 33 districts. Live government API connectors. Full RBAC.',
      parcels: '~40M records',
      adapters: 1,
      departments: 12,
      timeline: '6–12 months post-approval',
      infra: 'Kubernetes + PostGIS + Redis',
      requirements: [
        'MoU with CG Revenue Dept',
        'SFTP/API to all 33 district offices',
        'PostGIS cluster for spatial queries',
        'RBAC hardening + HSM for encryption',
      ],
    },
    {
      phase: 3,
      title: 'Multi-State (CG + TN + MH)',
      description: 'Each state gets its own adapter. Canonical schema v3. National ULPIN as key.',
      parcels: '~250M records',
      adapters: 3,
      departments: 30,
      timeline: '18–36 months',
      infra: 'Multi-region Kubernetes + Sharded PostGIS',
      requirements: [
        'TN Adapter (TNREGINET + Bhoomi)',
        'MH Adapter (7/12 + IGRS)',
        'Cross-state conflict detection',
        'ULPIN as universal parcel key',
      ],
    },
    {
      phase: 4,
      title: 'National Land Stack',
      description: 'All 28 states + 8 UTs. Federated architecture. National ULPIN registry as source of truth.',
      parcels: '630M+ records',
      adapters: 28,
      departments: '200+',
      timeline: '5–7 years',
      infra: 'NIC/MeghRaj cloud, federated PostGIS, AI inference cluster',
      requirements: [
        'DoLR ULPIN API (national anchor)',
        'NIC MeghRaj cloud deployment',
        'Per-state Ministry MoUs',
        'National Land Records Modernisation Programme (NLRMP) alignment',
        'Digital India Land Records Modernisation Programme (DILRMP)',
      ],
    },
  ],
  key_principles: [
    'Modular adapters — new state = new adapter file, no core changes',
    'API-first — all data access via REST, no direct DB queries from UI',
    'ULPIN as the universal parcel identity anchor',
    'PostGIS for all spatial operations (ST_Contains, ST_Intersects, boundary queries)',
    'Canonical schema versioned independently from adapters',
    'Audit log every record access (RBAC + immutable log)',
    'Cloud-ready — Docker-compose → K8s → multi-region with no code changes',
    'State-adaptable — terminology, units, workflows configurable per state',
  ],
};

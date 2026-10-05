'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Database, Layers, Cpu, Globe, Shield, Brain,
  Map, ChevronDown, ChevronRight, Code2, Server, Lock, Users,
  GitBranch, Zap, CheckCircle2, AlertTriangle, ExternalLink, Copy,
  FileCode, Terminal, Box, Network, BarChart3, Satellite
} from 'lucide-react';
import { NORMALIZATION_EXAMPLES, SCALABILITY_PLAN, ENHANCED_DATA_SOURCES } from '@/lib/adapters';

// ─── Architecture nodes (clickable) ──────────────────────────────────────────
const ARCH_NODES = [
  {
    id: 'sources', layer: 'SOURCE SYSTEMS',
    label: 'Source Government Systems',
    color: '#ef4444', icon: <Database size={16} />,
    sub: 'Bhu-Abhilekh · DORIS · Bhu-Naksha · RDA · RMC · CERSAI · ISRO Bhuvan · District Courts · ULPIN Registry · TNREGINET',
    detail: 'Each Indian state and department operates its own digital system. These systems have different schemas, terminologies, units, and update frequencies. LandLens treats all of them as upstream data sources. No data is altered at source — LandLens only reads and normalizes.',
    apis: [],
  },
  {
    id: 'adapters', layer: 'ADAPTERS',
    label: 'State-Specific Adapters',
    color: '#f97316', icon: <GitBranch size={16} />,
    sub: 'CG Adapter · TN Adapter · MH Adapter · KA Adapter · Generic Adapter',
    detail: 'Each adapter is a typed transformer for one state\'s schema. It maps local terminology (Khasra→survey_reference, Rakba→area_sqm, Namantaran→mutation), converts units (cents→sqm, bigha→sqm), and attaches provenance metadata. Adding a new state requires only a new adapter file — no changes to core logic.',
    apis: ['GET /api/schema-versions (adapter registry)'],
  },
  {
    id: 'gateway', layer: 'API GATEWAY',
    label: 'REST API Gateway',
    color: '#eab308', icon: <Network size={16} />,
    sub: 'Authentication · RBAC · Rate Limiting · Audit Logging · Request Routing',
    detail: 'All data flows through a REST API layer. The gateway enforces RBAC (6 roles), rate-limits all endpoints, logs every request to the audit trail, and routes to the correct service. No UI component talks directly to a database — everything goes through the API.',
    apis: ['GET /api/parcels', 'GET /api/data-sources', 'GET /api/audit', 'POST /api/workflows', 'POST /api/service-requests'],
  },
  {
    id: 'normalization', layer: 'NORMALIZATION',
    label: 'Data Normalization Layer',
    color: '#22c55e', icon: <Layers size={16} />,
    sub: 'Schema Mapping · Unit Conversion · Deduplication · Conflict Flagging · Provenance Tracking',
    detail: 'Raw source records are normalized into the Canonical Parcel Schema. Original terminology is never erased — it is stored in source_fields alongside normalized fields. Every record carries: source, source_system, source_record_id, adapter_id, last_updated, schema_version, and confidence level.',
    apis: ['GET /api/parcels/:id/ror', 'GET /api/schema-versions'],
  },
  {
    id: 'canonical', layer: 'CANONICAL DATA MODEL',
    label: 'Canonical Schema v2.0 (ULPIN)',
    color: '#8b5cf6', icon: <Box size={16} />,
    sub: 'Parcel · Owner · RoR · Registration · Mutation · Zoning · Tax · Encumbrance · Litigation · Satellite · Restriction · Valuation · Utility',
    detail: 'The canonical schema is the single source of truth inside LandLens. Every entity is linked via parcel_id + ULPIN. The schema is versioned (currently v2.0.0). v3.0 is planned with cross-state conflict resolution and federated PostGIS. All 17 entity types have full provenance fields.',
    apis: ['GET /api/parcels/:id', 'GET /api/schema-versions'],
  },
  {
    id: 'ulpin', layer: 'ULPIN / PARCEL IDENTITY',
    label: 'ULPIN — Universal Parcel Identity',
    color: '#06b6d4', icon: <Zap size={16} />,
    sub: '14-character national identifier · Format: SS-DDD-NNNN-NNNN · DoLR / NIC Registry · 630M+ parcels nationally',
    detail: 'ULPIN is the Aadhaar for land. Every record in LandLens is anchored to a ULPIN. Records without ULPIN (legacy systems) are matched via khasra number + village + district, then cross-referenced with geographic coordinates. ULPIN enables records from completely different systems to be joined reliably.',
    apis: ['GET /api/parcels?q=CG-RJP-0001-0001'],
  },
  {
    id: 'postgis', layer: 'POSTGIS',
    label: 'PostGIS — Spatial Database',
    color: '#10b981', icon: <Map size={16} />,
    sub: 'Parcel Boundaries · ST_Contains · ST_Intersects · Buffer Zones · Road Reservation Detection · Satellite Change Overlay',
    detail: 'All spatial operations run in PostGIS. Parcel boundaries are stored as GeoJSON/WKB. Spatial queries detect road reservation overlaps, environmental buffer zones, and airport obstacle surfaces. The GIS layer feeds both the MapLibre frontend and the Rule Engine for spatial conflict detection.',
    apis: ['GET /api/parcels/:id (geometry field)'],
  },
  {
    id: 'engine', layer: 'RULE ENGINE',
    label: 'Land Truth Engine',
    color: '#6366f1', icon: <Cpu size={16} />,
    sub: '14 conflict rules · Area Mismatch · Ownership Conflict · Planning Conflict · Tax Default · Satellite Change · Restriction Overlap · Boundary Discrepancy',
    detail: 'The Land Truth Engine cross-checks all connected datasets and flags inconsistencies. Each conflict is tagged with: severity (critical/high/medium/low), datasets_compared, values, difference, and recommended_action. The engine never auto-resolves conflicts — it surfaces them for human review.',
    apis: ['GET /api/parcels/:id/conflicts', 'GET /api/parcels/:id/evidence'],
  },
  {
    id: 'ai', layer: 'AI / ANALYTICS',
    label: 'AI & Analytics Layer',
    color: '#f59e0b', icon: <Brain size={16} />,
    sub: 'Parcel AI Assistant · Source-grounded Answers · District Analytics · Recharts Dashboards · Report Generator',
    detail: 'The AI layer answers questions using parcel evidence, not generic knowledge. Every AI response is grounded in actual data from the canonical schema and cites its sources. Analytics compute district-level KPIs: conflict rates, mutation backlogs, data quality scores. No hallucination — if data is unavailable, the AI says so.',
    apis: [],
  },
  {
    id: 'apps', layer: 'APPLICATIONS',
    label: 'GIS + Government + Citizen',
    color: '#ec4899', icon: <Globe size={16} />,
    sub: 'Citizen Portal · Revenue Dashboard · Planning Dashboard · Registration · District Admin · MapLibre GIS · Officer Search',
    detail: 'Three separate application surfaces share the same API and canonical data: (1) Citizen Portal — simple, plain-language, mobile-first. (2) Government Dashboard — full RBAC, workflow management, analytics. (3) GIS Map — spatial visualization with conflict overlays. All three read from the same canonical schema via the API gateway.',
    apis: ['GET /api/parcels/:id', 'GET /api/parcels/:id/timeline'],
  },
];

// ─── API endpoint reference ───────────────────────────────────────────────────
const API_ENDPOINTS = [
  { method: 'GET', path: '/api/parcels', desc: 'List parcels — filter by state, land_use, status, q (search)', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id', desc: 'Full parcel detail with all connected record counts', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/ror', desc: 'Record of Rights with all state terminology preserved', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/registrations', desc: 'All property registration deeds', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/zoning', desc: 'Master Plan zoning + FSI + road reservation', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/building-permissions', desc: 'Building permission applications and status', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/restrictions', desc: 'Environmental, encumbrance, and litigation restrictions', auth: 'Public' },
  { method: 'GET', path: '/api/parcels/:id/conflicts', desc: 'Land Truth Engine conflict alerts with severity', auth: 'Officer+' },
  { method: 'GET', path: '/api/parcels/:id/timeline', desc: 'Chronological event history across all datasets', auth: 'Officer+' },
  { method: 'GET', path: '/api/parcels/:id/evidence', desc: 'Structured evidence chain for conflict resolution', auth: 'Officer+' },
  { method: 'GET', path: '/api/data-sources', desc: 'Data source registry with connection status and freshness', auth: 'Public' },
  { method: 'GET', path: '/api/schema-versions', desc: 'Canonical schema versions, entities, adapters, normalization examples', auth: 'Public' },
  { method: 'GET', path: '/api/audit', desc: 'Immutable audit log — filter by parcel, user, action', auth: 'Admin' },
  { method: 'GET', path: '/api/workflows', desc: 'Government workflow tasks — filter by parcel, status', auth: 'Officer+' },
  { method: 'POST', path: '/api/workflows', desc: 'Create a new workflow task', auth: 'Officer+' },
  { method: 'GET', path: '/api/service-requests', desc: 'Citizen service requests — filter by parcel, tracking_id', auth: 'Citizen+' },
  { method: 'POST', path: '/api/service-requests', desc: 'Submit a new citizen service request', auth: 'Public' },
];

// ─── Doc sections ─────────────────────────────────────────────────────────────
const DOC_SECTIONS = [
  {
    id: 'standards', icon: <Code2 size={16} />, title: 'API Standards',
    content: `All LandLens APIs follow REST conventions with JSON responses. Every response includes a meta block with api_version, schema_version, timestamp, and a data_note warning that all data is synthetic demonstration data.

Pagination: limit (max 100) and offset query params on list endpoints.
Filtering: state, land_use, status, q (full-text search) on /api/parcels.
Versioning: URL-based — /api/v2/parcels when breaking changes are introduced.
Content-Type: application/json on all endpoints.
HATEOAS: _links block on detail responses for related resource discovery.`,
  },
  {
    id: 'interop', icon: <Network size={16} />, title: 'Interoperability',
    content: `LandLens solves the core interoperability problem of Indian land administration: 28 states + 8 UTs each have different systems, schemas, terminology, and units.

The solution is a three-layer adapter pattern:
1. State Adapter — transforms source-specific records to canonical schema
2. Normalization Layer — unit conversion, deduplication, conflict flagging
3. Canonical Schema — ULPIN-anchored, provenance-tagged, versioned

Key principle: Original terminology is NEVER erased. Every canonical record carries a source_fields object with the original field names, values, and units. This allows government officers to trace any normalized value back to its exact source record.

Cross-state matching uses ULPIN (14-char national ID) as the primary key. Legacy records without ULPIN are matched via khasra_no + village + district + geographic coordinates.`,
  },
  {
    id: 'schema', icon: <Database size={16} />, title: 'Data Schema',
    content: `Canonical Schema Version: 2.0.0

Every entity in the canonical schema contains:
- Normalized business fields (area_sqm, survey_reference, tehsil_or_taluk)
- source_fields object with original terminology per state
- provenance object with: source, source_system, source_record_id, last_updated, schema_version, adapter_id, confidence, status

Confidence levels: high (verified by 2+ sources) | medium (single source) | low (generic adapter) | unverified (no source verification)

Area normalization: All areas stored in sq. metres. Original value and unit preserved in source_fields. Conversion factors: 1 acre = 4046.86 sqm, 1 cent = 40.47 sqm, 1 bigha = 2529.29 sqm (UP), 1 hectare = 10000 sqm.`,
  },
  {
    id: 'gis', icon: <Map size={16} />, title: 'GIS Standards',
    content: `Coordinate System: WGS84 (EPSG:4326) for all storage and APIs.
Geometry Format: GeoJSON Feature with geometry type Polygon/MultiPolygon.
Tile Server: OpenStreetMap + MapLibre GL JS for rendering.
Spatial Database: PostGIS (ST_Contains, ST_Intersects, ST_Buffer, ST_Area).

Spatial conflict detection:
- Road reservation: ST_Intersects(parcel_boundary, road_corridor)
- Airport zone: ST_Contains(airport_obstacle_surface, parcel_centroid)
- Forest buffer: ST_Intersects(parcel_boundary, ST_Buffer(forest_boundary, buffer_m))
- Flood zone: ST_Intersects(parcel_boundary, flood_zone_polygon)

All spatial data stored as SRID 4326. Queries that need metric units use ST_Transform to SRID 32644 (UTM Zone 44N for Central India).`,
  },
  {
    id: 'security', icon: <Lock size={16} />, title: 'Security',
    content: `Authentication: JWT-based session tokens. Short-lived access tokens (1hr) + refresh tokens (7 days).
Encryption: TLS 1.3 in transit. AES-256 at rest for PII fields (Aadhaar last-4, phone numbers).
Data Masking: Aadhaar numbers are masked at API level — only last 4 digits returned. Full numbers never leave the secure enclave.
Rate Limiting: 100 req/min for public endpoints, 500 req/min for authenticated officers.
CORS: Restricted to approved origins in production.
CSP: Content Security Policy headers on all pages.
SQL Injection: All queries use parameterized prepared statements. No raw SQL concatenation.
In production: HSM (Hardware Security Module) for key management. NIC-approved cloud deployment.`,
  },
  {
    id: 'rbac', icon: <Users size={16} />, title: 'RBAC — 6 Roles',
    content: `citizen — Read-only public parcel data, submit service requests, track applications.
revenue_officer — + RoR, mutations, conflict alerts, workflow management, audit logs.
planning_officer — + Zoning records, building permissions, master plan data, planning workflows.
registration_officer — + Registration deeds, encumbrances, stamp duty records.
district_admin — All officer views + analytics, escalation, cross-department visibility.
system_admin — Full access + user management, system configuration, raw audit logs.

RBAC is enforced at the API gateway layer — not just in the UI. Even if a UI restriction is bypassed, the API returns 403 Forbidden for unauthorized requests. Role claims are embedded in the JWT and verified on every request.`,
  },
  {
    id: 'audit', icon: <Shield size={16} />, title: 'Audit Trail',
    content: `Every action in LandLens is logged immutably:
- Timestamp (ISO 8601 with microseconds)
- User ID + Name + Role
- Action type (Viewed Parcel, Created Workflow, Updated Status, Submitted Request)
- Entity type + Entity ID
- Parcel ID (if applicable)
- IP address
- Department

Audit logs are append-only. No deletion, no update. In production: write to a separate immutable store (AWS CloudTrail equivalent or NIC-approved audit service).

Query audit logs via GET /api/audit?parcel_id=P001&action=viewed. Used for: compliance, officer accountability, RTI responses, legal dispute support.`,
  },
  {
    id: 'deployment', icon: <Server size={16} />, title: 'Deployment & Scalability',
    content: `Current (Prototype): Next.js on Vercel. Synthetic in-memory data. Single region.

Phase 1 (City): Docker Compose. PostgreSQL + PostGIS. Redis for caching. Single VPS/VM.
Phase 2 (State): Kubernetes (3-node). Managed PostgreSQL + PostGIS. Redis cluster. CDN. Load balancer.
Phase 3 (Multi-state): Multi-region Kubernetes. Sharded PostGIS (per-state shard). Global CDN. Message queue (Kafka) for adapter sync events.
Phase 4 (National): NIC MeghRaj cloud deployment. Federated PostGIS. 630M+ parcels. AI inference cluster.

Infrastructure is 12-factor app compliant. All config via environment variables. Horizontal scaling via Kubernetes HPA. Database migrations via Flyway (versioned, reversible).

Cloud-ready: All services containerized (Docker). Helm charts for Kubernetes deployment. Zero-downtime deployments via rolling updates.`,
  },
  {
    id: 'ai_arch', icon: <Brain size={16} />, title: 'AI Architecture',
    content: `The LandLens AI layer is source-grounded — it answers questions using actual parcel data, not parametric knowledge.

Architecture:
1. Question received with parcel_id context
2. Evidence gathering: all connected records fetched for that parcel
3. Conflict detection: Land Truth Engine analysis loaded
4. Prompt construction: structured context + question + instructions (never fabricate, cite source, say unavailable if missing)
5. LLM inference: Gemini/OpenAI compatible interface (provider-agnostic abstraction)
6. Response with cited sources and suggested actions

AI never makes legal determinations. It surfaces data, explains conflicts, and suggests which government office to contact. Responses are bounded by available evidence.

For production: Fine-tuned on land administration domain. RLHF for hallucination reduction. Response audit logging (every AI answer stored with its evidence context).`,
  },
  {
    id: 'provenance', icon: <GitBranch size={16} />, title: 'Data Provenance',
    content: `Every record in LandLens carries full provenance metadata:

{
  "source": "Bhu-Abhilekh",
  "source_system": "CG_BHU_ABHILEKH_v3",
  "source_record_id": "B1-RJP-2024-001",
  "source_terminology": { "khasra_no": "123/1", "rakba": "2.40", "khatauni_no": "KH-001" },
  "last_updated": "2024-03-01T06:00:00Z",
  "schema_version": "2.0.0",
  "adapter_id": "CG_ADAPTER_v2",
  "confidence": "high",
  "status": "verified"
}

This means any conflict between two datasets can be traced back to the exact source record, the adapter that processed it, and the timestamp of the last sync. Data is never orphaned from its origin.`,
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  CONNECTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  SIMULATED: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  UNAVAILABLE: 'bg-red-500/15 text-red-400 border-red-500/25',
  STALE: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

const METHOD_COLOR: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  POST: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
};

export default function TechnicalArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<typeof ARCH_NODES[0] | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [normTab, setNormTab] = useState(0);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path).catch(() => {});
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-indigo-950/40 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft size={14} /> Back
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-sm text-slate-400 font-mono">Technical Architecture & API Reference</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/parcels" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors">
              <ExternalLink size={11} /> Try API
            </a>
            <Link href="/login" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg gradient-primary text-white text-sm font-medium">
              Launch Demo <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="text-xs font-mono text-violet-400 uppercase tracking-wider mb-3">Engineering Documentation v2.0</div>
          <h1 className="font-heading font-bold text-4xl text-white mb-4">LandLens Interoperability Architecture</h1>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A layered adapter architecture that normalizes India&apos;s fragmented land administration systems —
            different states, schemas, terminology, units, and workflows — into one canonical parcel-centric model anchored on ULPIN.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { label: 'Schema v2.0.0', color: 'text-violet-400 border-violet-500/30 bg-violet-500/8' },
              { label: '7 State Adapters', color: 'text-orange-400 border-orange-500/30 bg-orange-500/8' },
              { label: '17 REST Endpoints', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/8' },
              { label: 'ULPIN-Anchored', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8' },
              { label: 'Full Provenance', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/8' },
            ].map(b => (
              <span key={b.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${b.color}`}>{b.label}</span>
            ))}
          </div>
        </motion.div>

        {/* ── Architecture Diagram ── */}
        <section className="mb-20">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">System Architecture</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Click any layer to learn more</p>

          <div className="flex flex-col items-center gap-0 max-w-3xl mx-auto">
            {ARCH_NODES.map((node, i) => (
              <div key={node.id} className="w-full flex flex-col items-center">
                <motion.button
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: selectedNode?.id === node.id ? `${node.color}15` : `${node.color}06`,
                    borderColor: selectedNode?.id === node.id ? `${node.color}60` : `${node.color}25`,
                    width: `${100 - i * 3}%`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${node.color}20`, color: node.color }}>
                      {node.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: node.color }}>{node.layer}</div>
                      <div className="font-semibold text-sm text-white">{node.label}</div>
                    </div>
                    <ChevronDown size={13} className={`text-slate-600 transition-transform flex-shrink-0 ${selectedNode?.id === node.id ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-xs text-slate-500 pl-10">{node.sub}</p>
                </motion.button>

                <AnimatePresence>
                  {selectedNode?.id === node.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden w-full"
                      style={{ width: `${100 - i * 3}%` }}
                    >
                      <div className="px-5 py-4 rounded-b-xl border-x-2 border-b-2 -mt-1 mb-0" style={{ borderColor: `${node.color}30`, background: `${node.color}05` }}>
                        <p className="text-sm text-slate-300 leading-relaxed mb-3">{node.detail}</p>
                        {node.apis.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {node.apis.map(api => (
                              <span key={api} className="font-mono text-[11px] px-2 py-1 rounded bg-slate-900/60 border border-slate-700/40 text-slate-400">{api}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {i < ARCH_NODES.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-3 bg-slate-700" />
                    <ArrowRight size={10} className="text-slate-700 rotate-90" />
                    <div className="w-px h-3 bg-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── State Normalization ── */}
        <section className="mb-20">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">State Terminology Normalization</h2>
          <p className="text-slate-500 text-sm text-center mb-6">How different states refer to the same concept — and how LandLens normalizes them</p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {NORMALIZATION_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setNormTab(i)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${normTab === i ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-slate-700/40 text-slate-500 hover:text-slate-300'}`}
              >
                {ex.title}
              </button>
            ))}
          </div>

          {(() => {
            const ex = NORMALIZATION_EXAMPLES[normTab];
            return (
              <motion.div key={normTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-card overflow-hidden">
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{ex.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Canonical field: <span className="font-mono text-indigo-300">{ex.canonical_field}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-600 uppercase">Canonical value example</div>
                    <div className="font-mono text-xs text-emerald-300 mt-0.5">{ex.canonical_example}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>State</th>
                        <th>Local Term</th>
                        <th>Example Value</th>
                        <th>Source System</th>
                        <th>→ Canonical</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.states.map(s => (
                        <tr key={s.state}>
                          <td className="text-slate-300 font-medium text-xs">{s.state}</td>
                          <td><span className="font-mono text-amber-300 text-xs bg-amber-500/8 px-2 py-0.5 rounded">{s.term}</span></td>
                          <td className="font-mono text-slate-400 text-xs">{s.example}</td>
                          <td className="text-slate-500 text-xs">{s.system}</td>
                          <td><span className="font-mono text-indigo-300 text-xs">{ex.canonical_field.split('+')[0].trim()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-slate-900/40 border-t border-slate-800/40 text-[11px] text-slate-600 italic">
                  Original terminology is stored in <span className="font-mono text-slate-500">source_fields.local_{ex.canonical_field.split('_')[0]}_term</span> and never erased from the canonical record.
                </div>
              </motion.div>
            );
          })()}
        </section>

        {/* ── API Reference ── */}
        <section className="mb-20">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">REST API Reference</h2>
          <p className="text-slate-500 text-sm text-center mb-8">All endpoints return canonical schema with provenance metadata. Try them live →&nbsp;
            <a href="/api/parcels" target="_blank" className="text-indigo-400 hover:text-indigo-300 underline decoration-dotted">/api/parcels</a>
          </p>
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-slate-800/50 flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-mono">Base URL: https://landlens.vercel.app</span>
            </div>
            <div className="divide-y divide-slate-800/40">
              {API_ENDPOINTS.map((ep, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/20 transition-colors group">
                  <span className={`chip text-[10px] flex-shrink-0 ${METHOD_COLOR[ep.method]}`}>{ep.method}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-slate-200">{ep.path}</span>
                      <button
                        onClick={() => copyPath(ep.path)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-slate-400"
                      >
                        {copiedPath === ep.path ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ep.desc}</div>
                  </div>
                  <span className={`chip text-[10px] flex-shrink-0 ${ep.auth === 'Public' ? 'bg-slate-700/40 text-slate-500' : ep.auth === 'Admin' ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
                    {ep.auth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live response example */}
          <div className="mt-6 surface-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 bg-slate-900/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-slate-400">GET /api/parcels/P001 → 200 OK</span>
              <a href="/api/parcels/P001" target="_blank" rel="noopener noreferrer" className="ml-auto text-indigo-400 hover:text-indigo-300">
                <ExternalLink size={12} />
              </a>
            </div>
            <pre className="p-4 text-[11px] text-slate-400 font-mono overflow-x-auto leading-relaxed">{`{
  "meta": {
    "api_version": "1.0.0",
    "schema_version": "2.0.0",
    "data_note": "Synthetic demonstration data. Not real government records."
  },
  "data": {
    "parcel_id": "P001",
    "ulpin": "CG-RJP-0001-0001",
    "survey_reference": "123/1",          // Normalized from: khasra_no (CG), survey_no (TN)
    "tehsil_or_taluk": "Raipur",          // Normalized from: tehsil (CG), taluk (TN), mandal (AP)
    "area_sqm": 1012,
    "area_acres": 0.25,
    "area_hectares": 0.10,
    "provenance": {
      "source": "Bhu-Abhilekh",
      "source_system": "CG_BHU_ABHILEKH_v3",
      "adapter_id": "CG_ADAPTER_v2",
      "schema_version": "2.0.0",
      "confidence": "medium"
    }
  },
  "_links": {
    "ror": "/api/parcels/P001/ror",
    "conflicts": "/api/parcels/P001/conflicts",
    "timeline": "/api/parcels/P001/timeline"
  }
}`}</pre>
          </div>
        </section>

        {/* ── Data Source Registry ── */}
        <section className="mb-20">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">Data Source Registry</h2>
          <p className="text-slate-500 text-sm text-center mb-2">
            No live government APIs are connected. Status reflects integration readiness.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            {(['CONNECTED','SIMULATED','UNAVAILABLE','STALE'] as const).map(s => (
              <div key={s} className="flex items-center gap-1.5 text-xs">
                <span className={`chip text-[10px] ${STATUS_BADGE[s]}`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {ENHANCED_DATA_SOURCES.map(ds => (
              <div key={ds.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0">
                      {ds.short_name.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{ds.name}</div>
                      <div className="text-[11px] text-slate-500">{ds.department}</div>
                      <div className="text-[11px] text-slate-600">{ds.state} · {ds.dataset}</div>
                    </div>
                  </div>
                  <span className={`chip text-[10px] flex-shrink-0 ${STATUS_BADGE[ds.api_status]}`}>{ds.api_status}</span>
                </div>
                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/40 text-[10px]">
                  <span className="text-slate-600">Records: <span className="text-slate-400 font-mono">{ds.record_count > 0 ? ds.record_count.toLocaleString() : 'Vector'}</span></span>
                  <span className="text-slate-600">Freshness: <span className="text-slate-400">{ds.data_freshness_days === 1 ? 'Daily' : ds.data_freshness_days === 7 ? 'Weekly' : `${ds.data_freshness_days}d`}</span></span>
                  <span className="text-slate-600">Schema: <span className="text-slate-400 font-mono">v{ds.schema_version}</span></span>
                  <span className="text-slate-600">Adapter: <span className="font-mono text-amber-400/80">{ds.adapter_id}</span></span>
                </div>
                <div className="mt-1.5 text-[10px] text-slate-700 italic">{ds.notes}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scalability Plan ── */}
        <section className="mb-20">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">Scalability Roadmap</h2>
          <p className="text-slate-500 text-sm text-center mb-8">From one city prototype to the National Land Stack</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {SCALABILITY_PLAN.phases.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="surface-card p-4"
              >
                <div className="text-xs font-mono text-slate-600 mb-1">Phase {phase.phase}</div>
                <div className="font-heading font-bold text-sm text-white mb-1">{phase.title}</div>
                <div className="text-[11px] text-slate-500 mb-3 leading-relaxed">{phase.description}</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Parcels</span>
                    <span className="text-slate-400 font-mono">{phase.parcels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Adapters</span>
                    <span className="text-slate-400">{phase.adapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Timeline</span>
                    <span className="text-slate-400">{phase.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Infra</span>
                    <span className="text-slate-400">{phase.infra}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/40 space-y-1">
                  {phase.requirements.map(r => (
                    <div key={r} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <CheckCircle2 size={9} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="surface-card p-5">
            <div className="text-sm font-semibold text-white mb-3">Key Architecture Principles</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {SCALABILITY_PLAN.key_principles.map(p => (
                <div key={p} className="flex items-start gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Technical Documentation ── */}
        <section className="mb-16">
          <h2 className="font-heading font-bold text-2xl text-white mb-2 text-center">Technical Documentation</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Click any section to expand</p>
          <div className="space-y-2">
            {DOC_SECTIONS.map(section => (
              <div key={section.id} className="surface-card overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-800/20 transition-colors"
                >
                  <span className="text-indigo-400 flex-shrink-0">{section.icon}</span>
                  <span className="font-semibold text-sm text-white flex-1">{section.title}</span>
                  <ChevronRight size={14} className={`text-slate-600 transition-transform flex-shrink-0 ${activeSection === section.id ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-800/40">
                        <pre className="mt-4 font-mono text-xs text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-900/40 rounded-xl p-4 border border-slate-800/40">
                          {section.content}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-400 text-sm mb-1">Important Note on Government API Integration</div>
              <div className="text-xs text-amber-400/70 leading-relaxed">
                This prototype uses <strong>synthetic demonstration data</strong> and <strong>demo connectors</strong> — no live government APIs are connected.
                In production, each adapter would require formal API access agreements with respective departments (DoLR, Board of Revenue, Registration, RDA, Municipal Corporation, Courts),
                compliance with government data sharing protocols (DEPA, Data Empowerment and Protection Architecture), and appropriate NIC/CERT-In cybersecurity clearances.
                The architecture is designed so that adding real connectors replaces only the adapter layer — all normalization, conflict detection, and business logic remains unchanged.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
            Explore the Live Demo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Search, X, MapPin, AlertTriangle, ChevronRight, FileText, CheckCircle2, Shield, Satellite } from 'lucide-react';
import { PARCELS, CONFLICT_ALERTS } from '@/lib/data';
import type { Parcel, ConflictAlert } from '@/lib/types';
import type { MapGeoJSONFeature, MapMouseEvent, Popup } from 'maplibre-gl';
import { parcelTruthEngine } from '@/lib/intelligence';
import Link from 'next/link';

interface MapViewProps {
  selectedParcelId?: string;
  onParcelSelect?: (parcel: Parcel) => void;
  height?: string;
}

type MapLayer = {
  id: string;
  label: string;
  type: 'base' | 'overlay';
  color?: string;
};

type LayerGroup = {
  name: string;
  layers: MapLayer[];
};

const LAYER_GROUPS: LayerGroup[] = [
  {
    name: 'BASE',
    layers: [
      { id: 'street', label: 'Street Map', type: 'base' },
      { id: 'satellite', label: 'Satellite', type: 'base' }
    ]
  },
  {
    name: 'LAND',
    layers: [
      { id: 'parcels-fill', label: 'Parcels', type: 'overlay', color: '#6366f1' },
      { id: 'land-use', label: 'Land Use', type: 'overlay', color: '#8b5cf6' }
    ]
  },
  {
    name: 'PLANNING',
    layers: [
      { id: 'zoning', label: 'Zoning', type: 'overlay', color: '#eab308' },
      { id: 'road-reservation', label: 'Road Reservations', type: 'overlay', color: '#f43f5e' }
    ]
  },
  {
    name: 'RISK',
    layers: [
      { id: 'conflicts', label: 'Conflicts', type: 'overlay', color: '#ef4444' },
      { id: 'potential-changes', label: 'Potential Changes', type: 'overlay', color: '#06b6d4' }
    ]
  }
];

export default function MapView({ selectedParcelId, onParcelSelect, height = '100%' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  const tooltipRef = useRef<Popup | null>(null);
  
  const [search, setSearch] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(
    selectedParcelId ? PARCELS.find(p => p.id === selectedParcelId) || null : null
  );
  const [activeLayers, setActiveLayers] = useState<string[]>(['street', 'parcels-fill', 'conflicts']);
  const [isLoaded, setIsLoaded] = useState(false);
  const [panelTab, setPanelTab] = useState<'overview' | 'land_truth' | 'timeline' | 'satellite'>('overview');
  const [evidenceDrawer, setEvidenceDrawer] = useState<ConflictAlert | null>(null);

  // GeoJSON generation for parcels
  const parcelsGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: PARCELS.map((p, i) => {
        const areaSqm = p.areaAcres * 4046.86;
        const side = Math.sqrt(areaSqm);
        const dLat = (side / 111139) / 2;
        const dLng = (side / (111139 * 0.932)) / 2;
        const coords = [
          [p.lng - dLng, p.lat - dLat],
          [p.lng + dLng, p.lat - dLat],
          [p.lng + dLng, p.lat + dLat],
          [p.lng - dLng, p.lat + dLat],
          [p.lng - dLng, p.lat - dLat]
        ];
        
        const alerts = CONFLICT_ALERTS.filter(a => a.parcelId === p.id && a.status !== 'Resolved');
        let statusColor = '#6366f1';
        if (p.status === 'Disputed') statusColor = '#ef4444';
        else if (p.status === 'Restricted') statusColor = '#8b5cf6';
        else if (alerts.some(a => a.severity === 'critical')) statusColor = '#ef4444';
        else if (alerts.some(a => a.severity === 'high')) statusColor = '#f97316';
        else if (alerts.length > 0) statusColor = '#eab308';

        return {
          type: 'Feature',
          id: i, // numeric ID for feature state
          properties: {
            pid: p.id,
            ulpin: p.ulpin,
            khasra: p.khasraNo,
            landUse: p.landUse,
            statusColor,
            alertCount: alerts.length,
            area: p.areaAcres
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          }
        };
      })
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        const maplibregl = await import('maplibre-gl');

        const map = new maplibregl.Map({
          container: mapRef.current!,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              },
              'satellite-tiles': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: 'Tiles © Esri'
              },
              'parcels': {
                type: 'geojson',
                data: parcelsGeoJSON as unknown as GeoJSON.GeoJSON
              }
            },
            layers: [
              { id: 'street', type: 'raster', source: 'osm-tiles', paint: { 'raster-opacity': 0.3, 'raster-saturation': -0.8, 'raster-brightness-max': 0.3 } },
              { id: 'satellite', type: 'raster', source: 'satellite-tiles', paint: { 'raster-opacity': 0 }, layout: { visibility: 'none' } },
              {
                id: 'parcels-fill',
                type: 'fill',
                source: 'parcels',
                paint: {
                  'fill-color': ['get', 'statusColor'],
                  'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.6, 0.3]
                }
              },
              {
                id: 'parcels-line',
                type: 'line',
                source: 'parcels',
                paint: {
                  'line-color': ['get', 'statusColor'],
                  'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 1]
                }
              },
              {
                id: 'parcels-label',
                type: 'symbol',
                source: 'parcels',
                layout: {
                  'text-field': ['get', 'pid'],
                  'text-size': 11
                },
                paint: {
                  'text-color': '#ffffff',
                  'text-halo-color': '#020617',
                  'text-halo-width': 1.5
                },
                minzoom: 15
              }
            ]
          },
          center: [81.6296, 21.2514],
          zoom: 14,
          maxZoom: 18,
          minZoom: 5,
        });

        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

        let hoveredId: number | null = null;
        tooltipRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

        map.on('mousemove', 'parcels-fill', (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
          if (e.features && e.features.length > 0) {
            map.getCanvas().style.cursor = 'pointer';
            const f = e.features[0];
            if (hoveredId !== null) {
              map.setFeatureState({ source: 'parcels', id: hoveredId }, { hover: false });
            }
            hoveredId = f.id as number;
            map.setFeatureState({ source: 'parcels', id: hoveredId }, { hover: true });

            const p = f.properties;
            tooltipRef.current?.setLngLat(e.lngLat).setHTML(`
              <div style="padding:4px; font-family:sans-serif; color:#e2e8f0; min-width: 140px;">
                <div style="font-size:10px; color:#94a3b8; margin-bottom:2px;">${p.ulpin}</div>
                <div style="font-weight:bold; font-size:12px; margin-bottom:4px;">${p.pid}</div>
                <div style="font-size:11px;">Use: ${p.landUse}</div>
                <div style="font-size:11px;">Area: ${p.area} ac</div>
                ${p.alertCount > 0 ? `<div style="margin-top:4px; font-size:10px; color:#f87171; font-weight:bold;">⚠ ${p.alertCount} Alerts</div>` : ''}
              </div>
            `).addTo(map);
          }
        });

        map.on('mouseleave', 'parcels-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'parcels', id: hoveredId }, { hover: false });
          }
          hoveredId = null;
          tooltipRef.current?.remove();
        });

        map.on('click', 'parcels-fill', (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
          if (e.features && e.features.length > 0) {
            const pid = e.features[0].properties.pid;
            const parcel = PARCELS.find(p => p.id === pid);
            if (parcel) {
              setSelectedParcel(parcel);
              onParcelSelect?.(parcel);
              map.flyTo({ center: [parcel.lng, parcel.lat], zoom: 16.5, speed: 1.2 });
            }
          }
        });

        map.on('load', () => setIsLoaded(true));

        mapInstance.current = map;
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected feature state
  useEffect(() => {
    if (mapInstance.current && isLoaded) {
      parcelsGeoJSON.features.forEach(f => {
        const isSelected = selectedParcel?.id === f.properties.pid;
        mapInstance.current.setFeatureState({ source: 'parcels', id: f.id }, { selected: isSelected });
      });
    }
  }, [selectedParcel, isLoaded, parcelsGeoJSON.features]);

  // Handle Layer toggles
  useEffect(() => {
    if (mapInstance.current && isLoaded) {
      const map = mapInstance.current;
      // Toggle Street vs Satellite
      if (activeLayers.includes('satellite')) {
        map.setLayoutProperty('satellite', 'visibility', 'visible');
        map.setPaintProperty('satellite', 'raster-opacity', 1);
        map.setPaintProperty('street', 'raster-opacity', 0);
      } else {
        map.setLayoutProperty('satellite', 'visibility', 'none');
        map.setPaintProperty('satellite', 'raster-opacity', 0);
        map.setPaintProperty('street', 'raster-opacity', 0.3);
      }

      // Toggle Parcels
      const showParcels = activeLayers.includes('parcels-fill');
      map.setLayoutProperty('parcels-fill', 'visibility', showParcels ? 'visible' : 'none');
      map.setLayoutProperty('parcels-line', 'visibility', showParcels ? 'visible' : 'none');
      map.setLayoutProperty('parcels-label', 'visibility', showParcels ? 'visible' : 'none');
    }
  }, [activeLayers, isLoaded]);

  const flyToParcel = (parcel: Parcel) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({ center: [parcel.lng, parcel.lat], zoom: 16, speed: 1.2, curve: 1.2 });
    }
    setSelectedParcel(parcel);
    onParcelSelect?.(parcel);
  };

  const toggleLayer = (id: string, type: string) => {
    setActiveLayers(prev => {
      if (type === 'base') {
        return [...prev.filter(l => !['street', 'satellite'].includes(l)), id];
      }
      return prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id];
    });
  };

  const filteredParcels = PARCELS.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.ulpin.toLowerCase().includes(s) || p.khasraNo.toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || p.village.toLowerCase().includes(s);
  });

  const truth = selectedParcel ? parcelTruthEngine.analyze(selectedParcel.id) : null;

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden" style={{ height }}>
      {/* LEFT: Layer Manager / Search Drawer */}
      <aside className="w-72 flex-shrink-0 bg-slate-950/95 border-r border-indigo-950/60 flex flex-col z-10 shadow-2xl overflow-y-auto">
        <div className="p-4 border-b border-indigo-950/40">
          <h2 className="font-heading font-semibold text-sm text-white mb-3">Geospatial Intelligence</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search ULPIN, Khasra, Owner..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-white pl-9 pr-8 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          
          {search && (
            <div className="mt-2 bg-slate-900 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
              {filteredParcels.slice(0, 10).map(p => (
                <button
                  key={p.id}
                  onClick={() => flyToParcel(p)}
                  className="w-full text-left px-3 py-2 text-xs border-b border-slate-800/50 hover:bg-indigo-500/10 transition-colors"
                >
                  <div className="font-semibold text-slate-300">{p.id}</div>
                  <div className="text-[10px] text-slate-500">{p.ulpin} • {p.village}</div>
                </button>
              ))}
              {filteredParcels.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-500">No parcels found.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {LAYER_GROUPS.map(group => (
            <div key={group.name}>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{group.name}</h3>
              <div className="space-y-1.5">
                {group.layers.map(layer => {
                  const isActive = activeLayers.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                         onClick={() => toggleLayer(layer.id, layer.type)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 bg-transparent'}`}>
                          {isActive && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className={`text-xs ${isActive ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{layer.label}</span>
                      </div>
                      {layer.type === 'overlay' && layer.color && (
                        <div className="w-2.5 h-2.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: layer.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER: Map */}
      <main className="flex-1 relative bg-slate-950">
        <div ref={mapRef} className="w-full h-full" />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Initializing Geospatial Engine…</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 glass-card px-3 py-2 flex items-center gap-2 z-10 pointer-events-none">
          <MapPin size={14} className="text-cyan-400" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Raipur District</div>
            <div className="text-[10px] text-slate-500">Synthetic Demo Area</div>
          </div>
        </div>
      </main>

      {/* RIGHT: Parcel Intelligence Panel */}
      {selectedParcel && (
        <aside className="w-[420px] flex-shrink-0 bg-slate-950/95 border-l border-indigo-950/60 z-10 shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
          <div className="p-5 border-b border-indigo-950/40 relative">
            <button onClick={() => setSelectedParcel(null)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-full p-1.5">
              <X size={14} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ULPIN: {selectedParcel.ulpin}</div>
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mt-2 mb-1">{selectedParcel.id}</h2>
            <p className="text-xs text-slate-400">{selectedParcel.address}</p>
            
            <div className="flex gap-2 mt-4">
              {['overview', 'land_truth', 'timeline', 'satellite'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab as 'overview' | 'land_truth' | 'timeline' | 'satellite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${panelTab === tab ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                >
                  {tab === 'land_truth' ? 'Land Truth' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {panelTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Area</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedParcel.areaAcres} acres</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Land Use</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedParcel.landUse}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Khasra</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedParcel.khasraNo}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Status</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedParcel.status}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" />
                    Record of Rights
                  </h3>
                  <div className="bg-slate-900 rounded-xl p-3 text-xs border border-slate-800">
                    <div className="flex justify-between py-1.5 border-b border-slate-800 last:border-0"><span className="text-slate-500">Source</span><span className="text-slate-300">Bhu-Abhilekh (Synthetic)</span></div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 last:border-0"><span className="text-slate-500">Owner</span><span className="text-slate-300 font-medium">Demo Owner A</span></div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 last:border-0"><span className="text-slate-500">Last Updated</span><span className="text-slate-300">12 Oct 2025</span></div>
                  </div>
                </div>

                <Link
                  href={`/parcels/${selectedParcel.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity mt-4 shadow-lg shadow-indigo-500/20"
                >
                  Open Full Parcel 360 View
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {panelTab === 'land_truth' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 mb-2">
                  <div className="flex items-start gap-3">
                    <Shield size={20} className="text-indigo-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-indigo-300 mb-1">Land Truth Engine</div>
                      <p className="text-[11px] text-indigo-300/70 leading-relaxed">The engine continuously cross-checks fragmented departmental datasets to detect inconsistencies for this parcel.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(truth?.consistency || []).map(item => {
                    const finding = truth?.conflicts.find(c => {
                      if (item.category === 'Ownership') return c.ruleId === 'OWNER_MISMATCH';
                      if (item.category === 'Area') return c.ruleId === 'AREA_MISMATCH';
                      if (item.category === 'Zoning') return c.ruleId === 'LAND_USE_ZONING_CONFLICT';
                      if (item.category === 'Planning') return ['MASTER_PLAN_CONFLICT', 'ROAD_RESERVATION_OVERLAP'].includes(c.ruleId);
                      if (item.category === 'Building') return c.ruleId === 'BUILDING_PERMISSION_MISSING';
                      if (item.category === 'Tax') return c.ruleId === 'TAX_STATUS_ANOMALY';
                      if (item.category === 'Restrictions') return c.ruleId === 'RESTRICTION_OVERLAP';
                      if (item.category === 'Litigation') return c.ruleId === 'LITIGATION_PRESENT';
                      return false;
                    });

                    return (
                      <div key={item.category} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between bg-slate-900/50">
                          <span className="text-xs font-medium text-slate-300">{item.category}</span>
                          <span className={`chip text-[10px] ${item.status === 'Verified' ? 'health-verified' : item.status === 'Needs Review' ? 'health-attention' : item.status === 'Conflict' ? 'health-conflict' : 'health-unavailable'}`}>
                            {item.status}
                          </span>
                        </div>
                        {finding && (
                          <div className="px-4 py-3 border-t border-slate-800 bg-red-500/5">
                            <div className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Rule Finding</div>
                            <div className="text-[11px] text-slate-400 mb-2">{finding.description}</div>
                            <button 
                              onClick={() => setEvidenceDrawer({
                                id: finding.ruleId,
                                parcelId: selectedParcel.id,
                                alertType: 'planning_conflict',
                                severity: finding.severity === 'CRITICAL' ? 'critical' : finding.severity === 'HIGH' ? 'high' : finding.severity === 'MEDIUM' ? 'medium' : 'low',
                                title: finding.name,
                                description: finding.description,
                                datasetsCompared: finding.datasetsUsed,
                                values: finding.evidence,
                                detectedDate: new Date().toISOString().slice(0, 10),
                                status: 'Open',
                                recommendedAction: finding.recommendedAction,
                              })}
                              className="text-[10px] px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors border border-red-500/20"
                            >
                              View Evidence
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {panelTab === 'timeline' && (
              <div className="animate-in fade-in duration-300 relative pl-4 border-l-2 border-indigo-500/20 space-y-6 mt-4 ml-2">
                {[
                  { year: '2026', title: 'Potential Construction Detected', desc: 'Satellite change detection flagged new structure.', type: 'alert' },
                  { year: '2025', title: 'Zoning Updated', desc: 'Master Plan 2041 incorporated parcel into Commercial zone.', type: 'info' },
                  { year: '2022', title: 'Mutation Recorded', desc: 'Ownership transferred via Sale Deed.', type: 'success' },
                  { year: '2021', title: 'Registration Recorded', desc: 'Sub-registrar office processed deed.', type: 'info' },
                  { year: '2015', title: 'Digitized in Bhu-Abhilekh', desc: 'Initial digitization of RoR records.', type: 'info' }
                ].map((ev, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[23px] w-3 h-3 rounded-full border-2 border-slate-950 ${ev.type === 'alert' ? 'bg-red-400' : ev.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                    <div className="text-[10px] font-mono text-slate-500 mb-1">{ev.year}</div>
                    <div className="text-xs font-semibold text-slate-200">{ev.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{ev.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {panelTab === 'satellite' && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl flex items-start gap-3">
                  <Satellite size={16} className="text-cyan-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-cyan-300 mb-1">AI Change Detection</div>
                    <div className="text-[11px] text-cyan-300/70">Demonstration AI/ML result — field verification required.</div>
                  </div>
                </div>
                
                <div className="aspect-video bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden flex items-center justify-center">
                  {/* Fake Image slider simulation */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517783999520-f068d3431a47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 grayscale" />
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1517783999520-f068d3431a47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center border-l-2 border-cyan-400">
                    <div className="absolute top-1/2 -left-[11px] w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg transform -translate-y-1/2">
                      <div className="w-1 h-3 bg-slate-900 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] text-white">Before: Jan 2025</div>
                  <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] text-white">After: Jun 2026</div>
                </div>
                
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-300 font-medium mb-1">Potential built-up area change detected</div>
                  <div className="text-[11px] text-slate-500">Confidence: 87%</div>
                  <button className="mt-3 w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg border border-cyan-500/20 transition-colors">
                    Generate Field Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Evidence Drawer Overlay */}
      {evidenceDrawer && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                Evidence Viewer
              </h3>
              <button onClick={() => setEvidenceDrawer(null)} className="text-slate-500 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="text-xs font-mono text-red-400 mb-4 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 inline-block">
                RULE: {evidenceDrawer.alertType.toUpperCase()}-001
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500 mb-1 font-medium">{evidenceDrawer.datasetsCompared[0]}</div>
                    <div className="text-sm text-slate-200 font-semibold">{Object.values(evidenceDrawer.values)[0]}</div>
                    <div className="text-[10px] text-slate-600 mt-2">Source: Dept of Revenue</div>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                    <div className="absolute top-1/2 -left-2.5 transform -translate-y-1/2 w-5 h-5 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 text-xs font-bold">!</div>
                    <div className="text-[10px] uppercase text-slate-500 mb-1 font-medium">{evidenceDrawer.datasetsCompared[1]}</div>
                    <div className="text-sm text-slate-200 font-semibold">{Object.values(evidenceDrawer.values)[1]}</div>
                    <div className="text-[10px] text-slate-600 mt-2">Source: Sub-Registrar</div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-semibold text-slate-300 mb-1">System Conclusion</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{evidenceDrawer.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-[10px] uppercase text-indigo-400 mb-1 font-semibold">Recommended Action</div>
                    <p className="text-xs text-slate-300">{evidenceDrawer.recommendedAction}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setEvidenceDrawer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

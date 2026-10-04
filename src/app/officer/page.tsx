'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { PARCELS, CONFLICT_ALERTS } from '@/lib/data';
import { Search, Map, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import type { Parcel } from '@/lib/types';

export default function OfficerPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const results = PARCELS.filter(p => {
    const matchQ = !query || p.ulpin.toLowerCase().includes(query.toLowerCase()) ||
      p.khasraNo.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.village.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-white mb-1">Parcel Search</h1>
          <p className="text-sm text-slate-500">Search and access parcel records, RoR, and intelligence across Raipur district.</p>
        </div>

        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ULPIN, Khasra, Village, Address…" className="form-input pl-10" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-48">
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Disputed">Disputed</option>
            <option value="Under Review">Under Review</option>
            <option value="Restricted">Restricted</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 mb-3">{results.length} parcels found</div>

        <div className="surface-card overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>ULPIN</th>
                <th>Khasra</th>
                <th>Village</th>
                <th>Area (acres)</th>
                <th>Land Use</th>
                <th>Zone</th>
                <th>Status</th>
                <th>Alerts</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 40).map(parcel => {
                const alertCount = CONFLICT_ALERTS.filter(a => a.parcelId === parcel.id && a.status !== 'Resolved').length;
                const critCount = CONFLICT_ALERTS.filter(a => a.parcelId === parcel.id && a.severity === 'critical' && a.status !== 'Resolved').length;
                return (
                  <tr key={parcel.id}>
                    <td className="font-mono text-xs font-bold text-indigo-300">{parcel.id}</td>
                    <td className="font-mono text-[10px] text-slate-600">{parcel.ulpin}</td>
                    <td className="font-mono text-xs">{parcel.khasraNo}</td>
                    <td className="text-xs">{parcel.village}</td>
                    <td className="font-mono text-xs">{parcel.areaAcres}</td>
                    <td className="text-xs">{parcel.landUse}</td>
                    <td><span className="chip text-[9px] bg-indigo-500/15 text-indigo-300">{parcel.zoning}</span></td>
                    <td>
                      <span className={`chip text-[9px] ${parcel.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : parcel.status === 'Disputed' ? 'bg-red-500/15 text-red-400' : parcel.status === 'Restricted' ? 'bg-violet-500/15 text-violet-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td>
                      {alertCount > 0 ? (
                        <span className={`chip text-[9px] ${critCount > 0 ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'}`}>
                          ⚠ {alertCount}
                        </span>
                      ) : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    <td>
                      <Link href={`/parcels/${parcel.id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Parcel 360 <ArrowRight size={10} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {results.length > 40 && (
            <div className="px-4 py-2 text-xs text-slate-600 border-t border-slate-800/50">
              Showing 40 of {results.length} results. Refine search to narrow down.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

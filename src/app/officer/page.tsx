'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { PARCELS, CONFLICT_ALERTS } from '@/lib/data';
import { Search, Map as MapIcon, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
              <Search size={11} /> Unified Land Cadastre
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight">
              Parcel Search & Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Query and inspect parcel records, Record of Rights (RoR), and spatial conflict flags across Raipur district.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <MapIcon size={14} /> Open GIS Workspace
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by ULPIN, Khasra, Village, or Address…"
              className="w-full bg-white border border-slate-200 rounded-xl text-xs text-slate-900 pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs text-slate-700 px-3.5 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs w-48 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Disputed">Disputed</option>
            <option value="Under Review">Under Review</option>
            <option value="Restricted">Restricted</option>
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{results.length}</span> parcel records
        </div>

        {/* Records Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Parcel ID</th>
                  <th className="p-3.5">ULPIN</th>
                  <th className="p-3.5">Khasra</th>
                  <th className="p-3.5">Village</th>
                  <th className="p-3.5">Area (Acres)</th>
                  <th className="p-3.5">Land Use</th>
                  <th className="p-3.5">Zone</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Conflicts</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.slice(0, 40).map(parcel => {
                  const alertCount = CONFLICT_ALERTS.filter(a => a.parcelId === parcel.id && a.status !== 'Resolved').length;
                  const critCount = CONFLICT_ALERTS.filter(a => a.parcelId === parcel.id && a.severity === 'critical' && a.status !== 'Resolved').length;
                  
                  return (
                    <tr key={parcel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{parcel.id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">{parcel.ulpin}</td>
                      <td className="p-3.5 font-mono text-slate-800">{parcel.khasraNo}</td>
                      <td className="p-3.5 text-slate-700">{parcel.village}</td>
                      <td className="p-3.5 font-mono text-slate-800">{parcel.areaAcres}</td>
                      <td className="p-3.5 text-slate-600">{parcel.landUse}</td>
                      <td className="p-3.5">
                        <span className="chip text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                          {parcel.zoning}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`chip text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          parcel.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : parcel.status === 'Disputed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : parcel.status === 'Restricted'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {parcel.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {alertCount > 0 ? (
                          <span className={`chip text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                            critCount > 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            <ShieldAlert size={11} /> {alertCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/parcels/${parcel.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Parcel 360 <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {results.length > 40 && (
            <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
              Showing 40 of {results.length} results. Refine search to narrow down.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

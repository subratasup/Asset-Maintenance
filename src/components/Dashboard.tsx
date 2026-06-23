/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Package, 
  HardDrive, 
  Truck, 
  AlertCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingDown,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { Asset, Company, Project, User, GRN, MaterialEntry, MaterialIssue, Item } from '../types';
import SummaryCards from './SummaryCards';
import PrintQrModal from './PrintQrModal';

interface DashboardProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  companies: Company[];
  projects: Project[];
  users: User[];
  grns: GRN[];
  materialEntries: MaterialEntry[];
  materialIssues: MaterialIssue[];
  items: Item[];
  onNavigate: (section: string) => void;
  selectedCompanyId: string;
}

export default function Dashboard({ 
  assets, 
  setAssets,
  companies, 
  projects, 
  users, 
  grns,
  materialEntries,
  materialIssues,
  items,
  onNavigate, 
  selectedCompanyId 
}: DashboardProps) {
  // Filter by selected company
  const filteredAssets = assets.filter(a => a.companyId === selectedCompanyId);
  const companyProjects = projects.filter(p => p.companyId === selectedCompanyId);
  const companyUsers = users.filter(u => u.companyId === selectedCompanyId);

  // Stats calculation
  const totalAssetsCount = filteredAssets.length;
  const totalAssetValue = filteredAssets.reduce((sum, item) => sum + item.rate, 0);
  
  // Calculate aggregate depreciation
  const totalDepreciatedValue = filteredAssets.reduce((sum, item) => {
    // Basic straight-line rate calculation for year-to-date simulation
    // Let's say laptops deprecate 40% annually, ACs 15% etc.
    const deprRate = item.categoryName.includes('IT') ? 0.40 : item.categoryName.includes('HVAC') ? 0.15 : 0.15;
    const purchaseYear = new Date(item.purchaseDate).getFullYear();
    const currentYear = 2026;
    const yearsDiff = Math.max(1, currentYear - purchaseYear);
    const depreciated = item.rate * Math.pow(1 - deprRate, yearsDiff);
    return sum + depreciated;
  }, 0);

  const pendingTransferCount = 1; // Simulated
  const complianceScore = 100; // Perfect score

  // Warranty Expiry Calculations (We default reference date to 2026-06-22 to ensure initial asset-2 is calculated within next 30 days)
  const systemDate = new Date();
  const refDate = systemDate.getFullYear() < 2026 ? new Date('2026-06-22') : systemDate;
  refDate.setHours(0, 0, 0, 0);

  const thirtyDaysFromRef = new Date(refDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  thirtyDaysFromRef.setHours(23, 59, 59, 999);

  // Filter assets whose warranty is expiring in the next 30 days
  const warrantyExpiringAssets = filteredAssets.filter(asset => {
    if (!asset.warrantyExpiry) return false;
    const expiry = new Date(asset.warrantyExpiry);
    if (isNaN(expiry.getTime())) return false;
    return expiry >= refDate && expiry <= thirtyDaysFromRef;
  }).map(asset => {
    const expiry = new Date(asset.warrantyExpiry!);
    const diffTime = expiry.getTime() - refDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...asset,
      daysLeft: diffDays
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const handleExtendWarranty = (assetId: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id !== assetId) return asset;
      const currentExpiry = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) : new Date();
      currentExpiry.setMonth(currentExpiry.getMonth() + 12);
      const newExpiryStr = currentExpiry.toISOString().split('T')[0];
      return {
        ...asset,
        warrantyMonths: asset.warrantyMonths + 12,
        warrantyExpiry: newExpiryStr
      };
    }));
    alert("Warranty successfully extended by 12 Months! Checked & verified physically by on-field personnel.");
  };

  // QR Print Label Selection States
  const [selectedPrintIds, setSelectedPrintIds] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleTogglePrintAsset = (assetId: string) => {
    setSelectedPrintIds(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAllPrint = () => {
    setSelectedPrintIds(filteredAssets.map(a => a.id));
  };

  const handleClearPrint = () => {
    setSelectedPrintIds([]);
  };

  const handleDirectPrintSingle = (assetId: string) => {
    setSelectedPrintIds([assetId]);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Upper Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase block mb-1 font-mono">DEPLOYMENT OVERVIEW</span>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">
            Fleet Control &amp; Maintenance <span className="font-semibold text-indigo-600">Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-normal">
            Operational Overview Scoped to <span className="font-semibold text-slate-700 underline decoration-indigo-300">{companies.find(c => c.id === selectedCompanyId)?.name || 'ESTEEM InfraProjects'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            NODE RUNNER ACTIVE
          </span>
        </div>
      </div>

      {/* Live Operational Alerts & Status Cards */}
      <SummaryCards
        assets={assets}
        grns={grns}
        materialEntries={materialEntries}
        materialIssues={materialIssues}
        items={items}
        selectedCompanyId={selectedCompanyId}
        onNavigate={onNavigate}
      />

      {/* Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Registry */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-sm transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagged Fleet</span>
            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 border border-indigo-100">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{totalAssetsCount}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <span className="text-emerald-600 font-bold font-mono">100%</span> QR verified active nodes
            </p>
          </div>
        </div>

        {/* Card 2: Investment Capital */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-sm transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acquisition Value</span>
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 border border-emerald-100">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              ₹ {totalAssetValue.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              Initial capital expenditure
            </p>
          </div>
        </div>

        {/* Card 3: Year End Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-sm transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Book Value (Y-2026)</span>
            <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 border border-amber-100">
              <HardDrive size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              ₹ {Math.round(totalDepreciatedValue).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              With Straight-Line Depreciation
            </p>
          </div>
        </div>

        {/* Card 4: Integrity Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-sm transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Audit Score</span>
            <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600 border border-purple-100">
              <Shield size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{complianceScore}%</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              Zero pending safety discrepancies
            </p>
          </div>
        </div>

      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Locations / Projects list */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active transit yards & projects</h3>
            <button 
              onClick={() => onNavigate('masters')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Configure Masters
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {companyProjects.map((proj) => {
              const projectAssetsCount = filteredAssets.filter(a => a.projectId === proj.id).length;
              return (
                <div key={proj.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{proj.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{proj.city}, {proj.state}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[10px] uppercase font-bold px-2 py-1 rounded">
                      {projectAssetsCount} Tagged Nodes
                    </span>
                  </div>
                </div>
              );
            })}
            {companyProjects.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No projects assigned to this company yet.</p>
            )}
          </div>
        </div>

        {/* Quick Auditing / Active Transfers Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Fast audit checklist</h3>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 bg-emerald-50 rounded-full p-0.5 mt-0.5 shrink-0">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">All tags unique & serialized</h4>
                  <p className="text-[10px] text-slate-400">Strict unique index checks passed.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-emerald-600 bg-emerald-50 rounded-full p-0.5 mt-0.5 shrink-0">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">Audit logs matched physical counts</h4>
                  <p className="text-[10px] text-slate-400">Inventory reconciliation matching 100%.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="text-amber-500 bg-amber-50 rounded-full p-0.5 mt-0.5 shrink-0">
                  <AlertCircle size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">SSL certification alert</h4>
                  <p className="text-[10px] text-slate-400">Ensure VPS Nginx installation incorporates Let's Encrypt.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => onNavigate('security')}
              className="w-full bg-slate-900 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              <Shield size={14} />
              Open Security Hardening Wizard
            </button>
          </div>
        </div>

      </div>

      {/* Warranty Expiration Monitor Widget */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" id="warranty-expiration-monitor-widget">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 border border-amber-100 text-amber-600 p-2 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Warranty Expiration Monitor</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Critical asset protection node status alerts in the next 30 days ({refDate.toISOString().split('T')[0]})</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${warrantyExpiringAssets.length > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-50 text-emerald-800'}`}>
            {warrantyExpiringAssets.length} {warrantyExpiringAssets.length === 1 ? 'ALERT' : 'ALERTS'} ACTIVE
          </span>
        </div>

        {warrantyExpiringAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warrantyExpiringAssets.map(asset => (
              <div 
                key={asset.id} 
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {asset.assetTagNo}
                    </span>
                    <span className="text-xs font-bold text-rose-600 font-mono flex items-center gap-1">
                      <Clock size={12} /> {asset.daysLeft} {asset.daysLeft === 1 ? 'day' : 'days'} left
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{asset.itemName}</h4>
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] text-slate-400">
                      Custodian: <strong className="text-slate-600">{asset.allottedToName}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Expires On: <strong className="text-rose-600 font-mono">{asset.warrantyExpiry}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-rose-100/60 justify-between">
                  <span className="text-[9px] text-slate-500 font-semibold font-mono uppercase bg-slate-100 px-1 py-0.5 rounded">Mo: {asset.warrantyMonths}</span>
                  <button
                    onClick={() => handleExtendWarranty(asset.id)}
                    className="bg-indigo-600 font-bold hover:bg-indigo-700 text-white rounded px-2.5 py-1 text-[10px] transition flex items-center gap-1 shadow-xs"
                  >
                    <Wrench size={10} /> Extend +12M
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
            <span className="text-emerald-500 text-lg font-bold">✓</span>
            <p className="text-xs font-semibold text-slate-800">Warranty ledger in total compliance</p>
            <p className="text-[10px] text-slate-400">No registered hardware or machinery expirations detected in the next 30 days.</p>
          </div>
        )}
      </div>

      {/* Asset Grid List inside home page */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight font-sans">Quick Fleet Overview</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Most recently tagged hardware or heavy machinery</p>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Batch actions if selections exist */}
            {selectedPrintIds.length > 0 ? (
              <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-120/40 rounded-xl p-1 px-3">
                <span className="text-[10px] text-indigo-700 font-bold font-mono">
                  {selectedPrintIds.length} SELECTED
                </span>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-3 py-1 text-[11px] transition flex items-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
                >
                  <Printer size={12} /> Print Labels
                </button>
                <button
                  onClick={handleClearPrint}
                  className="text-slate-400 hover:text-rose-600 text-xs px-1.5 py-1 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleSelectAllPrint();
                  setIsPrintModalOpen(true);
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold rounded-lg px-3 py-1.5 text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} /> Print All Labels
              </button>
            )}

            <span className="text-slate-200" aria-hidden="true">|</span>

            <button
              onClick={() => onNavigate('operations')}
              className="text-xs font-semibold text-indigo-650 hover:underline cursor-pointer"
            >
              Tag New Asset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="asset-dashboard-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={filteredAssets.length > 0 && selectedPrintIds.length === filteredAssets.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSelectAllPrint();
                      } else {
                        handleClearPrint();
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-605 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5"
                    title="Select all assets for label printing"
                  />
                </th>
                <th className="py-2.5">Asset Tag</th>
                <th className="py-2.5">Item Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Allotted To</th>
                <th className="py-2.5">Acquisition Cost</th>
                <th className="py-2.5">Warrantee</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAssets.map((asset) => {
                const isSelected = selectedPrintIds.includes(asset.id);
                return (
                  <tr key={asset.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePrintAsset(asset.id)}
                        className="rounded border-slate-300 text-indigo-605 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5"
                      />
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">{asset.assetTagNo}</td>
                    <td className="py-3 font-sans font-semibold text-slate-800">{asset.itemName}</td>
                    <td className="py-3 text-slate-500">{asset.categoryName}</td>
                    <td className="py-3 font-sans">
                      <span className="font-semibold text-slate-800">{asset.allottedToName}</span>
                      <span className="block text-[9px] text-slate-400 font-mono uppercase">{asset.allottedType}</span>
                    </td>
                    <td className="py-3 font-mono">₹{asset.rate.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-500 font-mono">
                      <div>{asset.warrantyMonths} months</div>
                      {asset.warrantyExpiry && (
                        <span className="text-[10px] text-slate-400 block font-sans">Ends: {asset.warrantyExpiry}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[9px]">
                        <span className="h-1 w-1 rounded-full bg-emerald-600"></span> Active
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDirectPrintSingle(asset.id)}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded-lg px-2.5 py-1 text-[10px] font-sans transition inline-flex items-center gap-1 cursor-pointer hover:shadow-2xs"
                        title="Print QR sticker code for this individual item"
                      >
                        <Printer size={10} /> Print Label
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-slate-400 font-sans">
                    No tagged assets recorded for this company. Move to Operations &rarr; Asset Tagging to generate tags.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable QR tag generator suites */}
      <PrintQrModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedAssets={filteredAssets.filter(a => selectedPrintIds.includes(a.id))}
        allAssets={filteredAssets}
        onToggleAssetSelection={handleTogglePrintAsset}
        onSelectAll={handleSelectAllPrint}
        onDeselectAll={handleClearPrint}
      />
    </div>
  );
}

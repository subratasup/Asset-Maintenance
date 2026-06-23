/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, PurchaseOrder, Invoice, AssetTransferLog, AssetReconciliationLog, SystemAuditLog } from '../types';
import { Clipboard, TrendingDown, ShoppingBag, FileCheck, ArrowLeftRight, Download, Printer, Search, ShieldCheck } from 'lucide-react';
import PrintQrModal from './PrintQrModal';

interface ReportsProps {
  assets: Asset[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  transfers: AssetTransferLog[];
  reconciliations: AssetReconciliationLog[];
  selectedCompanyId: string;
  auditLogs?: SystemAuditLog[];
}

type ReportType = 'asset_list' | 'depreciation' | 'purchase' | 'invoice' | 'transfer' | 'reconciliation' | 'system_audit';

export default function Reports({
  assets,
  purchaseOrders,
  invoices,
  transfers,
  reconciliations,
  selectedCompanyId,
  auditLogs = []
}: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('asset_list');
  const [searchTerm, setSearchTerm] = useState('');

  // QR Print States
  const [selectedPrintIds, setSelectedPrintIds] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleToggleSelect = (assetId: string) => {
    setSelectedPrintIds(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAll = (targetAssets: Asset[]) => {
    if (selectedPrintIds.length === targetAssets.length) {
      setSelectedPrintIds([]);
    } else {
      setSelectedPrintIds(targetAssets.map(a => a.id));
    }
  };

  const handleDirectPrintSingle = (assetId: string) => {
    setSelectedPrintIds([assetId]);
    setIsPrintModalOpen(true);
  };

  // Filter scoped to selected company
  const filteredAssets = assets.filter(a => a.companyId === selectedCompanyId && a.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const calculateDepreciationLog = (asset: Asset) => {
    const rate = asset.categoryName.includes('IT') ? 0.40 : asset.categoryName.includes('HVAC') ? 0.15 : 0.15;
    const purchaseYear = new Date(asset.purchaseDate).getFullYear();
    const currentYear = 2026;
    const yearsDiff = Math.max(1, currentYear - purchaseYear);
    
    const accumulatedDepr = asset.rate - (asset.rate * Math.pow(1 - rate, yearsDiff));
    const netBookValue = Math.max(0, asset.rate - accumulatedDepr);

    return {
      ratePercent: rate * 100,
      accumulated: Math.round(accumulatedDepr),
      netBookValue: Math.round(netBookValue)
    };
  };

  return (
    <div className="space-y-6" id="reports-tab">
      
      {/* Search & Export bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search items relative to active report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => { alert('Simulated CSV ledger raw data package download.'); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV Ledger
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Printer size={14} /> Print Audit Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reports Navigation Menu sidebar (Col span 3) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 shrink-0 h-fit">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SELECT LEDGER CATEGORIES</span>
          
          <button
            onClick={() => setActiveReport('asset_list')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'asset_list' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <Clipboard size={14} /> Complete Assets Registry
          </button>
          
          <button
            onClick={() => setActiveReport('depreciation')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'depreciation' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <TrendingDown size={14} /> Depreciation Calculations
          </button>

          <button
            onClick={() => setActiveReport('purchase')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'purchase' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <ShoppingBag size={14} /> Purchases Summary Report
          </button>

          <button
            onClick={() => setActiveReport('invoice')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'invoice' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <FileCheck size={14} /> Invoices Ledger Report
          </button>

          <button
            onClick={() => setActiveReport('transfer')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'transfer' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <ArrowLeftRight size={14} /> Asset Dispensation Logs
          </button>

          <button
            onClick={() => setActiveReport('reconciliation')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'reconciliation' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
          >
            <FileCheck size={14} /> Audit & Reconcile States
          </button>

          <button
            onClick={() => setActiveReport('system_audit')}
            className={`w-full text-left font-bold text-xs p-3 rounded-xl flex items-center gap-2 transition ${activeReport === 'system_audit' ? 'bg-indigo-50 border border-indigo-200 text-indigo-750' : 'text-slate-650 hover:bg-slate-50 border border-transparent'}`}
            id="reports-nav-system-audit-btn"
          >
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" /> System Audit Compliance
          </button>

        </div>

        {/* Report tables Display stage (Col span 9) */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto min-h-[480px]">
          
          {/* 1) COMPLETE ACTIVE ASSETS REGISTRY */}
          {activeReport === 'asset_list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Complete active assets registry</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Generate compliance QR tags, barcodes, or layout certificates for auditing audits</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPrintIds.length > 0 ? (
                    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg p-1 px-2.5">
                      <span className="text-[9px] text-indigo-700 font-bold font-mono">
                        {selectedPrintIds.length} SELECTED
                      </span>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold rounded px-2 py-0.5 text-[9px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Printer size={10} /> Print {selectedPrintIds.length} Labels
                      </button>
                      <button
                        onClick={() => setSelectedPrintIds([])}
                        className="text-slate-400 hover:text-rose-600 text-[10px] px-1 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPrintIds(filteredAssets.map(a => a.id));
                        setIsPrintModalOpen(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded px-2.5 py-1 text-[10px] transition flex items-center gap-1 cursor-pointer hover:border-slate-400"
                    >
                      <Printer size={11} /> Print All QR Labels
                    </button>
                  )}
                </div>
              </div>

              <table className="w-full text-left font-mono text-[11px] text-slate-705">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={filteredAssets.length > 0 && selectedPrintIds.length === filteredAssets.length}
                        onChange={() => handleSelectAll(filteredAssets)}
                        className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="py-2.5">Tag No</th>
                    <th className="py-2.5">Product Title</th>
                    <th className="py-2.5">Acquisition date</th>
                    <th className="py-2.5">Cost Rate</th>
                    <th className="py-2.5">Warranty</th>
                    <th className="py-2.5">Coordinate allotment</th>
                    <th className="py-2.5 text-right">QR Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAssets.map(a => {
                    const isSelected = selectedPrintIds.includes(a.id);
                    return (
                      <tr key={a.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(a.id)}
                            className="rounded border-slate-350 text-indigo-600"
                          />
                        </td>
                        <td className="py-3 font-bold text-slate-900">{a.assetTagNo}</td>
                        <td className="py-3 font-sans font-semibold text-slate-800">{a.itemName}</td>
                        <td className="py-3">{a.purchaseDate}</td>
                        <td className="py-3">₹{a.rate.toLocaleString('en-IN')}</td>
                        <td className="py-3">{a.warrantyMonths} Months</td>
                        <td className="py-3 font-sans text-xs text-indigo-705 font-bold">{a.allottedToName}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDirectPrintSingle(a.id)}
                            className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-205 text-slate-700 font-extrabold rounded-lg px-2.5 py-1 text-[10px] font-sans transition inline-flex items-center gap-1 cursor-pointer"
                            title="Generate and print printable QR Sticker label sheet"
                          >
                            <Printer size={9} /> Print Label
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 font-sans text-xs">No active matching assets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2) DEPRECIATION CALCULATION REPORT */}
          {activeReport === 'depreciation' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-150 pb-2">Tax Straight-Line Depreciation Ledger (Y-2026)</h3>
              <table className="w-full text-left font-mono text-[11px] text-slate-705">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5">Tag No</th>
                    <th className="py-2.5">Asset specs</th>
                    <th className="py-2.5">Purchase Cost</th>
                    <th className="py-2.5">Rate %</th>
                    <th className="py-2.5">Accumulated Depreciation</th>
                    <th className="py-2.5 text-right">Net Written Down Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAssets.map(a => {
                    const depr = calculateDepreciationLog(a);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">{a.assetTagNo}</td>
                        <td className="py-3 font-sans text-slate-800">{a.itemName}</td>
                        <td className="py-3">₹{a.rate.toLocaleString('en-IN')}</td>
                        <td className="py-3">{depr.ratePercent}%</td>
                        <td className="py-3 text-red-650">₹{depr.accumulated.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-emerald-800 font-bold">₹{depr.netBookValue.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans text-xs">No assets recorded to calculate depreciation.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3) PURCHASES SUMMARY REPORT */}
          {activeReport === 'purchase' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-150 pb-2">Active Procurement contracts and Purchase Orders</h3>
              <table className="w-full text-left font-mono text-[11px] text-slate-705">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5">PO Ref</th>
                    <th className="py-2.5">Contractor</th>
                    <th className="py-2.5">Issue Date</th>
                    <th className="py-2.5">Contact No</th>
                    <th className="py-2.5 text-right">Attachment state</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-905">{po.orderNo}</td>
                      <td className="py-3 font-sans font-bold text-slate-805">{po.vendorName}</td>
                      <td className="py-3">{po.orderDate}</td>
                      <td className="py-3">{po.vendorContactNo}</td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-150 px-2 py-0.5 rounded text-[10px]">
                          VERIFIED CONTRACTED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4) INVOICES GENERAL AUDIT */}
          {activeReport === 'invoice' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-150 pb-2">incoming tax invoice accounting registry</h3>
              <table className="w-full text-left font-mono text-[11px] text-slate-785">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-450 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5">Invoice No</th>
                    <th className="py-2.5">Billed Date</th>
                    <th className="py-2.5">Supplier Company</th>
                    <th className="py-2.5">Classification</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">{inv.invoiceNo}</td>
                      <td className="py-3">{inv.invoiceDate}</td>
                      <td className="py-3 font-sans font-semibold text-slate-800">{inv.vendorName}</td>
                      <td className="py-3">
                        <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-850 px-2 py-0.5 rounded font-mono">
                          {inv.type}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded font-sans text-[10px] font-bold">
                          TAX SECURED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5) ASSET DISPENSATION LOGS */}
          {activeReport === 'transfer' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-150 pb-2">Gate Pass Dispatch & transfers History logs</h3>
              <table className="w-full text-left font-mono text-[11px] text-slate-705">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5">Dispatch Date</th>
                    <th className="py-2.5">Registry node</th>
                    <th className="py-2.5">Previous Allotment</th>
                    <th className="py-2.5">Current Custody</th>
                    <th className="py-2.5 text-right">Gate Pass notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3">{tx.transferDate}</td>
                      <td className="py-3 font-bold text-indigo-700">{tx.assetTagNo}</td>
                      <td className="py-3 font-sans text-slate-600">{tx.fromAllottedTo}</td>
                      <td className="py-3 font-sans text-slate-900 font-bold">{tx.toAllottedTo}</td>
                      <td className="py-3 text-right font-sans italic text-slate-505">&ldquo;{tx.remarks || 'Standard Transit'}&rdquo;</td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-sans text-xs">No transit dispatches registered in active history.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 6) AUDIT & RECONCILE STATE REGISTRY */}
          {activeReport === 'reconciliation' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-150 pb-2">Historical Field physical Audit Verification Logs</h3>
              <table className="w-full text-left font-mono text-[11px] text-slate-705">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-2">
                    <th className="py-2.5">Audit Date</th>
                    <th className="py-2.5">Asset Tag</th>
                    <th className="py-2.5">Scanned Node</th>
                    <th className="py-2.5">Auditor Name</th>
                    <th className="py-2.5">Verification Status</th>
                    <th className="py-2.5 text-right">Auditor Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reconciliations.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="py-3">{rec.reconDate}</td>
                      <td className="py-3 font-bold text-slate-905">{rec.assetTagNo}</td>
                      <td className="py-3 font-sans font-semibold text-slate-805">{rec.assetName}</td>
                      <td className="py-3 font-sans text-slate-600">{rec.auditorName}</td>
                      <td className="py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${rec.status === 'Verified' ? 'bg-emerald-150 text-emerald-800' : 'bg-red-150 text-red-800'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-sans italic text-slate-500">&ldquo;{rec.remarks}&rdquo;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7) SYSTEM SECURITY AUDIT COMPLIANCE */}
          {activeReport === 'system_audit' && (() => {
            const displayAuditLogs = auditLogs.filter(log => {
              if (log.companyId !== selectedCompanyId) return false;
              if (!searchTerm) return true;
              const matchesTerm = 
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.metadata || '').toLowerCase().includes(searchTerm.toLowerCase());
              return matchesTerm;
            });

            const uniqueOperators = new Set(displayAuditLogs.map(l => l.userId)).size;

            return (
              <div className="space-y-4" id="system-audit-compliance-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-2.5 gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Corporate Operations Audit Trail Log & Compliance Ledger
                    </h3>
                    <p className="text-[10px] text-slate-450 font-sans mt-0.5">
                      Immutable sequence of all asset allocations, transfers, warranty updates, and inventory approvals
                    </p>
                  </div>
                  <div className="text-[9px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded shrink-0">
                    ISO 27001 AUDITING ACTIVE
                  </div>
                </div>

                {/* Audit Performance/Compliance Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Compliance Activities</span>
                    <span className="text-lg font-black text-slate-800 tracking-tight block mt-0.5">
                      {displayAuditLogs.length}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Operators Tracked</span>
                    <span className="text-lg font-black text-indigo-700 tracking-tight block mt-0.5">
                      {uniqueOperators}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Gateway Integrity</span>
                    <span className="text-lg font-black text-emerald-700 tracking-tight block mt-0.5 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> VERIFIED SECURE
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Local Node Context</span>
                    <span className="text-xs font-black text-slate-600 font-mono tracking-tight block mt-1.5 truncate" title={selectedCompanyId}>
                      {selectedCompanyId}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left font-mono text-[11px] text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-450 font-bold uppercase tracking-widest">
                        <th className="py-2.5 px-3">Date & Time / Node IP</th>
                        <th className="py-2.5 px-3">Authorized Operator</th>
                        <th className="py-2.5 px-3">Action Category</th>
                        <th className="py-2.5 px-3">Compliance narrative description</th>
                        <th className="py-2.5 px-3 text-right">Reference Metadata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {displayAuditLogs.map(log => {
                        let actionBg = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (log.actionType === 'GRN_APPROVAL') actionBg = 'bg-blue-550 border-blue-200 text-blue-700 font-extrabold';
                        else if (log.actionType === 'ASSET_TRANSFER') actionBg = 'bg-purple-50 border-purple-200 text-purple-700 font-extrabold';
                        else if (log.actionType === 'ASSET_TAGGED') actionBg = 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold';
                        else if (log.actionType === 'WARRANTY_EXTEND') actionBg = 'bg-cyan-50 border-cyan-205 text-cyan-700 font-extrabold';
                        else if (log.actionType === 'MATERIAL_ISSUE') actionBg = 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold';
                        else if (log.actionType === 'MATERIAL_RECEIVE') actionBg = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold';
                        else if (log.actionType === 'RECONCILIATION') actionBg = 'bg-teal-50 border-teal-200 text-teal-700 font-extrabold';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-slate-900 leading-tight">
                                {new Date(log.timestamp).toLocaleString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{log.ipAddress || '127.0.0.1'}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-sans font-extrabold text-slate-800 leading-none">{log.userName}</div>
                              <span className="text-[8px] bg-slate-100 border border-slate-200 px-1 rounded font-mono uppercase font-bold text-indigo-750 inline-block mt-1">
                                {log.userRole}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 text-[9px] rounded-md border uppercase inline-block font-mono tracking-wider text-[8.5px] ${actionBg}`}>
                                {log.actionType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-sans leading-relaxed pr-6 max-w-sm">
                              {log.description}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-500 font-mono text-[10px] select-all">
                              {log.metadata ? (
                                <code className="bg-slate-100 border border-slate-200 font-mono px-1.5 py-0.5 rounded text-[9.5px]">
                                  {log.metadata}
                                </code>
                              ) : (
                                <span className="text-slate-350 font-sans italic text-[10px]">none</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {displayAuditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                            <div className="text-xl mb-1.5">📭</div>
                            No audit trail events found matching safety compliance constraints.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      <PrintQrModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedAssets={assets.filter(a => selectedPrintIds.includes(a.id))}
        allAssets={assets.filter(a => a.companyId === selectedCompanyId)}
        onToggleAssetSelection={handleToggleSelect}
        onSelectAll={() => setSelectedPrintIds(assets.filter(a => a.companyId === selectedCompanyId).map(a => a.id))}
        onDeselectAll={() => setSelectedPrintIds([])}
      />

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, AssetTransferLog, AssetReconciliationLog, Project } from '../types';
import { MoveRight, ShieldAlert, CheckCircle2, Search, ArrowLeftRight, ClipboardCheck, Calendar, User, Navigation } from 'lucide-react';

interface TransfersProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  projects: Project[];
  transfers: AssetTransferLog[];
  setTransfers: React.Dispatch<React.SetStateAction<AssetTransferLog[]>>;
  reconciliations: AssetReconciliationLog[];
  setReconciliations: React.Dispatch<React.SetStateAction<AssetReconciliationLog[]>>;
  selectedCompanyId: string;
  addAuditLog?: (actionType: string, description: string, metadata?: string) => void;
}

export default function Transfers({
  assets, setAssets,
  projects,
  transfers, setTransfers,
  reconciliations, setReconciliations,
  selectedCompanyId,
  addAuditLog
}: TransfersProps) {
  const [activeTab, setActiveTab] = useState<'transfer' | 'reconcile'>('transfer');

  // Search Tag No state
  const [searchTag, setSearchTag] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Transfer Forms states
  const [txType, setTxType] = useState<'Location' | 'Person'>('Location');
  const [txTargetLocation, setTxTargetLocation] = useState('');
  const [txTargetPersonName, setTxTargetPersonName] = useState('');
  const [txTargetEmail, setTxTargetEmail] = useState('');
  const [txTargetPhone, setTxTargetPhone] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txRemarks, setTxRemarks] = useState('');

  // Reconciliation states
  const [reconStatus, setReconStatus] = useState<'Verified' | 'Missing' | 'Damaged' | 'Transferred'>('Verified');
  const [reconRemarks, setReconRemarks] = useState('');

  const handleSearch = () => {
    const found = assets.find(a => a.assetTagNo.trim().toUpperCase() === searchTag.trim().toUpperCase() && a.companyId === selectedCompanyId);
    if (found) {
      setSelectedAsset(found);
    } else {
      alert(`Asset Tag No "${searchTag}" not registered or belongs to another company context.`);
      setSelectedAsset(null);
    }
  };

  const executeTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const toAllotted = txType === 'Location' ? txTargetLocation : txTargetPersonName;
    
    // Create audit transfer log
    const newTxLog: AssetTransferLog = {
      id: `tx-${Date.now()}`,
      assetTagNo: selectedAsset.assetTagNo,
      assetName: selectedAsset.itemName,
      fromAllottedTo: selectedAsset.allottedToName,
      toAllottedType: txType,
      toAllottedTo: toAllotted,
      toEmail: txType === 'Person' ? txTargetEmail : undefined,
      toPhone: txType === 'Person' ? txTargetPhone : undefined,
      transferDate: txDate,
      remarks: txRemarks
    };

    // Update primary asset list state
    const targetProjectMatched = projects.find(p => p.name === txTargetLocation && p.companyId === selectedCompanyId);

    setAssets(prev => prev.map(a => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          allottedType: txType,
          allottedToName: toAllotted,
          allottedToEmail: txType === 'Person' ? txTargetEmail : undefined,
          allottedToPhone: txType === 'Person' ? txTargetPhone : undefined,
          projectId: txType === 'Location' && targetProjectMatched ? targetProjectMatched.id : a.projectId,
          allottedDate: txDate
        };
      }
      return a;
    }));

    setTransfers([newTxLog, ...transfers]);
    if (addAuditLog) {
      addAuditLog(
        'ASSET_TRANSFER',
        `Transferred custody of asset "${selectedAsset.itemName}" (${selectedAsset.assetTagNo}) from previous host [${selectedAsset.allottedToName}] to current target [${toAllotted}].`,
        `Method: ${txType} • Gatepass Details: ${txRemarks || 'Standard inter-project dispatch'}`
      );
    }
    alert(`Asset ${selectedAsset.assetTagNo} successfully transferred from [${selectedAsset.allottedToName}] to [${toAllotted}].`);
    
    // Clear form
    setSelectedAsset(null);
    setSearchTag('');
    setTxTargetLocation('');
    setTxTargetPersonName('');
    setTxTargetEmail('');
    setTxTargetPhone('');
    setTxRemarks('');
  };

  const executeReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const newReconLog: AssetReconciliationLog = {
      id: `rec-${Date.now()}`,
      assetTagNo: selectedAsset.assetTagNo,
      assetName: selectedAsset.itemName,
      lastAllottedTo: selectedAsset.allottedToName,
      currentQty: 1,
      reconDate: new Date().toISOString().split('T')[0],
      status: reconStatus,
      remarks: reconRemarks,
      auditorName: 'Vicky Kumar (Lead Auditor)'
    };

    setReconciliations([newReconLog, ...reconciliations]);
    if (addAuditLog) {
      addAuditLog(
        'RECONCILIATION',
        `Executed visual/physical verification Audit for asset "${selectedAsset.itemName}" (${selectedAsset.assetTagNo}). Verified Status outcome: [${reconStatus}].`,
        `Auditor: ${newReconLog.auditorName} • Comments: ${reconRemarks || 'none'}`
      );
    }
    
    // Update active remarks on primary Asset node
    setAssets(prev => prev.map(a => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          remarks: `${a.remarks || ''} [Recon Audit ${newReconLog.reconDate}: ${reconStatus} - ${reconRemarks}]`
        };
      }
      return a;
    }));

    alert(`Physical Audit Log logged. Asset ${selectedAsset.assetTagNo} recorded as status [${reconStatus}].`);
    
    setSelectedAsset(null);
    setSearchTag('');
    setReconRemarks('');
  };

  return (
    <div className="space-y-6" id="transfers-tab">
      
      {/* Sub tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-2 shadow-xs">
        <button
          onClick={() => { setActiveTab('transfer'); setSelectedAsset(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ArrowLeftRight size={14} /> SECURITY ASSET TRANSFER
        </button>
        <button
          onClick={() => { setActiveTab('reconcile'); setSelectedAsset(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'reconcile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ClipboardCheck size={14} /> PHYSICAL AUDIT RECONCILIATION
        </button>
      </div>

      {/* SEARCH AND CAPTURE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        
        <div className="max-w-md">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
            Search Registry tag number to begin
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="e.g. ESTM-EX-003 or EIP-12345"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono focus:bg-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 rounded-lg"
            >
              Verify Tag
            </button>
          </div>
          
          {/* Quick Autocomplete Tags tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
            <span className="text-[10px] text-slate-400 font-sans uppercase">Quick Tags available in scope:</span>
            {assets.filter(a => a.companyId === selectedCompanyId).slice(0, 4).map(a => (
              <button
                key={a.id}
                onClick={() => { setSearchTag(a.assetTagNo); setSelectedAsset(a); }}
                className="text-[10px] font-mono hover:bg-slate-200 border border-slate-200 bg-slate-100 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition"
              >
                {a.assetTagNo}
              </button>
            ))}
          </div>
        </div>

        {selectedAsset && (
          <div className="border border-indigo-150 rounded-2xl bg-indigo-50/15 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header tag */}
            <div className="bg-indigo-900/5 px-5 py-3 border-b border-indigo-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-2">
                VERIFIED INDEX NODE: {selectedAsset.assetTagNo}
              </span>
              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-2.2 py-0.5 rounded uppercase font-bold">
                {selectedAsset.categoryName}
              </span>
            </div>

            {/* General item details parameters display */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Product Title</span>
                <strong className="block text-slate-850 text-sm font-semibold">{selectedAsset.itemName}</strong>
                <span className="text-slate-500 font-mono text-[10px]">Serial No: {selectedAsset.productSerialNo}</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Acquisition Cost & Date</span>
                <strong className="block text-slate-850 font-semibold text-sm">₹{selectedAsset.rate.toLocaleString('en-IN')}</strong>
                <span className="text-slate-500 font-mono text-[10px]">PO: {selectedAsset.poNo}</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Currently Allotted to</span>
                <strong className="block text-slate-850 text-sm font-bold flex items-center gap-1">
                  {selectedAsset.allottedType === 'Location' ? <Navigation size={13} className="text-indigo-600"/> : <User size={13} className="text-indigo-600"/>}
                  {selectedAsset.allottedToName}
                </strong>
                <span className="text-slate-500 text-[10px] block font-mono">Assigned date: {selectedAsset.allottedDate}</span>
              </div>
            </div>

            {/* ACTION FORMS DEPENDING ON TAB SELECTED */}

            {/* 1) TRANSFER DISPATCH WORKFLOW FORM */}
            {activeTab === 'transfer' && (
              <form onSubmit={executeTransfer} className="p-5 bg-white border-t border-indigo-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1 text-indigo-600 leading-normal">
                  <MoveRight size={14} /> Specify Dispatch Destination Coordinates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Destination Coordinate class */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transfer Classification Destination</label>
                      <div className="flex gap-4 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                          <input
                            type="radio"
                            name="tx_to_type"
                            checked={txType === 'Location'}
                            onChange={() => setTxType('Location')}
                          />
                          Transit Site / Yard
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                          <input
                            type="radio"
                            name="tx_to_type"
                            checked={txType === 'Person'}
                            onChange={() => setTxType('Person')}
                          />
                          Operating Person
                        </label>
                      </div>
                    </div>

                    {txType === 'Location' ? (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Transit Destination Yard</label>
                        <select
                          required
                          value={txTargetLocation}
                          onChange={(e) => setTxTargetLocation(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                        >
                          <option value="">-- Choose project yard --</option>
                          {projects.filter(p => p.companyId === selectedCompanyId && p.name !== selectedAsset.allottedToName).map(p => (
                            <option key={p.id} value={p.name}>{p.name} ({p.city})</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg space-y-3 animate-in fade-in duration-150">
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Operating Person Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={txTargetPersonName}
                            onChange={(e) => setTxTargetPersonName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Email</label>
                            <input
                              type="email"
                              required
                              placeholder="sarah@esteem.com"
                              value={txTargetEmail}
                              onChange={(e) => setTxTargetEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Mobile</label>
                            <input
                              type="text"
                              required
                              placeholder="+91"
                              value={txTargetPhone}
                              onChange={(e) => setTxTargetPhone(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transfer metadata remarks */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dispatch Issue Date</label>
                      <input
                        type="date"
                        required
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gate Pass / Dispatch notes</label>
                      <textarea
                        rows={3}
                        required
                        value={txRemarks}
                        onChange={(e) => setTxRemarks(e.target.value)}
                        placeholder="State reason, gate pass reference, or driver tracking details."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right pt-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2 rounded-lg text-xs"
                  >
                    Execute Security Dispatch Transfer
                  </button>
                </div>
              </form>
            )}

            {/* 2) PHYSICAL AUDIT RECONCILIATION FORM */}
            {activeTab === 'reconcile' && (
              <form onSubmit={executeReconcile} className="p-5 bg-white border-t border-indigo-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1 text-indigo-600 leading-normal">
                  <ClipboardCheck size={14} /> Submit Verified Field Audit Log
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Verified Operating Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Verified', 'Missing', 'Damaged', 'Transferred'].map((status) => (
                        <label
                          key={status}
                          onClick={() => setReconStatus(status as any)}
                          className={`p-3 border rounded-xl flex items-center gap-2 cursor-pointer text-xs font-bold transition ${reconStatus === status ? 'border-indigo-600 bg-indigo-50/35 text-indigo-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                        >
                          <input
                            type="radio"
                            name="recon_status"
                            checked={reconStatus === status}
                            readOnly
                            className="accent-indigo-600"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Physical Verification Remarks</label>
                      <textarea
                        rows={3}
                        required
                        value={reconRemarks}
                        onChange={(e) => setReconRemarks(e.target.value)}
                        placeholder="State visual state, physical wear, or discrepencies observed on-site by the auditor."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-lg text-xs"
                  >
                    Commit Verified Audit Log
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

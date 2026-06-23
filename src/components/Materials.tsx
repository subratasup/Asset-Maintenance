/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialEntry, MaterialIssue, Item, Vendor, Project, Unit, Category } from '../types';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  ClipboardList, 
  Truck, 
  User, 
  Building, 
  Calendar, 
  ShieldAlert, 
  Tag, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface MaterialsProps {
  materialEntries: MaterialEntry[];
  setMaterialEntries: React.Dispatch<React.SetStateAction<MaterialEntry[]>>;
  materialIssues: MaterialIssue[];
  setMaterialIssues: React.Dispatch<React.SetStateAction<MaterialIssue[]>>;
  items: Item[];
  vendors: Vendor[];
  projects: Project[];
  units: Unit[];
  categories: Category[];
  selectedCompanyId: string;
  addAuditLog?: (actionType: string, description: string, metadata?: string) => void;
}

export default function Materials({
  materialEntries, setMaterialEntries,
  materialIssues, setMaterialIssues,
  items,
  vendors,
  projects,
  units,
  categories,
  selectedCompanyId,
  addAuditLog
}: MaterialsProps) {
  // Navigation inside Materials
  const [activeTab, setActiveTab] = useState<'stock' | 'entries' | 'issues'>('stock');

  // Popup / Form states
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Receipt / Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryItemId, setEntryItemId] = useState('');
  const [entryQty, setEntryQty] = useState<number>(0);
  const [entryVendorId, setEntryVendorId] = useState('');
  const [entryChallanNo, setEntryChallanNo] = useState('');
  const [entryProjectId, setEntryProjectId] = useState('');
  const [entryReceivedBy, setEntryReceivedBy] = useState('');
  const [entryRemarks, setEntryRemarks] = useState('');

  // Issue Form State
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [issueItemId, setIssueItemId] = useState('');
  const [issueQty, setIssueQty] = useState<number>(0);
  const [issueToPerson, setIssueToPerson] = useState('');
  const [issueProjectId, setIssueProjectId] = useState('');
  const [issueIssuedBy, setIssueIssuedBy] = useState('');
  const [issueRemarks, setIssueRemarks] = useState('');

  // Filtering projects and vendors based on company context
  const filteredProjects = projects.filter(p => p.companyId === selectedCompanyId);
  
  // All active items in system
  const stockItems = items;

  // Compute live stock levels for each item
  const computeItemStock = (itemId: string) => {
    const received = materialEntries
      .filter(e => e.itemId === itemId && e.companyId === selectedCompanyId)
      .reduce((sum, e) => sum + e.qty, 0);

    const issued = materialIssues
      .filter(i => i.itemId === itemId && i.companyId === selectedCompanyId)
      .reduce((sum, i) => sum + i.qty, 0);

    const balance = received - issued;
    return { received, issued, balance };
  };

  // Handle Material Receipt Submission
  const handleRecordReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryItemId || entryQty <= 0 || !entryVendorId || !entryProjectId) {
      alert('Please fill all mandatory fields with valid values.');
      return;
    }

    const itemObj = items.find(i => i.id === entryItemId);
    const vendorObj = vendors.find(v => v.id === entryVendorId);
    const unitName = itemObj ? units.find(u => u.id === itemObj.unitId)?.name || 'Nos' : 'Nos';

    if (!itemObj || !vendorObj) return;

    const newEntry: MaterialEntry = {
      id: `me-${Date.now()}`,
      itemId: entryItemId,
      itemName: itemObj.name,
      qty: entryQty,
      unit: unitName,
      vendorId: entryVendorId,
      vendorName: vendorObj.companyName,
      challanNo: entryChallanNo || `CH-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedDate: entryDate,
      receivedBy: entryReceivedBy || 'Site Receiver',
      remarks: entryRemarks,
      companyId: selectedCompanyId,
      projectId: entryProjectId
    };

    setMaterialEntries([newEntry, ...materialEntries]);
    if (addAuditLog) {
      addAuditLog(
        'MATERIAL_RECEIVE',
        `Logged raw material stock intake of ${newEntry.qty} ${newEntry.unit} [${newEntry.itemName}] from supplier [${newEntry.vendorName}] at site depot.`,
        `Challan reference: ${newEntry.challanNo} • Receiver: ${newEntry.receivedBy}`
      );
    }
    setShowEntryForm(false);
    
    // Clear state
    setEntryItemId('');
    setEntryQty(0);
    setEntryVendorId('');
    setEntryChallanNo('');
    setEntryProjectId('');
    setEntryReceivedBy('');
    setEntryRemarks('');
  };

  // Handle Material Issue Submission
  const handleIssueMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueItemId || issueQty <= 0 || !issueProjectId || !issueToPerson) {
      alert('Please fill all mandatory fields with valid values.');
      return;
    }

    const { balance } = computeItemStock(issueItemId);
    if (issueQty > balance) {
      alert(`Insufficient Stock! Cannot issue ${issueQty}. Available balance is only ${balance}.`);
      return;
    }

    const itemObj = items.find(i => i.id === issueItemId);
    const unitName = itemObj ? units.find(u => u.id === itemObj.unitId)?.name || 'Nos' : 'Nos';

    if (!itemObj) return;

    const newIssue: MaterialIssue = {
      id: `mi-${Date.now()}`,
      itemId: issueItemId,
      itemName: itemObj.name,
      qty: issueQty,
      unit: unitName,
      issuedToPerson: issueToPerson,
      issuedDate: issueDate,
      issuedBy: issueIssuedBy || 'Store Keeper',
      remarks: issueRemarks,
      companyId: selectedCompanyId,
      projectId: issueProjectId
    };

    setMaterialIssues([newIssue, ...materialIssues]);
    if (addAuditLog) {
      addAuditLog(
        'MATERIAL_ISSUE',
        `Dispatched raw material stock release of ${newIssue.qty} ${newIssue.unit} [${newIssue.itemName}] to field crew supervisor [${newIssue.issuedToPerson}].`,
        `Authorizer: ${newIssue.issuedBy} • Site Segment Project ID: ${newIssue.projectId}`
      );
    }
    setShowIssueForm(false);

    // Clear state
    setIssueItemId('');
    setIssueQty(0);
    setIssueToPerson('');
    setIssueProjectId('');
    setIssueIssuedBy('');
    setIssueRemarks('');
  };

  // Selected item availability for issues
  const selectedIssueItemBalance = issueItemId ? computeItemStock(issueItemId).balance : 0;
  const selectedIssueItemUnit = issueItemId ? (items.find(i => i.id === issueItemId) ? units.find(u => u.id === items.find(i => i.id === issueItemId)?.unitId)?.name || 'Nos' : 'Nos') : '';

  // Filter entry history
  const filteredEntries = materialEntries.filter(entry => {
    if (entry.companyId !== selectedCompanyId) return false;
    if (projectFilter !== 'ALL' && entry.projectId !== projectFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        entry.itemName.toLowerCase().includes(q) ||
        entry.vendorName.toLowerCase().includes(q) ||
        entry.challanNo.toLowerCase().includes(q) ||
        entry.receivedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter issue history
  const filteredIssues = materialIssues.filter(iss => {
    if (iss.companyId !== selectedCompanyId) return false;
    if (projectFilter !== 'ALL' && iss.projectId !== projectFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        iss.itemName.toLowerCase().includes(q) ||
        iss.issuedToPerson.toLowerCase().includes(q) ||
        iss.issuedBy.toLowerCase().includes(q) ||
        iss.remarks.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique materials in stock card calculations
  const monitoredItems = stockItems.filter(item => {
    const { received } = computeItemStock(item.id);
    return received > 0;
  });

  return (
    <div className="space-y-6" id="materials-container">
      
      {/* Upper Brand/Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase block mb-1 font-mono">CONSTRUX MATERIAL DEPOT</span>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">
            Material Flow &amp; <span className="font-semibold text-indigo-600">Stock Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-normal">
            Track incoming consumable materials receipts (GRN/MRN) and contractor project outward issues (MIS) with real-time stock preservation.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setShowEntryForm(true);
              setShowIssueForm(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition"
            id="btn-trigger-material-entry"
          >
            <Plus size={15} /> Record Receipt (Inward)
          </button>
          
          <button
            onClick={() => {
              setShowIssueForm(true);
              setShowEntryForm(false);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition"
            id="btn-trigger-material-issue"
          >
            <Plus size={15} /> Issue Slips (Outward)
          </button>
        </div>
      </div>

      {/* QUICK STATS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {materialEntries.filter(e => e.companyId === selectedCompanyId).length}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Receipt Transactions</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {materialIssues.filter(i => i.companyId === selectedCompanyId).length}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Issue Slips Issued</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
            <Package size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {monitoredItems.length}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Bulk Materials</div>
          </div>
        </div>
      </div>

      {/* MULTI_GRID TRANSACTION MODALS */}
      {showEntryForm && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-6 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest font-mono flex items-center gap-2">
              <Truck size={16} /> Record Material Receipt Note (Good Inward)
            </h3>
            <button 
              onClick={() => setShowEntryForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleRecordReceipt} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Receipt Date*</label>
              <input 
                type="date"
                required
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Material Item*</label>
              <select
                required
                value={entryItemId}
                onChange={e => setEntryItemId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose Item --</option>
                {stockItems.map(it => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Quantity Received*</label>
              <input 
                type="number"
                required
                min="1"
                step="any"
                value={entryQty || ''}
                onChange={e => setEntryQty(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 150"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Supplier / Vendor*</label>
              <select
                required
                value={entryVendorId}
                onChange={e => setEntryVendorId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose Supplier --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Transit Challan / Invoice No.</label>
              <input 
                type="text"
                value={entryChallanNo}
                onChange={e => setEntryChallanNo(e.target.value)}
                placeholder="e.g. CH-238A"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Receiving Project Site*</label>
              <select
                required
                value={entryProjectId}
                onChange={e => setEntryProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose Project --</option>
                {filteredProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Received / Checked By</label>
              <input 
                type="text"
                value={entryReceivedBy}
                onChange={e => setEntryReceivedBy(e.target.value)}
                placeholder="Name of receiver"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Remarks / Storage Location</label>
              <input 
                type="text"
                value={entryRemarks}
                onChange={e => setEntryRemarks(e.target.value)}
                placeholder="Storage room, bay area..."
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-emerald-200/50">
              <button 
                type="button" 
                onClick={() => setShowEntryForm(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <CheckCircle size={14} /> Commit Entry Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {showIssueForm && (
        <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-6 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest font-mono flex items-center gap-2">
              <ClipboardList size={16} /> Issue Material Slip (Stock Outward Dispatch)
            </h3>
            <button 
              onClick={() => setShowIssueForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleIssueMaterial} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Issue Date*</label>
              <input 
                type="date"
                required
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Stocked Material*</label>
              <select
                required
                value={issueItemId}
                onChange={e => setIssueItemId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Item --</option>
                {stockItems.map(it => {
                  const { balance } = computeItemStock(it.id);
                  return (
                    <option key={it.id} value={it.id}>
                      {it.name} (Stock: {balance})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Inward Availability Micro-widget */}
            {issueItemId && (
              <div className="md:col-span-2 p-2.5 bg-white border border-slate-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Currently in Store</span>
                  <span className={`text-sm font-bold ${selectedIssueItemBalance === 0 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                    {selectedIssueItemBalance} {selectedIssueItemUnit}
                  </span>
                </div>
                {selectedIssueItemBalance <= 10 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
                    <ShieldAlert size={14} /> Low Inventory Level
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Quantity to Issue*</label>
              <input 
                type="number"
                required
                min="0.01"
                step="any"
                value={issueQty || ''}
                onChange={e => setIssueQty(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 50"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              {issueItemId && issueQty > selectedIssueItemBalance && (
                <span className="text-[10px] font-bold text-red-500 block">
                  Error: Exceeds available stock limits!
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Issued To (Person / Contractor)*</label>
              <input 
                type="text"
                required
                value={issueToPerson}
                onChange={e => setIssueToPerson(e.target.value)}
                placeholder="e.g. L&T Lead / Rajesh"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Destination Site Project*</label>
              <select
                required
                value={issueProjectId}
                onChange={e => setIssueProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose Project --</option>
                {filteredProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Issued By (Store Keeper)</label>
              <input 
                type="text"
                value={issueIssuedBy}
                onChange={e => setIssueIssuedBy(e.target.value)}
                placeholder="Staff dispatcher name"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Work Phase Remarks</label>
              <input 
                type="text"
                value={issueRemarks}
                onChange={e => setIssueRemarks(e.target.value)}
                placeholder="e.g. Ground slab fabrication grid C"
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-indigo-200/50">
              <button 
                type="button" 
                onClick={() => setShowIssueForm(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={issueQty > selectedIssueItemBalance || issueQty <= 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <CheckCircle size={14} /> Commit Issue Slip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILED MATERIAL INVENTORY BALANCES BOARD */}
      {activeTab === 'stock' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">Live Material Inventory Ledger</h2>
              <p className="text-[11px] text-slate-400">Calculated on-the-fly from inward receipts and outward issue notes.</p>
            </div>
            <div className="bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md">
              Scoping Context: <span className="font-bold text-indigo-600 uppercase">{selectedCompanyId === 'comp-esteem' ? 'ESTEEM' : 'STEELCORP'}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {stockItems.map(item => {
              const { received, issued, balance } = computeItemStock(item.id);
              const unitName = units.find(u => u.id === item.unitId)?.name || 'Nos';
              const catName = categories.find(c => c.id === item.categoryId)?.name || 'Consumables';
              
              if (received === 0 && issued === 0) {
                // To keep ledger clean, show but indicate as Unstocked or display if they exist
              }

              // Visual representation status
              let statusLabel = 'In Stock';
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';

              if (balance === 0) {
                statusLabel = 'Out of Stock';
                badgeColor = 'bg-slate-100 text-slate-500 border-slate-200';
              } else if (balance <= received * 0.15) {
                statusLabel = 'Critical Stock';
                badgeColor = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
              } else if (balance <= received * 0.3) {
                statusLabel = 'Low Stock';
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
              }

              return (
                <div key={item.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 transition duration-150">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2 text-[9px] font-bold font-mono tracking-wider bg-slate-100 text-slate-600 rounded">
                        {catName}
                      </span>
                      <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-400 italic max-w-xl">{item.remarks}</p>
                  </div>

                  {/* Stock Metrics Bar */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 w-full md:w-auto shrink-0 font-mono">
                    
                    <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 min-w-[85px] text-center">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Inward Recd</span>
                      <span className="font-semibold text-emerald-600">+{received} {unitName}</span>
                    </div>

                    <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 min-w-[85px] text-center">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Outward Iss</span>
                      <span className="font-semibold text-indigo-600">-{issued} {unitName}</span>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg min-w-[120px] text-center">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Store Balance</span>
                      <span className={`text-md font-extrabold ${balance === 0 ? 'text-slate-400' : 'text-slate-950'}`}>
                        {balance} {unitName}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECONDARY LEDGERS TABS SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* Navigation bar and filters */}
        <div className="border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="bg-slate-100 p-1.5 rounded-lg flex items-center shrink-0">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition duration-150 ${activeTab === 'stock' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Stock Status Board
            </button>
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition duration-150 ${activeTab === 'entries' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Receipts Ledger ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition duration-150 ${activeTab === 'issues' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Issues Register ({filteredIssues.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
              <input 
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none"
              />
            </div>

            {/* Project Scoping dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
              >
                <option value="ALL">All Project Sites</option>
                {filteredProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LEDGERS SECTIONS DATA VIEW */}
        <div className="p-4 overflow-x-auto">
          {activeTab === 'entries' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase font-bold">
                  <th className="p-3">Received Date</th>
                  <th className="p-3">Material Item</th>
                  <th className="p-3">Qty Recd</th>
                  <th className="p-3">Transit Challan</th>
                  <th className="p-3">Vendor Supplier</th>
                  <th className="p-3">Receiving Site</th>
                  <th className="p-3">Received By</th>
                  <th className="p-3">Remarks / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No material receipts recorded matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => {
                    const matchedProj = projects.find(p => p.id === entry.projectId)?.name || 'Main Yard';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-500 flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          {entry.receivedDate}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{entry.itemName}</td>
                        <td className="p-3 font-mono font-extrabold text-emerald-600">+{entry.qty} {entry.unit}</td>
                        <td className="p-3 font-mono text-slate-600 bg-slate-50/80 px-2 rounded-sm border border-slate-100">{entry.challanNo}</td>
                        <td className="p-3 text-slate-500 flex items-center gap-1">
                          <Building size={11} className="text-slate-400" />
                          <span className="truncate max-w-[150px]" title={entry.vendorName}>{entry.vendorName}</span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-[150px] truncate" title={matchedProj}>{matchedProj}</td>
                        <td className="p-3 text-slate-600 font-medium flex items-center gap-1">
                          <User size={11} className="text-slate-400" />
                          {entry.receivedBy}
                        </td>
                        <td className="p-3 text-slate-400 italic max-w-[150px] truncate">{entry.remarks || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'issues' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase font-bold">
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Material Item</th>
                  <th className="p-3">Qty Issued</th>
                  <th className="p-3">Issued To (Contractor)</th>
                  <th className="p-3">Destination Project Site</th>
                  <th className="p-3">Issued By</th>
                  <th className="p-3">Remarks / Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No material issues recorded matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map(iss => {
                    const matchedProj = projects.find(p => p.id === iss.projectId)?.name || 'Main Yard';
                    return (
                      <tr key={iss.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-500 flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          {iss.issuedDate}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{iss.itemName}</td>
                        <td className="p-3 font-mono font-extrabold text-indigo-600">-{iss.qty} {iss.unit}</td>
                        <td className="p-3 text-slate-600 font-medium">{iss.issuedToPerson}</td>
                        <td className="p-3 text-slate-500 max-w-[170px] truncate" title={matchedProj}>{matchedProj}</td>
                        <td className="p-3 text-slate-600 font-medium flex items-center gap-1">
                          <User size={11} className="text-slate-400" />
                          {iss.issuedBy}
                        </td>
                        <td className="p-3 text-slate-400 italic max-w-[180px] truncate" title={iss.remarks}>{iss.remarks || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'stock' && (
            <div className="p-4 text-center text-slate-400 bg-slate-50/50 rounded-lg">
              <span className="text-xs">Select either <strong>Receipts Ledger</strong> or <strong>Issues Register</strong> tab above to view deep transaction rows, or record new receipts/disbursements.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

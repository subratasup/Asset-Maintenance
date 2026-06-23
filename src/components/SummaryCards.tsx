/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle,
  TrendingDown,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Asset, GRN, MaterialEntry, MaterialIssue, Item } from '../types';

interface SummaryCardsProps {
  assets: Asset[];
  grns: GRN[];
  materialEntries: MaterialEntry[];
  materialIssues: MaterialIssue[];
  items: Item[];
  selectedCompanyId: string;
  onNavigate: (section: string) => void;
}

export default function SummaryCards({
  assets,
  grns,
  materialEntries,
  materialIssues,
  items,
  selectedCompanyId,
  onNavigate
}: SummaryCardsProps) {
  
  // 1. Total Active Assets (scoped to current company)
  const activeAssets = assets.filter(a => a.companyId === selectedCompanyId);
  const totalActiveAssetsCount = activeAssets.length;
  const totalAssetValue = activeAssets.reduce((sum, item) => sum + item.rate, 0);

  // 2. Pending GRNs (un-tagged goods receipts)
  const pendingGRNs = grns.filter(g => !g.isTagged);
  const pendingGRNsCount = pendingGRNs.length;

  // 3. Low-Stock Materials Calculation
  // We inspect items and check if their stock level is low (balance <= 30% of total received and received > 0, or balance === 0)
  const lowStockMaterials = items.map(item => {
    // Inward stock received for active company
    const received = materialEntries
      .filter(e => e.itemId === item.id && e.companyId === selectedCompanyId)
      .reduce((sum, e) => sum + e.qty, 0);

    // Outward stock issued for active company
    const issued = materialIssues
      .filter(mi => mi.itemId === item.id && mi.companyId === selectedCompanyId)
      .reduce((sum, mi) => sum + mi.qty, 0);

    const balance = received - issued;

    return {
      item,
      received,
      issued,
      balance,
    };
  }).filter(({ received, balance }) => {
    // Only care about materials with entries
    if (received === 0) return false;
    // Low stock threshold: <= 30% of inward amount or completely out of stock
    return balance === 0 || balance <= received * 0.3;
  });

  const lowStockCount = lowStockMaterials.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="summary-cards-deck">
      
      {/* CARD 1: ACTIVE ASSETS */}
      <motion.div 
        id="card-summary-active-assets"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registry Node Status</span>
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-indigo-600">
              <Package size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              {totalActiveAssetsCount}
            </h3>
            <p className="text-xs font-semibold text-slate-800 mt-1">Active Tracked Assets</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Consolidated net rate valuation is <strong className="text-slate-700 font-mono">₹{totalAssetValue.toLocaleString('en-IN')}</strong>. All hardware registered to live project yards.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle size={10} /> Live Verification
          </div>
          <button 
            id="link-nav-operations"
            onClick={() => onNavigate('operations')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            Manage Assets <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* CARD 2: PENDING GRNS */}
      <motion.div 
        id="card-summary-pending-grns"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tagging Backlog</span>
            <div className={`p-2.5 rounded-lg ${pendingGRNsCount > 0 ? 'bg-amber-50 border border-amber-100 text-amber-600' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}>
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
                {pendingGRNsCount}
              </h3>
              {pendingGRNsCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                  ACTION REQD
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1">Pending Gate Receipts (GRNs)</p>
            
            {pendingGRNsCount > 0 ? (
              <div className="mt-2 space-y-1.5">
                <p className="text-[11px] text-slate-400 leading-normal">
                  Landed inventory items awaiting individual serializations and physical barcodes printing:
                </p>
                <div className="max-h-20 overflow-y-auto pr-1 space-y-1 border-l-2 border-amber-500 pl-2 py-0.5">
                  {pendingGRNs.map(g => {
                    const itemMatch = items.find(i => i.id === g.itemId);
                    return (
                      <div key={g.id} className="text-[10px] text-slate-600 font-mono flex justify-between gap-1">
                        <span className="truncate max-w-[120px] font-semibold">{itemMatch?.name || 'Item'}</span>
                        <span className="text-slate-400 text-[9px] shrink-0">({g.qty} {g.unit})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                All landing receipts are successfully serialized. Zero barcode queue backlogs detected.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {pendingGRNsCount > 0 ? (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            ) : (
              <ShieldCheck size={12} className="text-emerald-500" />
            )}
            <span className="text-[10px] font-mono font-semibold text-slate-500">
              {pendingGRNsCount > 0 ? 'Barcode Backlog' : 'Queue Healthy'}
            </span>
          </div>
          <button 
            id="link-nav-operations-grn"
            onClick={() => onNavigate('operations')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
          >
            Process Receipts <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* CARD 3: MATERIAL WARNINGS */}
      <motion.div 
        id="card-summary-material-warnings"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulk Inventory Health</span>
            <div className={`p-2.5 rounded-lg ${lowStockCount > 0 ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
                {lowStockCount}
              </h3>
              {lowStockCount > 0 && (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono animate-pulse">
                  LOW STOCK
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1">Material Supply Warnings</p>
            
            {lowStockCount > 0 ? (
              <div className="mt-2 space-y-1.5">
                <p className="text-[11px] text-slate-400 leading-normal">
                  Items with levels below standard safety margins (30% threshold):
                </p>
                <div className="max-h-20 overflow-y-auto pr-1 space-y-1 border-l-2 border-rose-500 pl-2 py-0.5">
                  {lowStockMaterials.map(({ item, balance }) => {
                    const matchedUnitName = items.find(i => i.id === item.id)?.unitId || 'bags';
                    // Human friendly unit string
                    const displayUnit = matchedUnitName === 'unit-bags' ? 'Bags' : matchedUnitName === 'unit-tons' ? 'MT' : 'Nos';
                    return (
                      <div key={item.id} className="text-[10px] text-slate-600 font-mono flex justify-between gap-1">
                        <span className="truncate max-w-[130px] font-semibold text-slate-800">{item.name}</span>
                        <span className="text-rose-600 font-extrabold shrink-0">
                          {balance === 0 ? 'OUT OF STOCK' : `${balance} ${displayUnit}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Bulk construction yard inventory is in healthy compliance, exceeding safety parameters.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${lowStockCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            <span className="text-[10px] font-mono font-semibold text-slate-500">
              {lowStockCount > 0 ? 'Refill Needed' : 'Supplies Adequate'}
            </span>
          </div>
          <button 
            id="link-nav-materials"
            onClick={() => onNavigate('materials')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
          >
            Review Ledgers <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>

    </div>
  );
}

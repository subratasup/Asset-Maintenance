/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Asset, PurchaseOrder, Invoice, AssetReconciliationLog, User } from '../types';
import { 
  Camera, Scan, Shield, AlertCircle, FileText, CheckCircle2, 
  QrCode, Download, ExternalLink, X, Smartphone, Wifi, Battery, 
  RotateCcw, Search, LogOut, Check, Send, AlertTriangle, 
  ListFilter, ClipboardCheck, History, Info, HelpCircle
} from 'lucide-react';
import { generateQRsvg } from '../utils/qr';

interface MobileScannerAppProps {
  currentUser: User;
  onLogout: () => void;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  reconciliations: AssetReconciliationLog[];
  setReconciliations: React.Dispatch<React.SetStateAction<AssetReconciliationLog[]>>;
  selectedCompanyId: string;
  onExitMobileMode?: () => void;
}

type MobileTab = 'camera' | 'checklist' | 'history';

export default function MobileScannerApp({
  currentUser,
  onLogout,
  assets,
  setAssets,
  purchaseOrders,
  invoices,
  reconciliations,
  setReconciliations,
  selectedCompanyId,
  onExitMobileMode
}: MobileScannerAppProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('camera');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile Action Form state
  const [auditStatus, setAuditStatus] = useState<'Verified' | 'Missing' | 'Damaged'>('Verified');
  const [auditRemarks, setAuditRemarks] = useState('');
  const [messageToast, setMessageToast] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Filter scanning assets by selected company (or operator context)
  const mobileAssets = assets.filter(a => a.companyId === selectedCompanyId);
  const matchedPO = purchaseOrders.find(p => p.orderNo === scannedAsset?.poNo);
  const matchedInv = invoices.find(i => i.invoiceNo === scannedAsset?.invoiceNo);

  // Time & Status simulation
  const [currentTime, setCurrentTime] = useState('10:45 AM');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (text: string, type: 'success' | 'info' = 'success') => {
    setMessageToast({ text, type });
    setTimeout(() => setMessageToast(null), 3500);
  };

  const simulateScan = (asset: Asset) => {
    if (isScanning) return;
    setIsScanning(true);
    setScannedAsset(null);
    setAuditRemarks('');
    
    // Simulate mobile camera auto-focus & optical beep
    setTimeout(() => {
      setIsScanning(false);
      setScannedAsset(asset);
      triggerToast(`Successfully read RFID/QR label: ${asset.assetTagNo}`, 'success');
    }, 1200);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const term = searchQuery.trim().toLowerCase();
    const found = mobileAssets.find(a => 
      a.assetTagNo.toLowerCase() === term || 
      a.productSerialNo.toLowerCase() === term ||
      a.itemName.toLowerCase().includes(term)
    );

    if (found) {
      simulateScan(found);
    } else {
      triggerToast(`No asset found matching "${searchQuery}"`, 'info');
    }
  };

  const submitFieldAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAsset) return;

    // Create a new reconciliation entry
    const newLog: AssetReconciliationLog = {
      id: `recon-${Date.now()}`,
      assetTagNo: scannedAsset.assetTagNo,
      assetName: scannedAsset.itemName,
      lastAllottedTo: scannedAsset.allottedToName,
      currentQty: 1,
      reconDate: new Date().toISOString().split('T')[0],
      status: auditStatus,
      remarks: auditRemarks || `Field scanned physical check: Node is ${auditStatus}`,
      auditorName: currentUser.fullName
    };

    // Update reconciliation context state
    setReconciliations(prev => [newLog, ...prev]);

    // Update asset state itself to bind remarks and status context back!
    setAssets(prev => prev.map(a => {
      if (a.id === scannedAsset.id) {
        return {
          ...a,
          remarks: auditRemarks || a.remarks || `Physical audit verified: ${auditStatus}`
        };
      }
      return a;
    }));

    // Trigger success state feedback
    triggerToast(`Logged ${auditStatus} update back to Estm Dispatch!`, 'success');
    
    // Reset form field comments
    setAuditRemarks('');
    
    // Temporarily pulse audited asset indicator in the viewport
    const updated = { ...scannedAsset, remarks: auditRemarks || `Physical audit verified: ${auditStatus}` };
    setScannedAsset(updated);
  };

  // Filter list of checklist assets
  const filteredChecklist = mobileAssets.filter(a => 
    a.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assetTagNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center p-2 sm:p-6 lg:p-8 gap-8 bg-slate-900 border border-slate-950 rounded-3xl text-slate-100 min-h-[85vh] relative overflow-hidden font-sans">
      
      {/* Decorative Matrix Blueprint Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25"></div>

      {/* LEFT COLUMN: Educational instructions & context */}
      <div className="xl:w-2/5 max-w-md space-y-6 z-10 p-4">
        <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          <Smartphone size={13} className="animate-pulse text-fuchsia-500" /> SECURE MOBILE COMPLIANCE APPLICATION
        </div>
        
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Handheld Barcode <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">
            &amp; QR Scanner App
          </span>
        </h2>

        <p className="text-slate-400 text-xs leading-relaxed">
          This simulates the native, site-authorized mobile application deployed exclusively for operating engineers on-site. It gives fast-loading layout information and pushes live physical audit reconciliation remarks directly to the central servers in real-time.
        </p>

        <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-2 text-fuchsia-300 font-extrabold uppercase font-mono tracking-wide">
            <Info size={14} /> Scanner Operator Guide:
          </div>
          <ol className="list-decimal list-inside space-y-2 text-slate-400 mt-1 pl-1">
            <li>Log in as <strong className="text-white">vicky_scanner</strong> to enter this app directly.</li>
            <li>Use the <strong className="text-white">checklists</strong> inside the smartphone screen to simulate pointing a mobile lens at physical tags.</li>
            <li>Log physical verification audits (Verified, Damaged, or Missing) with field comments.</li>
            <li>Verify updates instantly synchronize with the centralized system audit database.</li>
          </ol>
        </div>

        {/* Exit option for ADMIN or previewers */}
        <div className="flex flex-wrap gap-3 pt-2">
          {onExitMobileMode && (
            <button
              onClick={onExitMobileMode}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={13} /> Exit Mobile Simulation
            </button>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={13} /> Log out Operator
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Pixel-perfect Smartphone Mockup */}
      <div className="z-10 relative flex justify-center w-full max-w-[390px] group">
        
        {/* Dynamic shadow effects around native phone scale */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-fuchsia-600/10 to-indigo-600/10 rounded-[55px] blur-2xl opacity-80 group-hover:opacity-100 transition-all duration-700"></div>

        {/* Outer Phone Case Border */}
        <div className="w-[360px] h-[720px] bg-slate-950 border-[6px] border-slate-800 rounded-[48px] shadow-2xl relative flex flex-col overflow-hidden select-none" style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)' }}>
          
          {/* Physical Side Buttons representation */}
          <div className="absolute left-[-9px] top-28 w-[3px] h-10 bg-slate-800 rounded-r-sm"></div>
          <div className="absolute left-[-9px] top-44 w-[3px] h-14 bg-slate-800 rounded-r-sm"></div>
          <div className="absolute left-[-9px] top-60 w-[3px] h-14 bg-slate-800 rounded-r-sm"></div>
          <div className="absolute right-[-9px] top-36 w-[3px] h-16 bg-slate-800 rounded-l-sm"></div>

          {/* Top Speaker Notch Block */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
            {/* Camera Lens Circle */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#111c2e] mr-4 border border-slate-800/40"></span>
            {/* Dynamic speaker grid */}
            <span className="w-10 h-1 bg-slate-900 rounded-full"></span>
          </div>

          {/* INTERNAL PHONE SCREEN CONTAINER (iOS & Android Native Style) */}
          <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col select-none relative pt-6 overflow-hidden">
            
            {/* NATIVE PHONE SYSTEM STATUS BAR */}
            <div className="h-5 px-6 flex justify-between items-center text-[10px] font-sans font-bold tracking-tight text-white/90 shrink-0 z-40 bg-slate-950/20 backdrop-blur-3xs">
              <span className="font-mono">{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] bg-white/10 px-1 py-0.5 rounded font-mono">5G</span>
                <Wifi size={10} className="text-white" />
                <Battery size={11} className="text-white" />
                <span className="text-[8.5px]">94%</span>
              </div>
            </div>

            {/* NATIVE APP CONTAINER */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              
              {/* App Internal Header Badged */}
              <div className="bg-slate-950 px-4 py-3 shrink-0 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center">
                    <Scan size={12} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[7.5px] text-fuchsia-400 block font-mono font-bold tracking-wider uppercase">ESTEEM HANDHELD</span>
                    <h4 className="text-xs font-black tracking-tight text-white">FIELD-SCAN v3.4</h4>
                  </div>
                </div>

                {/* Operator Identity Token */}
                <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-800 rounded-full py-0.5 pl-1.5 pr-2.5">
                  <img src={currentUser.profilePic} alt="pic" className="w-4.5 h-4.5 rounded-full object-cover shrink-0" />
                  <span className="text-[8px] font-extrabold text-slate-300 truncate max-w-[60px]">{currentUser.fullName.split(' ')[0]}</span>
                </div>
              </div>

              {/* MESSAGE METRIC TOAST LAYERS */}
              {messageToast && (
                <div className={`absolute top-2 left-4 right-4 p-2 rounded-xl text-[10px] font-bold z-50 shadow-lg flex items-center gap-1.5 border animate-in slide-in-from-top-4 duration-200 ${
                  messageToast.type === 'success' 
                    ? 'bg-emerald-950/95 border-emerald-500 text-emerald-300' 
                    : 'bg-indigo-950/95 border-indigo-500 text-indigo-300'
                }`}>
                  <CheckCircle2 size={12} className={messageToast.type === 'success' ? 'text-emerald-400' : 'text-indigo-400'} />
                  <span className="flex-1">{messageToast.text}</span>
                </div>
              )}

              {/* APP SCREEN SCROLLER CONTROLLER */}
              <div className="flex-1 overflow-y-auto min-h-0 bg-slate-950">
                
                {/* 1. CAMERA / SCAN TAB */}
                {activeTab === 'camera' && (
                  <div className="p-4 space-y-4">
                    
                    {/* Compact Interactive Camera Viewport */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 p-4 h-44 flex flex-col justify-between shadow-inner">
                      
                      {/* Viewfinder Target corner guides */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-fuchsia-500"></div>
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-fuchsia-500"></div>
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-fuchsia-500"></div>
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-fuchsia-500"></div>

                      <div className="flex justify-between items-start z-10">
                        <span className="text-[8px] bg-slate-950/80 px-2 py-0.5 rounded-full text-slate-350 font-mono flex items-center gap-1 border border-slate-800">
                          <Camera size={8} className="animate-pulse text-rose-500" /> CAMERA ACTIVE [YARD MUMB-1]
                        </span>
                        <span className="text-[8px] bg-fuchsia-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono shadow-xs">
                          OPTICAL
                        </span>
                      </div>

                      {/* Viewport sweep line */}
                      {isScanning && (
                        <div className="absolute left-0 right-0 h-0.5 bg-fuchsia-500/80 shadow-md animate-infinite shadow-fuchsia-400 top-1/2 -translate-y-1/2 z-20"></div>
                      )}

                      {/* Viewfinder target state */}
                      <div className="flex flex-col items-center justify-center my-auto py-1 z-10">
                        {isScanning ? (
                          <div className="text-center space-y-1 text-fuchsia-400 animate-pulse">
                            <Scan size={30} className="animate-spin mx-auto text-fuchsia-400" />
                            <span className="text-[9px] tracking-widest font-mono font-bold block uppercase">DECRIPTING RFID...</span>
                          </div>
                        ) : scannedAsset ? (
                          <div className="text-center space-y-1 text-emerald-400">
                            <CheckCircle2 size={32} className="mx-auto text-emerald-400 animate-bounce" />
                            <span className="text-[9px] font-bold font-mono tracking-wider block uppercase">CODE REGISTERED MATCH</span>
                          </div>
                        ) : (
                          <div className="text-center space-y-1.5 text-slate-400">
                            <QrCode size={28} className="mx-auto text-slate-500 opacity-80" />
                            <p className="text-[9px] font-sans max-w-[200px] leading-tight text-slate-400">
                              Align mobile camera lens with physical asset label QR
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-[7.5px] font-mono text-slate-500 uppercase text-right z-10">
                        LENS DISTORTION: CALIBRATED
                      </div>
                    </div>

                    {/* MANUAL SCAN VIA TEXT OR QUICK CLICKS */}
                    {!scannedAsset && !isScanning && (
                      <div className="space-y-3">
                        <form onSubmit={handleManualSearchSubmit} className="relative">
                          <input
                            type="text"
                            placeholder="Type Tag No / serial to scan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-200 placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-fuchsia-500 transition"
                          />
                          <button
                            type="submit"
                            className="absolute right-2 top-1.5 bg-slate-800 hover:bg-slate-700 text-fuchsia-400 p-1.5 rounded-lg text-[9px] font-bold uppercase transition"
                          >
                            <Search size={10} />
                          </button>
                        </form>

                        {/* Quick Scanner alignment targets */}
                        <div className="space-y-1.5" id="mobile-simulation-trigger-grid">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                            Tap to simulate scan (camera view):
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {mobileAssets.slice(0, 4).map(asset => (
                              <button
                                key={asset.id}
                                onClick={() => simulateScan(asset)}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[8.5px] py-1.5 px-2 rounded-lg text-left truncate block font-bold transition"
                              >
                                🎯 {asset.assetTagNo} ({asset.itemName.split(' ')[0]})
                              </button>
                            ))}
                            {mobileAssets.length === 0 && (
                              <span className="text-[9px] text-slate-500 italic block col-span-2 text-center py-2">
                                No active company assets registered to scan.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DETAILED LEDGER INFORMATION FOR SCANNED QR NODE */}
                    {scannedAsset && (
                      <div className="space-y-3 animate-in fade-in duration-250">
                        
                        {/* QR Head Section */}
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex-1 truncate">
                            <span className="text-[7.5px] font-mono text-fuchsia-400 font-bold block uppercase tracking-wider">VERIFIED DEPLOYED MATRIX</span>
                            <h3 className="text-sm font-extrabold text-white truncate">{scannedAsset.itemName}</h3>
                            <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 block">{scannedAsset.assetTagNo}</span>
                          </div>
                          
                          <div className="bg-white p-1 rounded border border-slate-750 scale-90 shrink-0 select-none">
                            <div dangerouslySetInnerHTML={{ __html: generateQRsvg(scannedAsset.assetTagNo, 40) }} />
                          </div>
                        </div>

                        {/* Complete Database Parameters */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-[9px]">
                          
                          <h4 className="text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                            COMPLETE SCAN DETAILS COPY
                          </h4>

                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-left">
                            
                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Legal Subsidiary</span>
                              <strong className="text-white font-sans text-[8.5px] truncate block">ESTEEM InfraProjects</strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Product S/N (Serial)</span>
                              <strong className="text-white font-mono text-[8.5px] uppercase block truncate">
                                {scannedAsset.productSerialNo || 'NOT RECORDED'}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Landed Purchase Price</span>
                              <strong className="text-emerald-400 font-mono text-[9px] block">
                                ₹{scannedAsset.rate.toLocaleString('en-IN')}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Operating Coordinate</span>
                              <strong className="text-indigo-400 font-bold text-[8.5px] block truncate">
                                {scannedAsset.allottedToName}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Purchase Order</span>
                              <strong className="text-slate-300 font-mono text-[8px] block truncate text-slate-100 flex items-center gap-0.5">
                                <FileText size={8} /> {scannedAsset.poNo}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Invoice Mapped</span>
                              <strong className="text-slate-300 font-mono text-[8px] block truncate text-slate-100 flex items-center gap-0.5">
                                <FileText size={8} /> {scannedAsset.invoiceNo || 'DIRECT DEPLOYED'}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Warranty Span</span>
                              <strong className="text-slate-200 block">
                                {scannedAsset.warrantyMonths} Months Dispatch
                              </strong>
                            </div>

                            <div>
                              <span className="text-[7px] text-slate-500 uppercase tracking-wider block">AMC Contract Cover</span>
                              <strong className="text-amber-400 font-mono block">
                                {scannedAsset.amcPeriodMonths > 0 ? `${scannedAsset.amcPeriodMonths} Months` : 'None'}
                              </strong>
                            </div>

                          </div>

                          <div className="border-t border-slate-800/80 pt-2 text-left">
                            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Central Ledger Field Remarks</span>
                            <span className="text-slate-300 italic text-[8px] block leading-normal mt-0.5">
                              &ldquo;{scannedAsset.remarks || 'No asset field remarks logged.'}&rdquo;
                            </span>
                          </div>

                        </div>

                        {/* INTERACTIVE MOBILE PHYSICAL AUDIT VERIFICATION FORM */}
                        <form onSubmit={submitFieldAudit} className="bg-slate-900 border border-fuchsia-500/20 rounded-xl p-3.5 space-y-3.5">
                          
                          <div className="flex items-center gap-1 pb-1.5 border-b border-slate-800">
                            <ClipboardCheck size={12} className="text-fuchsia-400" />
                            <h4 className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider">
                              Perform Mobile Audit Check
                            </h4>
                          </div>

                          <div className="text-left space-y-1">
                            <label className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider block">
                              Physical Verification Status
                            </label>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setAuditStatus('Verified')}
                                className={`flex-1 py-1 px-1 rounded text-[8px] font-bold transition flex items-center justify-center gap-0.5 ${auditStatus === 'Verified' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                              >
                                Verified
                              </button>
                              <button
                                type="button"
                                onClick={() => setAuditStatus('Damaged')}
                                className={`flex-1 py-1 px-1 rounded text-[8px] font-bold transition flex items-center justify-center gap-0.5 ${auditStatus === 'Damaged' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                              >
                                Damaged
                              </button>
                              <button
                                type="button"
                                onClick={() => setAuditStatus('Missing')}
                                className={`flex-1 py-1 px-1 rounded text-[8px] font-bold transition flex items-center justify-center gap-0.5 ${auditStatus === 'Missing' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                              >
                                Missing
                              </button>
                            </div>
                          </div>

                          <div className="text-left space-y-1">
                            <label className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider block">
                              Operator Field Observations remarks
                            </label>
                            <textarea
                              required
                              value={auditRemarks}
                              onChange={e => setAuditRemarks(e.target.value)}
                              placeholder="Describe actual physically observed state..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[8.5px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500 transition min-h-[44px]"
                            />
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => { setScannedAsset(null); setAuditRemarks(''); }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 text-[8px] font-bold hover:bg-slate-850"
                            >
                              Scan Another
                            </button>
                            
                            <button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-fuchsia-650 to-indigo-650 hover:opacity-90 font-bold text-white rounded-lg py-1.5 text-[8.5px] transition flex items-center justify-center gap-1 shadow-md shadow-fuchsia-950/20"
                            >
                              <Send size={9} /> Submit Audit Record
                            </button>
                          </div>

                        </form>

                      </div>
                    )}

                  </div>
                )}


                {/* 2. INVENTORY CHECKLIST TAB */}
                {activeTab === 'checklist' && (
                  <div className="p-4 space-y-3.5">
                    
                    <div className="text-left">
                      <h4 className="text-[10px] font-bold uppercase text-slate-350 tracking-wider">Yard Inventory Node Checklist</h4>
                      <p className="text-[7.5px] text-slate-500 mt-0.5">Filter of registry nodes allotted to active operations.</p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search checklist nodes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-[9px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
                      />
                      <Search className="absolute left-2.5 top-2 text-slate-550" size={10} />
                    </div>

                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                      {filteredChecklist.map(asset => {
                        // Check if already audited in this session's reconciliations list
                        const isAuditedObj = reconciliations.find(r => r.assetTagNo === asset.assetTagNo);
                        return (
                          <div
                            key={asset.id}
                            onClick={() => simulateScan(asset)}
                            className={`p-2.5 bg-slate-900 hover:bg-slate-850 border rounded-xl text-left transition duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                              isAuditedObj 
                                ? isAuditedObj.status === 'Verified' 
                                  ? 'border-emerald-900/50 bg-emerald-950/5' 
                                  : isAuditedObj.status === 'Damaged'
                                  ? 'border-amber-900/50 bg-amber-950/5'
                                  : 'border-rose-900/50 bg-rose-950/5'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="truncate flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[8px] font-bold text-fuchsia-400">{asset.assetTagNo}</span>
                                <span className="text-[6.5px] text-slate-500 font-mono truncate">{asset.allottedToName}</span>
                              </div>
                              <h4 className="text-[9.5px] font-extrabold text-white truncate mt-0.5">{asset.itemName}</h4>
                              <span className="text-[8px] text-slate-400 block truncate mt-0.5">{asset.remarks || 'No active remarks'}</span>
                            </div>

                            <div className="shrink-0">
                              {isAuditedObj ? (
                                <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isAuditedObj.status === 'Verified' 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' 
                                    : isAuditedObj.status === 'Damaged'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800/30'
                                    : 'bg-rose-950 text-rose-400 border border-rose-800/30'
                                }`}>
                                  {isAuditedObj.status}
                                </span>
                              ) : (
                                <button className="bg-slate-800 hover:bg-fuchsia-950 hover:text-fuchsia-300 text-slate-400 text-[8px] font-bold px-2 py-0.5 rounded-md transition font-sans border border-slate-700/50">
                                  Scan
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {filteredChecklist.length === 0 && (
                        <div className="text-center py-6 text-slate-500 text-[8.5px] italic">
                          No inventory yard assets matched.
                        </div>
                      )}
                    </div>

                  </div>
                )}


                {/* 3. SIMULATOR SESSION AUDIT LOGS */}
                {activeTab === 'history' && (
                  <div className="p-4 space-y-3.5">
                    
                    <div className="text-left flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase text-slate-350 tracking-wider">Mobile Session Checkins</h4>
                        <p className="text-[7.5px] text-slate-500 mt-0.5">Real-time local audits synchronizing to Est Dispatch</p>
                      </div>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                        Count: {reconciliations.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto">
                      {reconciliations.map(log => {
                        const styleClass = log.status === 'Verified' 
                          ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-300' 
                          : log.status === 'Damaged'
                          ? 'border-amber-900/50 bg-amber-950/20 text-amber-300'
                          : 'border-rose-900/50 bg-rose-950/20 text-rose-300';
                          
                        return (
                          <div key={log.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-left text-[9px] text-slate-300 space-y-1 hover:border-slate-750 transition">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-fuchsia-400 font-extrabold">{log.assetTagNo}</span>
                              <span className={`text-[7px] font-mono uppercase font-bold px-1 py-0.2 rounded ${styleClass}`}>
                                {log.status}
                              </span>
                            </div>
                            <strong className="text-white block mt-0.5 truncate">{log.assetName}</strong>
                            <p className="text-[7.5px] text-slate-400 line-clamp-2 italic leading-relaxed">
                              &ldquo;{log.remarks}&rdquo;
                            </p>
                            <div className="flex justify-between items-center pt-1 text-[7px] text-slate-500 font-mono border-t border-slate-850">
                              <span>Checked by: {log.auditorName.split(' ')[0]}</span>
                              <span>{log.reconDate}</span>
                            </div>
                          </div>
                        );
                      })}

                      {reconciliations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-550 space-y-2">
                          <History size={20} className="text-slate-650 opacity-60 animate-pulse" />
                          <p className="text-[8px] font-sans max-w-[180px]">
                            No mobile checklist audits have been completed in this simulation run yet.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

              {/* NATIVE BOTTOM APP NAV BAR */}
              <div className="h-14 bg-slate-950 border-t border-slate-800/80 grid grid-cols-3 shrink-0 py-1 overflow-hidden z-20">
                <button
                  type="button"
                  onClick={() => { setActiveTab('camera'); setSearchQuery(''); }}
                  className={`flex flex-col items-center justify-center font-bold transition-all duration-150 relative cursor-pointer ${activeTab === 'camera' ? 'text-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Camera size={15} />
                  <span className="text-[8.5px] font-medium tracking-tight mt-1">Live Lens</span>
                  {activeTab === 'camera' && (
                    <span className="absolute bottom-0 w-8 h-0.5 bg-fuchsia-400 rounded-full"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('checklist'); setSearchQuery(''); }}
                  className={`flex flex-col items-center justify-center font-bold transition-all duration-150 relative cursor-pointer ${activeTab === 'checklist' ? 'text-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ListFilter size={15} />
                  <span className="text-[8.5px] font-medium tracking-tight mt-1">Checklist</span>
                  {activeTab === 'checklist' && (
                    <span className="absolute bottom-0 w-8 h-0.5 bg-fuchsia-400 rounded-full"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('history'); setSearchQuery(''); }}
                  className={`flex flex-col items-center justify-center font-bold transition-all duration-150 relative cursor-pointer ${activeTab === 'history' ? 'text-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <History size={15} />
                  <span className="text-[8.5px] font-medium tracking-tight mt-1">Audit Logs</span>
                  {activeTab === 'history' && (
                    <span className="absolute bottom-0 w-8 h-0.5 bg-fuchsia-400 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Virtual Home Button Screen bar */}
              <div className="h-1 bg-slate-950 flex justify-center pb-2 shrink-0 z-30">
                <span className="w-24 h-1 bg-white/40 rounded-full hover:bg-white/60 transition cursor-pointer"></span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

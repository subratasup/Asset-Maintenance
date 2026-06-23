/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, PurchaseOrder, Invoice } from '../types';
import { Camera, Scan, Shield, AlertCircle, FileText, CheckCircle2, QrCode, Download, ExternalLink, X } from 'lucide-react';
import { generateQRsvg } from '../utils/qr';

interface ScannerProps {
  assets: Asset[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  selectedCompanyId: string;
}

export default function Scanner({ assets, purchaseOrders, invoices, selectedCompanyId }: ScannerProps) {
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState<'po' | 'invoice' | null>(null);

  // Filter scanning assets by selected company
  const companyAssets = assets.filter(a => a.companyId === selectedCompanyId);

  const simulateScan = (asset: Asset) => {
    setIsScanning(true);
    setScannedAsset(null);
    setTimeout(() => {
      setIsScanning(false);
      setScannedAsset(asset);
    }, 1100);
  };

  const matchedPO = purchaseOrders.find(p => p.orderNo === scannedAsset?.poNo);
  const matchedInv = invoices.find(i => i.invoiceNo === scannedAsset?.invoiceNo);

  return (
    <div className="space-y-6" id="scanner-tab">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Optical Scanning Screen block (Col span 5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between text-white min-h-[480px] relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5">
            <QrCode size={300} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-900/30 px-3 py-1 rounded-full w-fit">
              <Camera size={12} className="animate-pulse" />
              OPTICAL HARDWARE SCANNER SIMULATOR
            </div>
            
            <h3 className="text-base font-bold mt-4 font-sans tracking-tight">Active Camera Focus Stage</h3>
            <p className="text-xs text-slate-400 mt-1">Select an active hardware ledger tag below to simulate a physical camera scan.</p>
          </div>

          {/* Central Target Screen graphics */}
          <div className="my-8 relative h-48 border border-white/10 rounded-xl bg-slate-950/40 flex items-center justify-center overflow-hidden">
            
            {/* Pulsing scanning guide box */}
            <div className="absolute h-36 w-36 border-2 border-dashed border-indigo-500/30 rounded-lg flex items-center justify-center">
              {/* L-Shape Corner anchors */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-500"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-500"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-500"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-500"></div>
              
              {isScanning ? (
                <div className="text-indigo-400 animate-bounce flex flex-col items-center gap-1.5 text-xs font-mono">
                  <Scan size={36} className="animate-spin text-indigo-500" />
                  FOCUSING...
                </div>
              ) : scannedAsset ? (
                <div className="text-emerald-400 flex flex-col items-center gap-1 text-xs font-mono font-bold">
                  <CheckCircle2 size={36} className="text-emerald-500" />
                  MATCH FOUND
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-1.5 text-xs font-mono">
                  <QrCode size={36} className="text-slate-600" />
                  Target QR Label
                </div>
              )}
            </div>

            {/* Scanning light sweeps */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/80 shadow-md animate-infinite shadow-indigo-400 top-1/2 -translate-y-1/2"></div>
            )}
          </div>

          {/* Tag click triggers list */}
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-2">
              Select tag to trigger scanning:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {companyAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => simulateScan(asset)}
                  disabled={isScanning}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold border transition ${scannedAsset?.id === asset.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'}`}
                >
                  {asset.assetTagNo}
                </button>
              ))}
              {companyAssets.length === 0 && (
                <p className="text-xs text-slate-500 italic">No assets available to test scanning. Tag new nodes first.</p>
              )}
            </div>
          </div>

        </div>

        {/* Dynamic Scan result detailed panel conforming to slide 13! (Col span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
          
          {scannedAsset ? (
            <div className="space-y-6">
              
              {/* Header card */}
              <div className="border-b border-slate-100 pb-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SECURE REGISTRY SCAN SUMMARY</span>
                  <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight mt-0.5">Asset Tag No: {scannedAsset.assetTagNo}</h2>
                </div>
                <div
                  className="bg-slate-50 border border-slate-200 p-1.5 rounded"
                  dangerouslySetInnerHTML={{ __html: generateQRsvg(scannedAsset.assetTagNo, 55) }}
                />
              </div>

              {/* PDF Slide 13 specific table list parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">COMPANY SUB-NAME</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">ESTEEM InfraProjects Pvt. Ltd.</span>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Product Serial No (S/N)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block uppercase">{scannedAsset.productSerialNo || 'Manual entry empty'}</span>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Landed Purchase Rate</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">₹{scannedAsset.rate.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Operating Allotment Coordinate</span>
                  <span className="font-extrabold text-indigo-700 text-xs mt-0.5 block uppercase tracking-wide">
                    {scannedAsset.allottedToName}
                  </span>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Purchase Order Mapped</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 text-xs">{scannedAsset.poNo}</span>
                    {matchedPO && (
                      <button
                        onClick={() => setShowModal('po')}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> View PO Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Purchase Invoice No</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 text-xs">{scannedAsset.invoiceNo || 'DIRECT DIRECT'}</span>
                    {matchedInv && (
                      <button
                        onClick={() => setShowModal('invoice')}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> View Invoice Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Warrantee Period</span>
                  <span className="font-semibold text-slate-800 block mt-0.5 font-mono">{scannedAsset.warrantyMonths} Months from dispatch</span>
                </div>

                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">AMC Coverage</span>
                  <span className="font-semibold text-slate-800 block mt-0.5 font-mono">
                    {scannedAsset.amcPeriodMonths > 0 ? `${scannedAsset.amcPeriodMonths} Months Comprehensive` : 'No Active AMC Contract'}
                  </span>
                </div>

                <div className="md:col-span-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Field Operations Remarks</span>
                  <span className="font-normal text-slate-600 mt-1 block italic leading-relaxed">
                    &ldquo;{scannedAsset.remarks || 'No active field remarks logged.'}&rdquo;
                  </span>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full space-y-3">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-full text-slate-400">
                <Scan size={36} className="animate-pulse" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Optical Reader Terminus Idle</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Aim scanner or select any generated asset barcode tag on the left camera simulator panel to pull certified databases on-screen instantaneously.
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
            <span>Security context: CRYPTO INDEXED</span>
            <span>Est. 2026</span>
          </div>

        </div>

      </div>

      {/* DETAILED MODAL OVERLAYS FOR PO & INVOICE ATTACHMENTS */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-150">
            
            <button
              onClick={() => setShowModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={18} />
            </button>

            {showModal === 'po' && matchedPO && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Purchase Order Copy: {matchedPO.orderNo}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Contractor / Vendor</span>
                    <strong className="text-slate-800 block text-xs">{matchedPO.vendorName}</strong>
                    <span className="text-slate-550 block mt-0.5">{matchedPO.vendorAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Contact Person</span>
                      <span className="text-slate-700 font-medium block">{matchedPO.vendorContactPerson}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Mobile / Phone</span>
                      <span className="text-slate-700 font-mono block">{matchedPO.vendorContactNo}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">PO Remarks & Intent</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                      &ldquo;{matchedPO.remarks}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => { alert('Simulated downloading PO certified scan copy.'); setShowModal(null); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download size={13} /> Download PDF Copy
                  </button>
                </div>
              </div>
            )}

            {showModal === 'invoice' && matchedInv && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Tax Invoice copy: {matchedInv.invoiceNo}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Billed By</span>
                    <strong className="text-slate-800 block text-xs">{matchedInv.vendorName}</strong>
                    <span className="text-slate-550 block mt-0.5">{matchedInv.vendorAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Invoice Date</span>
                      <span className="text-slate-700 font-mono block">{matchedInv.invoiceDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Invoice Classification</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold inline-block">
                        {matchedInv.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => { alert('Simulated downloading Tax Invoice scan copy.'); setShowModal(null); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download size={13} /> Download Certified Scan
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

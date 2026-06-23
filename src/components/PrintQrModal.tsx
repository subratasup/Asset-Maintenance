/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset } from '../types';
import { generateQRsvg } from '../utils/qr';
import { Printer, QrCode, X, Settings2, Grid, FileText, CheckSquare, Square, Info, Check } from 'lucide-react';

interface PrintQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  allAssets: Asset[];
  onToggleAssetSelection: (assetId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

type LabelTemplate = 'heavy-duty' | 'avery-sheet' | 'compact-badge';

export default function PrintQrModal({
  isOpen,
  onClose,
  selectedAssets,
  allAssets,
  onToggleAssetSelection,
  onSelectAll,
  onDeselectAll,
}: PrintQrModalProps) {
  const [template, setTemplate] = useState<LabelTemplate>('heavy-duty');
  const [includeCost, setIncludeCost] = useState(true);
  const [includeExpiry, setIncludeExpiry] = useState(true);
  const [includeCompany, setIncludeCompany] = useState(true);
  const [customFooterText, setCustomFooterText] = useState('PROPERTY OF METROTRANSIT • DO NOT REMOVE');
  const [printInitiated, setPrintInitiated] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setPrintInitiated(true);
    // Use a small timeout to let the class and visibility settings apply
    setTimeout(() => {
      window.print();
      setPrintInitiated(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" id="print-qr-modal-container">
      
      {/* Dynamic CSS Print helper styling embedded directly */}
      <style>{`
        @media print {
          /* Hide everything in the document */
          body * {
            visibility: hidden !important;
          }
          /* Show only the targeted printable element and its children */
          #printable-labels-area, #printable-labels-area * {
            visibility: visible !important;
          }
          /* Position printable area at absolute top corner of page */
          #printable-labels-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          /* Standard page setup */
          @page {
            size: auto;
            margin: 0.5cm;
          }
        }
      `}</style>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Corporate Asset QR & Label Generator</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Generate high-fidelity serialized transit-track tags for machinery, tech and rolling stock</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1">
          
          {/* Left panel: Control, selection, template config (5 cols) */}
          <div className="lg:col-span-5 p-5 border-r border-slate-200 flex flex-col overflow-y-auto space-y-5 bg-white">
            
            {/* Step 1: Asset Picker & Registry selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">1. Select Assets to Print ({selectedAssets.length})</span>
                <div className="flex gap-2 text-[9px] font-mono">
                  <button onClick={onSelectAll} className="text-indigo-600 hover:underline">Select All</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={onDeselectAll} className="text-rose-600 hover:underline">Clear</button>
                </div>
              </div>

              {/* Scrollable list of options */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {allAssets.map(asset => {
                  const isChecked = selectedAssets.some(a => a.id === asset.id);
                  return (
                    <div 
                      key={asset.id} 
                      onClick={() => onToggleAssetSelection(asset.id)}
                      className={`flex items-center gap-3 px-3 py-2 text-left cursor-pointer hover:bg-slate-50 transition ${isChecked ? 'bg-indigo-50/20' : ''}`}
                    >
                      <button className="text-slate-400 focus:outline-none">
                        {isChecked ? (
                          <CheckSquare size={15} className="text-indigo-600" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                      <div className="leading-tight truncate flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{asset.itemName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8.5px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1 py-0.25 rounded">{asset.assetTagNo}</span>
                          <span className="text-[8.5px] text-slate-400 truncate">{asset.categoryName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Sticker Template */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">2. Label Layout Template</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* Heavy Duty License */}
                <button
                  onClick={() => setTemplate('heavy-duty')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${template === 'heavy-duty' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-2xs' : 'border-slate-250 hover:bg-slate-50'}`}
                >
                  <FileText className="text-slate-500 mb-1.5" size={18} />
                  <span className="text-[11px] font-bold block">Heavy Duty Tag</span>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">3.5" x 2" Rugged Sticker</span>
                </button>

                {/* Avery 2x10 Sheet */}
                <button
                  onClick={() => setTemplate('avery-sheet')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${template === 'avery-sheet' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-2xs' : 'border-slate-250 hover:bg-slate-50'}`}
                >
                  <Grid className="text-slate-500 mb-1.5" size={18} />
                  <span className="text-[11px] font-bold block">Office Layout</span>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">Avery 5160 double-grid</span>
                </button>

                {/* Compact Barcode sticker */}
                <button
                  onClick={() => setTemplate('compact-badge')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${template === 'compact-badge' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-2xs' : 'border-slate-250 hover:bg-slate-50'}`}
                >
                  <QrCode className="text-slate-500 mb-1.5" size={18} />
                  <span className="text-[11px] font-bold block">Micro Badge</span>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">Compact Tag Strip</span>
                </button>
              </div>
            </div>

            {/* Step 3: Customized Label parameters */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block flex items-center gap-1.5">
                <Settings2 size={12} /> 3. Label Parameter Toggles
              </span>

              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                {/* Include logo */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeCompany} 
                    onChange={e => setIncludeCompany(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>Display Corporate Header</span>
                </label>

                {/* Include Cost */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeCost} 
                    onChange={e => setIncludeCost(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>Show Cost (In Rupees)</span>
                </label>

                {/* Include Warranty */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeExpiry} 
                    onChange={e => setIncludeExpiry(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>Render Warranty expiration bounds</span>
                </label>

                {/* Footer customize text */}
                <div className="pt-2 space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Custom Label Warning Text:</span>
                  <input 
                    type="text" 
                    value={customFooterText}
                    onChange={e => setCustomFooterText(e.target.value)}
                    placeholder="Tampering triggers alert log"
                    className="w-full text-[10px] bg-white border border-slate-250 px-2 py-1 rounded focus:outline-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Printer tips info box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[10.5px] leading-relaxed text-blue-800 flex items-start gap-2">
              <Info className="shrink-0 text-blue-500 mt-0.5 font-bold" size={14} />
              <div className="space-y-1">
                <span className="font-bold block">Professional Tagging Tips</span>
                <p>When printing, enable <strong>"Background graphics"</strong> and set margin limits to <strong>"None"</strong> inside browser system dialogue panels for crisp alignment.</p>
              </div>
            </div>

          </div>

          {/* Right panel: Live Sheet Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-2 mb-4 shrink-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Hardware Sticker Sheet Preview</span>
                <p className="text-[9px] text-slate-400">Scale matches selected Avery alignment template criteria</p>
              </div>

              <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                SCALE: 100%
              </span>
            </div>

            {/* Simulated Sheet Area */}
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              
              {selectedAssets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2 max-w-sm">
                  <div className="h-10 w-10 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-lg">⚠️</div>
                  <h4 className="font-bold text-slate-700 text-xs">No assets linked for printing</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Use the checklist panel on the left to queue equipment nodes for physical label emission.</p>
                </div>
              ) : (
                <div 
                  id="printable-labels-area"
                  className={`bg-white border shadow-md w-full max-w-[530px] p-6 text-slate-900 border-slate-300 font-sans ${
                    template === 'avery-sheet' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
                  }`}
                >
                  {selectedAssets.map((asset, idx) => {
                    
                    // HEAVY DUTY 3.5" x 2" TAG
                    if (template === 'heavy-duty') {
                      return (
                        <div 
                          key={asset.id} 
                          className="border-2 border-slate-900 rounded-xl p-4 flex gap-4 bg-white relative overflow-hidden"
                          style={{ pageBreakInside: 'avoid', minHeight: '144px' }}
                        >
                          {/* Left layout content block */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              {includeCompany && (
                                <div className="text-[8px] font-black uppercase text-slate-400 font-mono tracking-widest mb-1">
                                  ESTEEM TRANSIT LEDGER • SECURED
                                </div>
                              )}
                              <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1 leading-tight uppercase font-mono">{asset.itemName}</h3>
                              <p className="text-[8.5px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">CAT: {asset.categoryName}</p>
                              <p className="text-[8px] text-slate-400 mt-1">Custodian: <strong className="text-slate-600">{asset.allottedToName}</strong></p>
                              
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2 text-[8px] text-slate-400 font-mono">
                                {includeCost && (
                                  <span>COST: ₹<strong>{asset.rate.toLocaleString('en-IN')}</strong></span>
                                )}
                                {includeExpiry && asset.warrantyExpiry && (
                                  <span>WAR: <strong className="text-rose-600">{asset.warrantyExpiry}</strong></span>
                                )}
                              </div>
                            </div>

                            {/* Warning band */}
                            {customFooterText && (
                              <div className="text-[7.5px] font-black font-mono tracking-wider text-rose-700 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 text-center mt-2 truncate">
                                ⚠ {customFooterText}
                              </div>
                            )}
                          </div>

                          {/* Right QR side column */}
                          <div className="shrink-0 flex flex-col justify-center items-center border-l border-dashed border-slate-300 pl-4 w-28">
                            <div 
                              className="w-20 h-20 bg-white"
                              dangerouslySetInnerHTML={{ __html: generateQRsvg(asset.assetTagNo, 80) }}
                            />
                            <span className="text-[10px] font-black font-mono text-slate-900 tracking-wider mt-1.5 block select-all">
                              {asset.assetTagNo}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // AVERY 5160 GRID LAYOUT
                    if (template === 'avery-sheet') {
                      return (
                        <div 
                          key={asset.id} 
                          className="border border-slate-300 rounded p-3 flex gap-2 items-center justify-between text-left bg-white font-mono"
                          style={{ pageBreakInside: 'avoid', height: '110px' }}
                        >
                          <div className="flex-1 min-w-0">
                            {includeCompany && (
                              <div className="text-[7.5px] font-black text-slate-400 select-none block uppercase">ESTEEM METRO</div>
                            )}
                            <h4 className="text-[9px] font-bold text-slate-900 truncate uppercase mt-0.5">{asset.itemName}</h4>
                            <span className="text-[9.5px] font-black text-indigo-700 block mt-1 tracking-wider">{asset.assetTagNo}</span>
                            
                            <div className="text-[7.5px] text-slate-400 mt-1 leading-tight font-sans space-y-0.5">
                              <p className="truncate">Allot: {asset.allottedToName}</p>
                              {includeExpiry && asset.warrantyExpiry && (
                                <p className="text-rose-600">Exp: {asset.warrantyExpiry}</p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-center">
                            <div 
                              className="w-14 h-14"
                              dangerouslySetInnerHTML={{ __html: generateQRsvg(asset.assetTagNo, 56) }}
                            />
                            <span className="text-[6.5px] text-slate-400 uppercase tracking-widest mt-0.5">VERIFIED</span>
                          </div>
                        </div>
                      );
                    }

                    // COMPACT BADGE STRIP
                    return (
                      <div 
                        key={asset.id} 
                        className="border-l-4 border-slate-900 border border-slate-250 p-2.5 flex items-center justify-between bg-white"
                        style={{ pageBreakInside: 'avoid', minHeight: '65px' }}
                      >
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black font-mono text-slate-900 tracking-wider">
                                {asset.assetTagNo}
                              </span>
                              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest shrink-0">
                                {asset.allottedType}
                              </span>
                            </div>
                            <h4 className="text-[10px] font-bold text-slate-700 truncate block font-sans uppercase mt-0.5">{asset.itemName}</h4>
                          </div>
                          
                          {customFooterText && (
                            <span className="text-[6.5px] text-slate-400 uppercase tracking-tight block mt-1 leading-none">{customFooterText}</span>
                          )}
                        </div>

                        <div className="shrink-0 ml-4 flex items-center gap-3">
                          <div className="text-right text-[8px] font-mono text-slate-400 hidden sm:block">
                            <span>GRID: E-22</span><br />
                            <span className="font-bold text-indigo-600">PASS</span>
                          </div>
                          <div 
                            className="w-11 h-11 pointer-events-none"
                            dangerouslySetInnerHTML={{ __html: generateQRsvg(asset.assetTagNo, 44) }}
                          />
                        </div>
                      </div>
                    );

                  })}
                </div>
              )}

            </div>

            {/* Print trigger triggers modal action bar */}
            <div className="mt-5 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="text-left font-sans">
                <span className="text-[10px] text-slate-450 block uppercase tracking-wider font-semibold">Active print job queue</span>
                <span className="text-xs font-black text-slate-800 mt-1 block">
                  {selectedAssets.length} Labels selected of {allAssets.length} database nodes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-xl px-4 py-2 text-xs transition active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={selectedAssets.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 py-2 text-xs transition flex items-center gap-1.5 focus:outline-none shadow-md shadow-indigo-100 disabled:opacity-50 disabled:pointer-events-none active:scale-98"
                >
                  <Printer size={14} />
                  Print Asset Labels
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

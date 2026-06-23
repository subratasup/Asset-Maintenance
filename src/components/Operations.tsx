/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurchaseOrder, Invoice, GRN, Asset, Vendor, Item, Category, Unit, Project } from '../types';
import { FileText, Plus, Shield, CheckCircle2, Ticket, Printer, Eye, Clipboard, ArrowRight, Save, Calendar, Search, FileDown } from 'lucide-react';
import { generateQRsvg } from '../utils/qr';

// Date calculation helper
const calculateExpiryDate = (purchaseDateStr: string, months: number): string => {
  if (!purchaseDateStr) return '';
  const date = new Date(purchaseDateStr);
  if (isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

interface OperationsProps {
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  grns: GRN[];
  setGrns: React.Dispatch<React.SetStateAction<GRN[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  vendors: Vendor[];
  items: Item[];
  categories: Category[];
  units: Unit[];
  projects: Project[];
  selectedCompanyId: string;
  addAuditLog?: (actionType: string, description: string, metadata?: string) => void;
}

type Mode = 'po' | 'invoice' | 'grn' | 'tagging';

export default function Operations({
  purchaseOrders, setPurchaseOrders,
  invoices, setInvoices,
  grns, setGrns,
  assets, setAssets,
  vendors, items, categories, units, projects,
  selectedCompanyId,
  addAuditLog
}: OperationsProps) {
  const [activeMode, setActiveMode] = useState<Mode>('tagging');

  // Multi-Step Tagging Forms State
  const [taggingStep, setTaggingStep] = useState<'p1' | 'p2'>('p1');
  
  // Tagging State (P1 fields)
  const [p1ItemId, setP1ItemId] = useState('');
  const [p1UnitId, setP1UnitId] = useState('');
  const [p1Qty, setP1Qty] = useState(1);
  const [p1Rate, setP1Rate] = useState(0);
  const [p1PurchaseDate, setP1PurchaseDate] = useState('');
  const [p1PoId, setP1PoId] = useState('');
  const [p1InvoiceId, setP1InvoiceId] = useState('');
  const [p1InvoiceDate, setP1InvoiceDate] = useState('');
  const [p1AllottedType, setP1AllottedType] = useState<'Location' | 'Person'>('Location');
  const [p1AllottedLocation, setP1AllottedLocation] = useState('');
  const [p1AllottedName, setP1AllottedName] = useState('');
  const [p1AllottedEmail, setP1AllottedEmail] = useState('');
  const [p1AllottedPhone, setP1AllottedPhone] = useState('');
  const [p1Remarks, setP1Remarks] = useState('');

  // P2 serial items state
  // We will generate an array of row details where row count = p1Qty
  const [p2Rows, setP2Rows] = useState<Array<{
    index: number;
    productSerialNo: string;
    warrantyMonths: number;
    warrantyExpiry: string;
    amcPeriodMonths: number;
    assetTagNo: string;
  }>>([]);

  // Generic forms creation
  const [showPOForm, setShowPOForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showGRNForm, setShowGRNForm] = useState(false);

  // FORM BINDINGS
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poVendorId, setPoVendorId] = useState('');
  const [poRemarks, setPoRemarks] = useState('');

  const [invNo, setInvNo] = useState('');
  const [invDate, setInvDate] = useState('');
  const [invVendorId, setInvVendorId] = useState('');
  const [invType, setInvType] = useState<'Purchase Invoice' | 'AMC Invoice'>('Purchase Invoice');

  const [grnVendorId, setGrnVendorId] = useState('');
  const [grnItemId, setGrnItemId] = useState('');
  const [grnQty, setGrnQty] = useState(1);
  const [grnChallan, setGrnChallan] = useState('');
  const [grnPrice, setGrnPrice] = useState(0);

  // AUTO_FILLS
  const handleVendorSelectForPO = (vendId: string) => {
    setPoVendorId(vendId);
  };

  const handlePOAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const vendorObj = vendors.find(v => v.id === poVendorId);
    if (!vendorObj) return;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNo: poNo,
      orderDate: poDate,
      vendorId: poVendorId,
      vendorName: vendorObj.companyName,
      vendorAddress: `${vendorObj.address}, ${vendorObj.city}, ${vendorObj.state}, PIN: ${vendorObj.pin}`,
      vendorContactPerson: vendorObj.contactPerson,
      vendorContactNo: vendorObj.mobile,
      remarks: poRemarks,
      attachmentName: 'po_attachment_scanned.pdf'
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setShowPOForm(false);
    // Clear
    setPoNo('');
    setPoDate('');
    setPoVendorId('');
    setPoRemarks('');
  };

  const handleInvoiceAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const vendorObj = vendors.find(v => v.id === invVendorId);
    if (!vendorObj) return;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: invNo,
      invoiceDate: invDate,
      vendorId: invVendorId,
      vendorName: vendorObj.companyName,
      vendorAddress: `${vendorObj.address}, ${vendorObj.city}, ${vendorObj.state}, PIN: ${vendorObj.pin}`,
      vendorContactPerson: vendorObj.contactPerson,
      vendorContactNo: vendorObj.mobile,
      attachmentName: 'tax_invoice_approved.pdf',
      type: invType
    };

    setInvoices([newInv, ...invoices]);
    setShowInvoiceForm(false);
    setInvNo('');
    setInvDate('');
    setInvVendorId('');
  };

  const handleGRNAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const itemObj = items.find(i => i.id === grnItemId);
    const unitObj = itemObj ? units.find(u => u.id === itemObj.unitId)?.name : 'Nos';

    const newGRN: GRN = {
      id: `grn-${Date.now()}`,
      grnNo: `ESTM-GRN-2026-${randomSuffix}`,
      dateTime: new Date().toISOString().substring(0, 16),
      vendorId: grnVendorId,
      itemId: grnItemId,
      qty: grnQty,
      unit: unitObj || 'Nos',
      challanNo: grnChallan,
      price: grnPrice,
      attachmentName: 'delivery_slip_signed.pdf',
      isTagged: false
    };

    setGrns([newGRN, ...grns]);
    if (addAuditLog) {
      const matchedItemName = items.find(i => i.id === newGRN.itemId)?.name || 'Generic Material Component';
      const matchedVendor = vendors.find(v => v.id === newGRN.vendorId)?.companyName || 'Verified Supplier';
      addAuditLog(
        'GRN_APPROVAL', 
        `Approved & Authorized GRN #${newGRN.grnNo} for receipt of ${newGRN.qty} ${newGRN.unit} (${matchedItemName}) from vendor ${matchedVendor}.`,
        `Challan No: ${newGRN.challanNo} • Declared Value: ₹${(newGRN.price || 0).toLocaleString('en-IN')}`
      );
    }
    setShowGRNForm(false);
    setGrnVendorId('');
    setGrnItemId('');
    setGrnQty(1);
    setGrnChallan('');
    setGrnPrice(0);
  };

  const executeP1Next = () => {
    // Generate P2 serial listings based on qty
    const suffixStart = Math.floor(10000 + Math.random() * 80000);
    const rows = [];
    const baseDate = p1PurchaseDate || new Date().toISOString().split('T')[0];
    for (let i = 0; i < p1Qty; i++) {
      rows.push({
        index: i,
        productSerialNo: '',
        warrantyMonths: 12,
        warrantyExpiry: calculateExpiryDate(baseDate, 12),
        amcPeriodMonths: 0,
        assetTagNo: `EIP-${suffixStart + i}`
      });
    }
    setP2Rows(rows);
    setTaggingStep('p2');
  };

  const handleP2SaveAll = () => {
    const itemObj = items.find(i => i.id === p1ItemId);
    const catObj = itemObj ? categories.find(c => c.id === itemObj.categoryId) : null;
    const unitObj = units.find(u => u.id === p1UnitId);
    const poObj = purchaseOrders.find(p => p.id === p1PoId);
    const invObj = invoices.find(i => i.id === p1InvoiceId);

    const newAssets: Asset[] = p2Rows.map((row) => ({
      id: `asset-node-${Date.now()}-${row.index}`,
      assetTagNo: row.assetTagNo,
      itemId: p1ItemId,
      itemName: itemObj?.name || 'Unknown item',
      categoryName: catObj?.name || 'General Equipment',
      unit: unitObj?.name || 'Nos',
      rate: p1Rate,
      productSerialNo: row.productSerialNo || `SERIAL-${Math.floor(Math.random() * 900000)}`,
      purchaseDate: p1PurchaseDate || new Date().toISOString().split('T')[0],
      poNo: poObj?.orderNo || 'DIRECT-PROCURE',
      poDate: poObj?.orderDate || '',
      warrantyMonths: row.warrantyMonths,
      warrantyExpiry: row.warrantyExpiry,
      hasOrderCopy: !!poObj,
      amcPeriodMonths: row.amcPeriodMonths,
      invoiceNo: invObj?.invoiceNo || '',
      hasInvoiceCopy: !!invObj,
      allottedType: p1AllottedType,
      allottedToName: p1AllottedType === 'Location' ? p1AllottedLocation : p1AllottedName,
      allottedToEmail: p1AllottedType === 'Person' ? p1AllottedEmail : undefined,
      allottedToPhone: p1AllottedType === 'Person' ? p1AllottedPhone : undefined,
      allottedDate: new Date().toISOString().split('T')[0],
      remarks: p1Remarks,
      companyId: selectedCompanyId,
      projectId: p1AllottedType === 'Location' ? p1AllottedLocation : (projects[0]?.id || '')
    }));

    setAssets([...newAssets, ...assets]);
    
    if (addAuditLog) {
      const parentItemName = itemObj?.name || 'Heavy Equipment';
      addAuditLog(
        'ASSET_TAGGED',
        `Registered & serialized ${newAssets.length} new operational asset nodes of class [${parentItemName}] into system ledger.`,
        `Tags Generated: ${newAssets.map(a => a.assetTagNo).join(', ')}`
      );
    }
    
    // Alert nicely
    alert(`Successfully generated and saved ${p2Rows.length} Tagged Assets with serialized barcode cards.`);
    
    // Clear tagging state
    setP1ItemId('');
    setP1UnitId('');
    setP1Qty(1);
    setP1Rate(0);
    setP1PurchaseDate('');
    setP1PoId('');
    setP1InvoiceId('');
    setP1AllottedLocation('');
    setP1AllottedName('');
    setP1AllottedEmail('');
    setP1AllottedPhone('');
    setTaggingStep('p1');
  };

  return (
    <div className="space-y-6" id="operations-tab">
      
      {/* Tab select headers */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 shadow-xs">
        <button
          onClick={() => setActiveTabAndState('tagging')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeMode === 'tagging' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Shield size={14} /> ASSET TAGGING & SERIALS
        </button>
        <button
          onClick={() => setActiveTabAndState('grn')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeMode === 'grn' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Ticket size={14} /> GOODS RECEIPT NOTE (GRN)
        </button>
        <button
          onClick={() => setActiveTabAndState('po')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeMode === 'po' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <FileText size={14} /> PURCHASE ORDERS (PO)
        </button>
        <button
          onClick={() => setActiveTabAndState('invoice')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeMode === 'invoice' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <FileText size={14} /> INVOICES INCOMING
        </button>
      </div>

      {/* PO OPERATIONS */}
      {activeMode === 'po' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Company Purchase Orders Registry</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Authorizations issued to suppliers</p>
            </div>
            <button
              onClick={() => setShowPOForm(true)}
              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800"
            >
              <Plus size={14} /> Create New PO
            </button>
          </div>

          {showPOForm && (
            <form onSubmit={handlePOAdd} className="bg-slate-50 rounded-xl p-5 border border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purchase Order No</label>
                <input
                  type="text"
                  required
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                  placeholder="e.g. ESTM-PO-2026-604"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Order Date</label>
                <input
                  type="date"
                  required
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Contractor/Vendor</label>
                <select
                  required
                  value={poVendorId}
                  onChange={(e) => handleVendorSelectForPO(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="">-- Choose from Supplier Master --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks & Intent</label>
                <input
                  type="text"
                  value={poRemarks}
                  onChange={(e) => setPoRemarks(e.target.value)}
                  placeholder="e.g. Server AC backup"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowPOForm(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold"
                >
                  Verify & Save PO
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="py-2">PO Serial No</th>
                  <th className="py-2">Order Date</th>
                  <th className="py-2">Contractor Name</th>
                  <th className="py-2">Contract Person</th>
                  <th className="py-2 font-mono">Mobile</th>
                  <th className="py-2 text-right">Attachment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-extrabold text-slate-900">{po.orderNo}</td>
                    <td className="py-3 font-mono">{po.orderDate}</td>
                    <td className="py-3 font-semibold text-slate-800">{po.vendorName}</td>
                    <td className="py-3 font-medium">{po.vendorContactPerson}</td>
                    <td className="py-3 font-mono">{po.vendorContactNo}</td>
                    <td className="py-3 text-right">
                      <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulated: Downloaded associated contract file: ${po.attachmentName}`); }} className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                        <FileDown size={11} /> {po.attachmentName || 'po_copy.pdf'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICES incoming */}
      {activeMode === 'invoice' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inbound Tax Invoice Ledger</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Purchases and Annual Maintenance Contracts (AMC)</p>
            </div>
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800"
            >
              <Plus size={14} /> Register incoming Invoice
            </button>
          </div>

          {showInvoiceForm && (
            <form onSubmit={handleInvoiceAdd} className="bg-slate-50 rounded-xl p-5 border border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice No / Bill Ref</label>
                <input
                  type="text"
                  required
                  value={invNo}
                  onChange={(e) => setInvNo(e.target.value)}
                  placeholder="e.g. TX-DELL-90112"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Supplier</label>
                <select
                  required
                  value={invVendorId}
                  onChange={(e) => setInvVendorId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="">-- Choose from Supplier Master --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice Classification Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700">
                    <input
                      type="radio"
                      name="inv_type"
                      checked={invType === 'Purchase Invoice'}
                      onChange={() => setInvType('Purchase Invoice')}
                    />
                    Purchase Invoice
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700">
                    <input
                      type="radio"
                      name="inv_type"
                      checked={invType === 'AMC Invoice'}
                      onChange={() => setInvType('AMC Invoice')}
                    />
                    AMC Invoice
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold">
                  Save Invoice Mapped
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">
                  <th className="py-2">Invoice No</th>
                  <th className="py-2">Invoice Date</th>
                  <th className="py-2">Supplier Title</th>
                  <th className="py-2 font-mono">Invoice Type</th>
                  <th className="py-2 text-right">Invoice Scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-800">{inv.invoiceNo}</td>
                    <td className="py-3 font-mono">{inv.invoiceDate}</td>
                    <td className="py-3 font-semibold text-slate-800">{inv.vendorName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${inv.type === 'AMC Invoice' ? 'bg-amber-100 text-amber-800 font-mono' : 'bg-emerald-100 text-emerald-800 font-mono'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulated: Downloaded invoice file: ${inv.attachmentName}`); }} className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                        <FileDown size={11} /> {inv.attachmentName || 'invoice_copy.pdf'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRN SECTION */}
      {activeMode === 'grn' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Goods Receipt Note (GRN) Registry</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Hardware parcels arrived physically on yards</p>
            </div>
            <button
              onClick={() => setShowGRNForm(true)}
              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800"
            >
              <Plus size={14} /> Generate Goods Receipt Note (GRN)
            </button>
          </div>

          {showGRNForm && (
            <form onSubmit={handleGRNAdd} className="bg-slate-50 rounded-xl p-5 border border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Supplier</label>
                <select
                  required
                  value={grnVendorId}
                  onChange={(e) => setGrnVendorId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select product landed</label>
                <select
                  required
                  value={grnItemId}
                  onChange={(e) => setGrnItemId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="">-- Choose Registered Product Name --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Received Qty</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={grnQty}
                    onChange={(e) => setGrnQty(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Challan Ref No</label>
                  <input
                    type="text"
                    value={grnChallan}
                    onChange={(e) => setGrnChallan(e.target.value)}
                    placeholder="e.g. CH-O9911"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor Price per Unit (Optional)</label>
                <input
                  type="number"
                  value={grnPrice || ''}
                  onChange={(e) => setGrnPrice(parseInt(e.target.value))}
                  placeholder="₹ Cost"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowGRNForm(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold">
                  Commit GRN Receipt
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="py-2">GRN Number</th>
                  <th className="py-2">Received Date & Time</th>
                  <th className="py-2">Supplier Name</th>
                  <th className="py-2">Landed Item</th>
                  <th className="py-2 font-mono">Arrived Qty</th>
                  <th className="py-2 font-mono">Unit Cost</th>
                  <th className="py-2 text-right">Tagging State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grns.map((grn) => {
                  const vend = vendors.find(v => v.id === grn.vendorId)?.companyName || 'Unknown';
                  const pItem = items.find(i => i.id === grn.itemId)?.name || 'Unknown Item';
                  return (
                    <tr key={grn.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-800">{grn.grnNo}</td>
                      <td className="py-3 font-mono">{grn.dateTime.replace('T', ' ')}</td>
                      <td className="py-3 font-semibold text-slate-900">{vend}</td>
                      <td className="py-3 font-medium text-slate-700">{pItem}</td>
                      <td className="py-3 font-mono font-bold text-indigo-700">{grn.qty} {grn.unit}</td>
                      <td className="py-3 font-mono">₹{(grn.price || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        {grn.isTagged ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Tagged Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => startTaggingFromGRN(grn)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-2.5 py-1 rounded text-[9.5px]"
                          >
                            Generate barcode TAGSs
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSET TAGGING SCREEN (P1-P2) */}
      {activeMode === 'tagging' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Secure QR Barcode tagging & Serial Number assignment
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {taggingStep === 'p1' ? 'Step 1: Specify fleet volume, PO values, and yard allocation' : 'Step 2: Enter individual manufacturer serials/details & print SVG labels'}
              </p>
            </div>
            
            <div className="flex gap-2 text-[10.5px]">
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${taggingStep === 'p1' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                1. General Specifications
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${taggingStep === 'p2' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                2. Serializing Grids
              </span>
            </div>
          </div>

          {/* PAGE 1: SPECIFICATION CAPTURING */}
          {taggingStep === 'p1' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-250">
              
              {/* Product selector block */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest bg-slate-50 p-2 rounded">Hardware Node</h3>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">System Item</label>
                  <select
                    required
                    value={p1ItemId}
                    onChange={(e) => handleItemSelectInTagging(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="">-- Dropdown Search Options --</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Standard Unit</label>
                    <select
                      value={p1UnitId}
                      onChange={(e) => setP1UnitId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">-- Choose Unit --</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Specify Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={p1Qty}
                      onChange={(e) => setP1Qty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Landed Rate (₹ per unit)</label>
                    <input
                      type="number"
                      value={p1Rate || ''}
                      onChange={(e) => setP1Rate(parseInt(e.target.value) || 0)}
                      placeholder="₹ Cost Rate"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Acquisition date</label>
                    <input
                      type="date"
                      value={p1PurchaseDate}
                      onChange={(e) => setP1PurchaseDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Option: Linked PO No</label>
                    <select
                      value={p1PoId}
                      onChange={(e) => setP1PoId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">-- Unlinked Direct Purchase --</option>
                      {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.orderNo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Option: Bill Invoice No</label>
                    <select
                      value={p1InvoiceId}
                      onChange={(e) => setP1InvoiceId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="">-- No Bill Invoice uploaded --</option>
                      {invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNo}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Allocation selection block */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest bg-slate-50 p-2 rounded">Registry Allocation</h3>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Node Assigned Category</label>
                  <div className="flex gap-4 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                      <input
                        type="radio"
                        name="assign_type"
                        checked={p1AllottedType === 'Location'}
                        onChange={() => setP1AllottedType('Location')}
                      />
                      Specific Site / Yard Location
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                      <input
                        type="radio"
                        name="assign_type"
                        checked={p1AllottedType === 'Person'}
                        onChange={() => setP1AllottedType('Person')}
                      />
                      Specific Operating Person
                    </label>
                  </div>
                </div>

                {p1AllottedType === 'Location' ? (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Choose Project Yard Location</label>
                    <select
                      value={p1AllottedLocation}
                      onChange={(e) => setP1AllottedLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      <option value="">-- Select Active Site Mapped --</option>
                      {projects.filter(p => p.companyId === selectedCompanyId).map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.city})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-in slide-in-from-bottom duration-150">
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Responsible Person Full Name</label>
                      <input
                        type="text"
                        required
                        value={p1AllottedName}
                        onChange={(e) => setP1AllottedName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins (Senior Surveyor)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Personal/Corp Email</label>
                        <input
                          type="email"
                          required
                          value={p1AllottedEmail}
                          onChange={(e) => setP1AllottedEmail(e.target.value)}
                          placeholder="sarah@corp.com"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Mobile No</label>
                        <input
                          type="text"
                          required
                          value={p1AllottedPhone}
                          onChange={(e) => setP1AllottedPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Operations Remarks / Ledger Notes</label>
                  <textarea
                    rows={2}
                    value={p1Remarks}
                    onChange={(e) => setP1Remarks(e.target.value)}
                    placeholder="Enter audit logs or maintenance schedule hints."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="pt-4 text-right">
                  <button
                    type="button"
                    onClick={executeP1Next}
                    disabled={!p1ItemId}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ml-auto"
                  >
                    Generate Serial Matrix <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 2: GRID OF PRINTABLE QR CARDS & SERIALS CONFIG */}
          {taggingStep === 'p2' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-700 leading-normal flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sequential Tagging Engines Ready:</strong> Below, enter physical serial tags for each of the <strong>{p1Qty}</strong> arrived units. We have locked safe, auto-generated serials in the central repository database. Check the printable QR layout block on the side.
                </div>
              </div>

              {/* Grid of serial entry rows */}
              <div className="space-y-4">
                {p2Rows.map((row, i) => (
                  <div key={row.index} className="p-4 bg-white border border-slate-150 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* AutoTag indicator */}
                    <div className="md:col-span-2">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Unique Tag No</span>
                      <strong className="text-xs font-mono font-bold text-slate-900 bg-slate-100 border border-slate-250 px-2 py-1 rounded inline-block">
                        {row.assetTagNo}
                      </strong>
                    </div>

                    {/* Manual physical serial configuration */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Product Serial</label>
                      <input
                        type="text"
                        placeholder="e.g. SL-NO-DELL-889A"
                        value={row.productSerialNo}
                        onChange={(e) => {
                          const updated = [...p2Rows];
                          updated[i].productSerialNo = e.target.value;
                          setP2Rows(updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono uppercase"
                      />
                    </div>

                    {/* Warranty Months entry */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Warranty (Mo)</label>
                      <input
                        type="number"
                        min="0"
                        value={row.warrantyMonths}
                        onChange={(e) => {
                          const updated = [...p2Rows];
                          const monthsVal = parseInt(e.target.value) || 0;
                          updated[i].warrantyMonths = monthsVal;
                          updated[i].warrantyExpiry = calculateExpiryDate(p1PurchaseDate || new Date().toISOString().split('T')[0], monthsVal);
                          setP2Rows(updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                      />
                    </div>

                    {/* Warranty Expiry Date Input */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Warranty Expiry</label>
                      <input
                        type="date"
                        value={row.warrantyExpiry}
                        onChange={(e) => {
                          const updated = [...p2Rows];
                          updated[i].warrantyExpiry = e.target.value;
                          setP2Rows(updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* AMC Periods months */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">AMC Period (Mo)</label>
                      <input
                        type="number"
                        min="0"
                        value={row.amcPeriodMonths}
                        onChange={(e) => {
                          const updated = [...p2Rows];
                          updated[i].amcPeriodMonths = parseInt(e.target.value) || 0;
                          setP2Rows(updated);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                      />
                    </div>

                    {/* Barcode labels scan visual frame inside rows */}
                    <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2 md:pt-0">
                      
                      {/* Interactive tag label representation */}
                      <div className="bg-white border border-slate-900 rounded p-2 flex items-center gap-2 select-all shadow-xs w-48 font-sans shrink-0 border-l-4 border-l-indigo-600">
                        <div
                          className="shrink-0"
                          dangerouslySetInnerHTML={{ __html: generateQRsvg(row.assetTagNo, 40) }}
                        />
                        <div className="leading-tight">
                          <h4 className="text-[7.5px] font-mono uppercase text-slate-400">ESTEEM ASSET</h4>
                          <strong className="text-[10px] font-mono block tracking-tight text-slate-900 font-extrabold">{row.assetTagNo}</strong>
                          <span className="text-[6px] text-slate-500 block uppercase truncate w-24">
                            {items.find(it => it.id === p1ItemId)?.name || 'hardware'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadSimulatedLabel(row.assetTagNo)}
                        className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 p-1.5 rounded-lg bg-indigo-50"
                        title="Download Asset Label SVG Card"
                      >
                        <Printer size={13} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Submit Buttons footer */}
              <div className="flex gap-2 justify-end pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaggingStep('p1')}
                  className="px-5 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  &larr; Back to specifications
                </button>
                <button
                  type="button"
                  onClick={handleP2SaveAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs"
                >
                  <Save size={14} /> Commit & Register {p1Qty} Tagged Node(s)
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );

  function setActiveTabAndState(mode: Mode) {
    setActiveMode(mode);
    setTaggingStep('p1');
    setShowPOForm(false);
    setShowInvoiceForm(false);
    setShowGRNForm(false);
  }

  function handleItemSelectInTagging(itemId: string) {
    setP1ItemId(itemId);
    const itemObj = items.find(i => i.id === itemId);
    if (itemObj) {
      setP1UnitId(itemObj.unitId);
    }
  }

  function startTaggingFromGRN(grn: GRN) {
    p1ItemId && handleItemSelectInTagging(grn.itemId);
    setP1ItemId(grn.itemId);
    const itemObj = items.find(i => i.id === grn.itemId);
    if (itemObj) {
      setP1UnitId(itemObj.unitId);
    }
    setP1Qty(grn.qty);
    setP1Rate(grn.price || 0);
    setP1PurchaseDate(grn.dateTime.split('T')[0]);
    // Try to matches in existing PO or create fallback PO
    setP1PoId('');
    setP1InvoiceId('');
    setActiveMode('tagging');
    setTaggingStep('p1');
    
    // Auto-mark tagged state
    setGrns(prev => prev.map(g => g.id === grn.id ? { ...g, isTagged: true } : g));
  }

  function downloadSimulatedLabel(tagNo: string) {
    const text = `
------------------------------------------
   ESTEEM INFRAPROJECTS PVT. LTD.   
------------------------------------------
ASSET TAG NO: ${tagNo}
MFR SERIAL NO: CONFIRMED
SYSTEM REGISTER IDENTIFIER: SECURE TRANSIT
------------------------------------------
    QR TERMINAL TERMINATED TERMINUS
------------------------------------------
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `label_${tagNo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

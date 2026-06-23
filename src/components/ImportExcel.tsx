/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vendor, Item } from '../types';
import { Upload, FileSpreadsheet, CheckCircle2, Clipboard, AlertCircle, RefreshCw } from 'lucide-react';

interface ImportExcelProps {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  categories: any[];
  units: any[];
}

export default function ImportExcel({
  vendors, setVendors,
  items, setItems,
  categories, units
}: ImportExcelProps) {
  const [activeImport, setActiveImport] = useState<'vendor' | 'item'>('vendor');
  const [pasteContent, setPasteContent] = useState('');
  const [parseLog, setParseLog] = useState<string | null>(null);

  const vendorTemplateHeaders = 'COMPANY NAME,ADDRESS,CITY,STATE,PIN,CONTACT PERSON,MOBILE,EMAIL';
  const vendorTemplateData = 'Hindustan Heavy Spares Pvt. Ltd.,104 Industrial Sector 2,Indore,Madhya Pradesh,452015,Alok Kumar,+91 9900224411,sales@hindustanspares.in';

  const itemTemplateHeaders = 'ITEM NAME,CATEGORY ID,UNIT ID,REMOVE REMARKS';
  const itemTemplateData = `Lenovo ThinkPad E14,${categories[0]?.id || 'cat-laptops'},${units[0]?.id || 'unit-nos'},Robust development laptop\nCarrier 2 Ton Cassette AC,${categories[1]?.id || 'cat-ac'},${units[0]?.id || 'unit-nos'},High efficiency ceiling cassette cooling`;

  const handleExcelPasteImport = () => {
    if (!pasteContent.trim()) {
      alert('Please paste some CSV or structured Excel rows first inside the paste target.');
      return;
    }

    try {
      const lines = pasteContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        throw new Error('Paste structure must contain at least a Header row and one Data row.');
      }

      // Quick comma parser supporting quotes escaping basic
      const parseCSVLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase());

      if (activeImport === 'vendor') {
        const required = ['COMPANY NAME', 'ADDRESS', 'CITY', 'STATE', 'PIN', 'CONTACT PERSON', 'MOBILE', 'EMAIL'];
        const missing = required.filter(r => !headers.includes(r));
        if (missing.length > 0) {
          throw new Error(`Invalid predefined format. Missing columns keys: ${missing.join(', ')}`);
        }

        const newVendors: Vendor[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length) continue; // skip incomplete

          // Map values
          const map: any = {};
          headers.forEach((h, idx) => {
            map[h] = values[idx];
          });

          newVendors.push({
            id: `vend-excel-${Date.now()}-${i}`,
            companyName: map['COMPANY NAME'],
            address: map['ADDRESS'],
            city: map['CITY'],
            state: map['STATE'],
            pin: map['PIN'],
            contactPerson: map['CONTACT PERSON'],
            mobile: map['MOBILE'],
            email: map['EMAIL']
          });
        }

        setVendors([...newVendors, ...vendors]);
        setParseLog(`Successfully parsed Excel columns. Merged ${newVendors.length} new Suppliers into Vendor Master database.`);
      } else {
        // Items catalog import
        const required = ['ITEM NAME', 'CATEGORY ID', 'UNIT ID', 'REMOVE REMARKS'];
        const missing = required.filter(r => !headers.includes(r));
        if (missing.length > 0) {
          throw new Error(`Invalid predefined format. Missing columns keys: ${missing.join(', ')}`);
        }

        const newItems: Item[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length) continue;

          const map: any = {};
          headers.forEach((h, idx) => {
            map[h] = values[idx];
          });

          newItems.push({
            id: `item-excel-${Date.now()}-${i}`,
            name: map['ITEM NAME'],
            categoryId: map['CATEGORY ID'],
            unitId: map['UNIT ID'],
            remarks: map['REMOVE REMARKS'] || ''
          });
        }

        setItems([...newItems, ...items]);
        setParseLog(`Successfully parsed Excel columns. Merged ${newItems.length} new structural parts into Items Catalog database.`);
      }

      setPasteContent('');
    } catch (err: any) {
      alert(`Parsing Discrepency: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6" id="import-excel-tab">
      
      {/* Tab toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-2 shadow-xs">
        <button
          onClick={() => { setActiveImport('vendor'); setParseLog(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeImport === 'vendor' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Upload size={14} /> BULK VENDORS IMPORT
        </button>
        <button
          onClick={() => { setActiveImport('item'); setParseLog(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${activeImport === 'item' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Upload size={14} /> BULK ITEMS IMPORT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Instruction details template sidebar (Col span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
            <FileSpreadsheet className="text-indigo-600" size={18} />
            Predefined Excel Column Format Mappings
          </div>
          
          <p className="text-xs text-slate-650 leading-relaxed">
            Double check column header spellings as parsing is strictly case-sensitive. Paste data directly from Excel, CSV sheets or Google Sheets below.
          </p>

          <div className="bg-slate-950 text-slate-300 font-mono text-[10.5px] p-3 rounded border border-slate-900 whitespace-pre overflow-x-auto">
            <span className="text-amber-400 block">// Required Headers Layout:</span>
            {activeImport === 'vendor' ? vendorTemplateHeaders : itemTemplateHeaders}
            <br /><br />
            <span className="text-indigo-400 block">// Sample Row values:</span>
            {activeImport === 'vendor' ? vendorTemplateData : itemTemplateData}
          </div>

          <div className="bg-amber-100/35 border border-amber-200/50 p-3.5 rounded-lg text-xs leading-normal text-amber-900 flex gap-1.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Note on Catalog Codes:</strong> For items catalog upload, use existing Category IDs and Unit IDs to maintain reference safety: <br />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px] font-mono text-slate-600">
                <div>IT: <code className="bg-white border px-1 rounded">cat-laptops</code></div>
                <div>HVAC: <code className="bg-white border px-1 rounded">cat-ac</code></div>
                <div>Countable: <code className="bg-white border px-1 rounded">unit-nos</code></div>
                <div>Bundled: <code className="bg-white border px-1 rounded">unit-sets</code></div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Target text area (Col span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Structured Paste Target Window
            </h3>
            
            <textarea
              rows={11}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={`Paste CSV text copying directly from Excel sheets... \n\ne.g.\n${activeImport === 'vendor' ? `${vendorTemplateHeaders}\n${vendorTemplateData}` : `${itemTemplateHeaders}\n${itemTemplateData}`}`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 items-center justify-between">
            <button
              onClick={() => setPasteContent('')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Clear paste canvas
            </button>
            <button
              onClick={handleExcelPasteImport}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2"
            >
              Parse & Commit XLS Data
            </button>
          </div>

          {parseLog && (
            <div className="p-4 bg-emerald-50 border border-emerald-205 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-in slide-in-from-bottom duration-250 mt-4 leading-normal">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Import Task Completed:</strong> <br />
                {parseLog}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_COMPANIES,
  INITIAL_PROJECTS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_ITEMS,
  INITIAL_VENDORS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INVOICES,
  INITIAL_GRNS,
  INITIAL_ASSETS,
  INITIAL_TRANSFERS,
  INITIAL_RECONCILIATION,
  INITIAL_MATERIAL_ENTRIES,
  INITIAL_MATERIAL_ISSUES,
  INITIAL_AUDIT_LOGS
} from './initialData';

import { Company, Project, User, Category, Unit, Item, Vendor, PurchaseOrder, Invoice, GRN, Asset, AssetTransferLog, AssetReconciliationLog, UserRole, MaterialEntry, MaterialIssue, SystemAuditLog } from './types';

// Importing custom components
import Dashboard from './components/Dashboard';
import Masters from './components/Masters';
import Operations from './components/Operations';
import Materials from './components/Materials';
import Transfers from './components/Transfers';
import Scanner from './components/Scanner';
import ImportExcel from './components/ImportExcel';
import Reports from './components/Reports';
import SecurityGuide from './components/SecurityGuide';
import AiAssistant from './components/AiAssistant';
import LoginPortal from './components/LoginPortal';
import MobileScannerApp from './components/MobileScannerApp';

import {
  Shield,
  LayoutDashboard,
  Tags,
  Wrench,
  ArrowLeftRight,
  Scan,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  ChevronDown,
  Building,
  UserCheck,
  Bot,
  Package,
  LogOut,
  Lock,
  Smartphone
} from 'lucide-react';

export default function App() {
  // PERSISTENCE STORAGE LAYER
  const getStored = <T,>(key: string, initial: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  };

  const [companies, setCompanies] = useState<Company[]>(() => getStored('esteem_companies', INITIAL_COMPANIES));
  const [projects, setProjects] = useState<Project[]>(() => getStored('esteem_projects', INITIAL_PROJECTS));
  const [users, setUsers] = useState<User[]>(() => getStored('esteem_users', INITIAL_USERS));
  const [categories, setCategories] = useState<Category[]>(() => getStored('esteem_categories', INITIAL_CATEGORIES));
  const [units, setUnits] = useState<Unit[]>(() => getStored('esteem_units', INITIAL_UNITS));
  const [items, setItems] = useState<Item[]>(() => getStored('esteem_items', INITIAL_ITEMS));
  const [vendors, setVendors] = useState<Vendor[]>(() => getStored('esteem_vendors', INITIAL_VENDORS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStored('esteem_po', INITIAL_PURCHASE_ORDERS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored('esteem_invoices', INITIAL_INVOICES));
  const [grns, setGrns] = useState<GRN[]>(() => getStored('esteem_grns', INITIAL_GRNS));
  const [assets, setAssets] = useState<Asset[]>(() => getStored('esteem_assets', INITIAL_ASSETS));
  const [transfers, setTransfers] = useState<AssetTransferLog[]>(() => getStored('esteem_transfers', INITIAL_TRANSFERS));
  const [reconciliations, setReconciliations] = useState<AssetReconciliationLog[]>(() => getStored('esteem_recons', INITIAL_RECONCILIATION));
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>(() => getStored('esteem_material_entries', INITIAL_MATERIAL_ENTRIES));
  const [materialIssues, setMaterialIssues] = useState<MaterialIssue[]>(() => getStored('esteem_material_issues', INITIAL_MATERIAL_ISSUES));
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => getStored('esteem_audit_logs', INITIAL_AUDIT_LOGS));

  // AUTHENTICATION AND LOGIN/LOGOUT STATE
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStored<User | null>('esteem_current_user', null));

  // Workspace controls (Company scoping and Assigned Role simulation)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    try {
      const userStr = localStorage.getItem('esteem_current_user');
      if (userStr) {
        const u = JSON.parse(userStr) as User;
        return u.companyId;
      }
    } catch {}
    return 'comp-esteem';
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const userStr = localStorage.getItem('esteem_current_user');
      if (userStr) {
        const u = JSON.parse(userStr) as User;
        return u.role;
      }
    } catch {}
    return 'ADMIN';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [useMobileMock, setUseMobileMock] = useState(false);

  // Sync session changes with core systems
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('esteem_current_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
      setSelectedCompanyId(currentUser.companyId);
    } else {
      localStorage.removeItem('esteem_current_user');
    }
  }, [currentUser]);

  // Backup state to local storage on edits
  useEffect(() => {
    localStorage.setItem('esteem_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('esteem_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('esteem_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('esteem_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('esteem_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('esteem_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('esteem_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('esteem_po', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('esteem_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('esteem_grns', JSON.stringify(grns));
  }, [grns]);

  useEffect(() => {
    localStorage.setItem('esteem_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('esteem_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('esteem_recons', JSON.stringify(reconciliations));
  }, [reconciliations]);

  useEffect(() => {
    localStorage.setItem('esteem_material_entries', JSON.stringify(materialEntries));
  }, [materialEntries]);

  useEffect(() => {
    localStorage.setItem('esteem_material_issues', JSON.stringify(materialIssues));
  }, [materialIssues]);

  useEffect(() => {
    localStorage.setItem('esteem_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (actionType: string, description: string, metadata?: string) => {
    const newLog: SystemAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.fullName || 'System Guest',
      userRole: activeRole,
      actionType,
      description,
      metadata,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
      companyId: selectedCompanyId,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const currentCorpObj = companies.find(c => c.id === selectedCompanyId) || companies[0];

  if (!currentUser) {
    return <LoginPortal users={users} onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // FORCE IMMEDIATELY CONSTRAINED NATIVE MOBILE APP WORKSPACE FOR SCANNERS ONLY!
  if (currentUser.role === 'MOBILE_SCANNER') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-2 sm:p-4 font-sans select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="w-full max-w-5xl z-10">
          <MobileScannerApp
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            assets={assets}
            setAssets={setAssets}
            purchaseOrders={purchaseOrders}
            invoices={invoices}
            reconciliations={reconciliations}
            setReconciliations={setReconciliations}
            selectedCompanyId={selectedCompanyId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans" id="app-root">
      
      {/* Top Universal Corporate Alert Header Bar */}
      <div className="bg-slate-900 text-slate-300 px-6 py-2 text-[11px] font-mono flex flex-col sm:flex-row justify-between items-center gap-1.5 border-b border-slate-950 shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-650 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">SSL ENCRYPTED</span>
          <span className="text-slate-400">SYSTEM GATEWAY COMDISPATCH: PASSES VERIFIED AUDITING CHECKS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Local Time: <span className="text-white font-medium">2026-06-22 14:15 UTC+5:30</span></span>
          <span className="hidden md:inline bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded text-[9px] font-bold">UFW: ARMED</span>
        </div>
      </div>

      {/* Primary Top App Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Branding block */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white"></div>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest font-mono">ESTEEM METROTRANSIT TRANSIT</span>
            <h1 className="text-md font-bold text-slate-800 tracking-tight flex items-center gap-1 font-sans uppercase">
              ESTEEM<span className="font-light text-slate-500 underline decoration-indigo-300">SYSTEMS</span>
            </h1>
          </div>
        </div>

        {/* Global Controls Panel (Company and User session) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Subsidiary Company Scoper selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Building size={14} className="text-indigo-600 shrink-0" />
            <div className="text-left font-sans">
              <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold">Subsidiary Context</span>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active User Session Block */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200" id="header-user-session-node">
              
              {/* Profile Card Summary */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
                <img 
                  src={currentUser.profilePic} 
                  alt={currentUser.fullName} 
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-300"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left leading-none font-sans">
                  <span className="text-[10px] font-extrabold text-slate-900 block truncate max-w-[110px]" title={currentUser.fullName}>
                    {currentUser.fullName}
                  </span>
                  <span className="text-[8.5px] font-mono font-bold text-indigo-600 uppercase tracking-wider block mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Secure Systems Logout Button */}
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTab('dashboard');
                }}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 shadow-2xs cursor-pointer focus:outline-none active:scale-98"
                id="portal-header-logout-btn"
                title="Sign out of Transit gateway"
              >
                <LogOut size={13} className="shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>

            </div>
          )}

        </div>

      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        
        {/* Side navigation bar (Collapsible on mobile) */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 p-6 space-y-8 overflow-y-auto">
          
          <div className="space-y-6">
            
            {/* Context Logo branding card */}
            {currentCorpObj && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center gap-3">
                <img src={currentCorpObj.logo} alt="corp-logo" className="w-9 h-9 object-cover rounded border border-slate-200" />
                <div className="leading-tight shrink-0">
                  <h4 className="text-slate-900 text-[11px] font-bold w-40 truncate">{currentCorpObj.name}</h4>
                  <span className="text-[10px] text-slate-500 block font-mono">{currentCorpObj.city}, {currentCorpObj.state}</span>
                </div>
              </div>
            )}

            {/* Menu groups selectors */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 block px-3 py-1 uppercase mb-2">Core Registers</span>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'dashboard' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'dashboard' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><LayoutDashboard size={14} /> Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('masters')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'masters' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'masters' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Tags size={14} /> Masters Config</span>
              </button>

              <button
                onClick={() => setActiveTab('operations')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'operations' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'operations' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Wrench size={14} /> Operations &amp; Tag</span>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'materials' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'materials' ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Package size={14} /> Materials Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('transfers')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'transfers' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'transfers' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><ArrowLeftRight size={14} /> Dispatch &amp; Audit</span>
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 block px-3 py-1 uppercase font-mono mb-2">Simulators &amp; Tools</span>
              
              <button
                onClick={() => setActiveTab('scanner')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'scanner' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'scanner' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Scan size={14} /> Barcode Scan</span>
              </button>

              <button
                onClick={() => setActiveTab('excel')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'excel' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'excel' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Upload size={14} /> Excel Import</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-semibold rounded-md transition duration-150 ${activeTab === 'reports' ? 'bg-slate-100 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'reports' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><FileSpreadsheet size={14} /> Reports Ledger</span>
              </button>
            </div>

            <div className="space-y-1 border-t border-slate-200 pt-4">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 block px-3 py-1 uppercase font-mono mb-2">Ubuntu VPS Hosting</span>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-bold rounded-md transition duration-150 ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'security' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Shield size={14} /> Security Guide</span>
              </button>

              <button
                onClick={() => setActiveTab('copilot')}
                className={`w-full flex items-center gap-3.5 px-3 py-2 text-xs font-bold rounded-md transition duration-150 ${activeTab === 'copilot' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className={`w-3.5 h-3.5 border-2 shrink-0 transition ${activeTab === 'copilot' ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-300'}`}></span>
                <span className="flex items-center gap-2"><Bot size={14} className="text-indigo-600" /> AI Copilot</span>
              </button>
            </div>

          </div>

          <div className="mt-auto p-4 bg-slate-900 rounded-lg shrink-0">
            <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Server Version</div>
            <div className="text-xs text-white">Ubuntu 22.04 LTS</div>
            <div className="mt-2 w-full bg-slate-700 h-1 rounded-full">
              <div className="bg-indigo-400 h-1 w-2/3 rounded-full"></div>
            </div>
          </div>

        </aside>

        {/* Scrollable Stage Area */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0 bg-slate-50">
          
          {/* Dashboard Panel */}
          {activeTab === 'dashboard' && (
            <Dashboard
              assets={assets}
              setAssets={setAssets}
              companies={companies}
              projects={projects}
              users={users}
              grns={grns}
              materialEntries={materialEntries}
              materialIssues={materialIssues}
              items={items}
              onNavigate={(section) => setActiveTab(section)}
              selectedCompanyId={selectedCompanyId}
            />
          )}

          {/* Masters configuration screen */}
          {activeTab === 'masters' && (
            <Masters
              companies={companies} setCompanies={setCompanies}
              projects={projects} setProjects={setProjects}
              users={users} setUsers={setUsers}
              categories={categories} setCategories={setCategories}
              items={items} setItems={setItems}
              units={units} setUnits={setUnits}
              vendors={vendors} setVendors={setVendors}
              selectedCompanyId={selectedCompanyId}
            />
          )}

          {/* Operations, PO, Invoice, GRN and Asset Tagging sequential flow */}
          {activeTab === 'operations' && (
            <Operations
              purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders}
              invoices={invoices} setInvoices={setInvoices}
              grns={grns} setGrns={setGrns}
              assets={assets} setAssets={setAssets}
              vendors={vendors}
              items={items}
              categories={categories}
              units={units}
              projects={projects}
              selectedCompanyId={selectedCompanyId}
              addAuditLog={addAuditLog}
            />
          )}

          {/* Materials Stock entry and issues ledger */}
          {activeTab === 'materials' && (
            <Materials
              materialEntries={materialEntries} setMaterialEntries={setMaterialEntries}
              materialIssues={materialIssues} setMaterialIssues={setMaterialIssues}
              items={items}
              vendors={vendors}
              projects={projects}
              units={units}
              categories={categories}
              selectedCompanyId={selectedCompanyId}
              addAuditLog={addAuditLog}
            />
          )}

          {/* Asset Transfers & Physical Reconciliation audit logs */}
          {activeTab === 'transfers' && (
            <Transfers
              assets={assets} setAssets={setAssets}
              projects={projects}
              transfers={transfers} setTransfers={setTransfers}
              reconciliations={reconciliations} setReconciliations={setReconciliations}
              selectedCompanyId={selectedCompanyId}
              addAuditLog={addAuditLog}
            />
          )}

          {/* QR/Barcode scanner simulator */}
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              {/* Simulator Switcher Header */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active Hardware Scanner Terminal</h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 font-sans">
                    Switch between the standard Desktop Optical Reader simulation and the dedicated Smartphone handheld app mockup.
                  </p>
                </div>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUseMobileMock(false)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition duration-200 cursor-pointer ${!useMobileMock ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    💻 Desktop Terminus
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMobileMock(true)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition duration-200 cursor-pointer ${useMobileMock ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    📱 Smartphone Handheld App
                  </button>
                </div>
              </div>

              {/* View Rendering */}
              {useMobileMock ? (
                <MobileScannerApp
                  currentUser={currentUser}
                  onLogout={() => {
                    setCurrentUser(null);
                    setActiveTab('dashboard');
                  }}
                  assets={assets}
                  setAssets={setAssets}
                  purchaseOrders={purchaseOrders}
                  invoices={invoices}
                  reconciliations={reconciliations}
                  setReconciliations={setReconciliations}
                  selectedCompanyId={selectedCompanyId}
                  onExitMobileMode={() => setUseMobileMock(false)}
                />
              ) : (
                <Scanner
                  assets={assets}
                  purchaseOrders={purchaseOrders}
                  invoices={invoices}
                  selectedCompanyId={selectedCompanyId}
                />
              )}
            </div>
          )}

          {/* Excel spreadsheet parsing paste and template copy triggers */}
          {activeTab === 'excel' && (
            <ImportExcel
              vendors={vendors} setVendors={setVendors}
              items={items} setItems={setItems}
              categories={categories}
              units={units}
            />
          )}

          {/* Dynamic printable PDF ledger audit sheets with Year-to-Date Straight-Line Depreciation calculations */}
          {activeTab === 'reports' && (
            <Reports
              assets={assets}
              purchaseOrders={purchaseOrders}
              invoices={invoices}
              transfers={transfers}
              reconciliations={reconciliations}
              selectedCompanyId={selectedCompanyId}
              auditLogs={auditLogs}
            />
          )}

          {/* Security Hardening and Domain VPS setup detailed blueprint guides */}
          {activeTab === 'security' && (
            <SecurityGuide />
          )}

          {/* Core Copilot Chat Block */}
          {activeTab === 'copilot' && (
            <AiAssistant
              assets={assets}
              selectedCompanyId={selectedCompanyId}
            />
          )}

        </main>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Company, Project, User, Category, Item, Unit, Vendor, UserRole } from '../types';
import { Plus, Edit2, Trash2, Users, Building, Tags, ShoppingBag, Eye, Save, X, Network } from 'lucide-react';

interface MastersProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  selectedCompanyId: string;
}

type SubTab = 'companies' | 'users' | 'catalog' | 'vendors';

export default function Masters({
  companies, setCompanies,
  projects, setProjects,
  users, setUsers,
  categories, setCategories,
  items, setItems,
  units, setUnits,
  vendors, setVendors,
  selectedCompanyId
}: MastersProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('catalog');

  // Modal / Form trigger states
  const [editingType, setEditingType] = useState<string | null>(null); // e.g. "company", "project", "user", "category", "item", "unit", "vendor"
  const [formData, setFormData] = useState<any>({});
  const [isNewRecord, setIsNewRecord] = useState(true);

  const openForm = (type: string, record: any = null) => {
    setEditingType(type);
    if (record) {
      setFormData(record);
      setIsNewRecord(false);
    } else {
      setFormData({});
      setIsNewRecord(true);
    }
  };

  const closeForm = () => {
    setEditingType(null);
    setFormData({});
  };

  // CRUD actions helper
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = isNewRecord ? `${editingType}-${Date.now()}` : formData.id;
    const dataWithId = { ...formData, id };

    if (editingType === 'company') {
      if (isNewRecord) setCompanies([...companies, dataWithId]);
      else setCompanies(companies.map(c => c.id === id ? dataWithId : c));
    } else if (editingType === 'project') {
      const projData = { ...dataWithId, companyId: formData.companyId || selectedCompanyId };
      if (isNewRecord) setProjects([...projects, projData]);
      else setProjects(projects.map(p => p.id === id ? projData : p));
    } else if (editingType === 'user') {
      const userData = {
        ...dataWithId,
        companyId: formData.companyId || selectedCompanyId,
        allowedProjects: formData.allowedProjects || []
      };
      if (isNewRecord) setUsers([...users, userData]);
      else setUsers(users.map(u => u.id === id ? userData : u));
    } else if (editingType === 'category') {
      if (isNewRecord) setCategories([...categories, dataWithId]);
      else setCategories(categories.map(c => c.id === id ? dataWithId : c));
    } else if (editingType === 'item') {
      if (isNewRecord) setItems([...items, dataWithId]);
      else setItems(items.map(i => i.id === id ? dataWithId : i));
    } else if (editingType === 'unit') {
      if (isNewRecord) setUnits([...units, dataWithId]);
      else setUnits(units.map(u => u.id === id ? dataWithId : u));
    } else if (editingType === 'vendor') {
      if (isNewRecord) setVendors([...vendors, dataWithId]);
      else setVendors(vendors.map(v => v.id === id ? dataWithId : v));
    }

    closeForm();
  };

  const handleDelete = (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} record?`)) return;
    if (type === 'company') setCompanies(companies.filter(c => c.id !== id));
    else if (type === 'project') setProjects(projects.filter(p => p.id !== id));
    else if (type === 'user') setUsers(users.filter(u => u.id !== id));
    else if (type === 'category') setCategories(categories.filter(c => c.id !== id));
    else if (type === 'item') setItems(items.filter(i => i.id !== id));
    else if (type === 'unit') setUnits(units.filter(u => u.id !== id));
    else if (type === 'vendor') setVendors(vendors.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6" id="masters-tab">
      {/* Masters Navigation Subheader */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === 'catalog' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Tags size={14} /> CATEGORIES, ITEMS & UNITS
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === 'companies' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Building size={14} /> COMPANIES & PROJECTS
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={14} /> ROLES & USERS
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === 'vendors' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ShoppingBag size={14} /> VENDORS MASTER
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* CATALOG: Category, Item & Unit Group */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Categories card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Asset Categories</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">With Depreciation configurations</p>
              </div>
              <button onClick={() => openForm('category')} className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg">
                <Plus size={14} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 hover:border-slate-300 transition flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cat.name}</h4>
                    <p className="text-[10px] text-indigo-600 font-medium mt-1">
                      Depreciation: {cat.depreciationRate}% (Eff: {cat.effectiveDate})
                    </p>
                    {cat.remarks && <p className="text-[10px] text-slate-500 italic mt-0.5">&ldquo;{cat.remarks}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openForm('category', cat)} className="text-slate-500 hover:text-slate-800 p-1">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete('category', cat.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 xl:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hardware & Goods Catalog</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Hardware products registered</p>
              </div>
              <button onClick={() => openForm('item')} className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {items.map(item => {
                const cat = categories.find(c => c.id === item.categoryId)?.name || 'Unknown Category';
                const unit = units.find(u => u.id === item.unitId)?.name || 'Nos';
                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 hover:border-slate-300 transition flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Category: {cat} | Stock Unit: {unit}</p>
                      {item.remarks && <p className="text-[10.5px] font-mono text-slate-400 mt-1">{item.remarks}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openForm('item', item)} className="text-slate-500 hover:text-slate-800 p-1">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete('item', item.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Units card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Measurement Units</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Custom countable metrics</p>
              </div>
              <button onClick={() => openForm('unit')} className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {units.map(u => (
                <div key={u.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{u.name}</h4>
                    <span className="text-[10px] text-slate-400">{u.remarks || 'No unit notes'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openForm('unit', u)} className="text-slate-500 hover:text-slate-800 p-1">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete('unit', u.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* COMPANIES & PROJECTS LIST VIEW */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Companies control card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Active Corporate Subsidiaries</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Corporate identity, Tax ID, & Footers</p>
              </div>
              <button onClick={() => openForm('company')} className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
                <Plus size={12} /> New Company
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {companies.map(c => (
                <div key={c.id} className={`p-4 rounded-xl border transition flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${c.id === selectedCompanyId ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <img src={c.logo} alt="corp-logo" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 flex items-center gap-2">
                        {c.name}
                        {c.id === selectedCompanyId && <span className="text-[8px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Current Workspace</span>}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">{c.address}, {c.city}, {c.state}, {c.pin}</p>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px] font-mono text-slate-500">
                        <div>GSTIN: <span className="font-semibold text-slate-700">{c.gstinNo}</span></div>
                        <div>CIN: <span className="font-semibold text-slate-700">{c.cinNo}</span></div>
                        <div>Contact: <span className="font-semibold text-slate-700">{c.contactNo}</span></div>
                        <div>Email: <span className="font-semibold text-slate-700">{c.email}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-end md:self-center">
                    <button onClick={() => openForm('company', c)} className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-200">
                      <Edit2 size={13} />
                    </button>
                    {companies.length > 1 && (
                      <button onClick={() => handleDelete('company', c.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects control card (associated with Company) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Transit Projects & Works</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Locations mapped under active companies</p>
              </div>
              <button onClick={() => openForm('project')} className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
                <Plus size={12} /> New Project
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {projects.map(p => {
                const associatedComp = companies.find(c => c.id === p.companyId)?.name || 'Unknown Subsidiary';
                return (
                  <div key={p.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Network size={12} className="text-indigo-500" />
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-indigo-700 font-semibold mt-1">Company: {associatedComp}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Yard Location: {p.address}, {p.city}, {p.state}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openForm('project', p)} className="text-slate-500 hover:text-slate-800 p-1">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete('project', p.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ROLES & USERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Security & Access Management (Roles & Users)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Assign users to security clearance roles with scoped project allowances</p>
            </div>
            <button onClick={() => openForm('user')} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
              <Plus size={12} /> Register Team Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {users.map(u => {
              const assignedCorp = companies.find(c => c.id === u.companyId)?.name || 'Unknown Subsidiary';
              const projectNames = projects.filter(p => u.allowedProjects?.includes(p.id)).map(p => p.name).join(', ');
              
              return (
                <div key={u.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3 justify-between hover:shadow-xs transition">
                  <div className="flex gap-3">
                    <img src={u.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'} alt="pic" className="w-12 h-12 rounded-full border border-slate-250 bg-white object-cover shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 whitespace-nowrap">{u.fullName} ({u.username})</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Email: {u.email} | Mobile: {u.mobile}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[8px] bg-slate-900 text-slate-100 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          ROLE: {u.role}
                        </span>
                        <span className="text-[8.5px] bg-indigo-50 border border-indigo-200 text-indigo-800 px-2.5 py-0.5 rounded font-medium">
                          Subsidiary: {assignedCorp}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                        Allowed Yards: <span className="font-medium text-slate-600">{projectNames || 'None assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openForm('user', u)} className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-200">
                      <Edit2 size={13} />
                    </button>
                    {users.length > 1 && (
                      <button onClick={() => handleDelete('user', u.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VENDORS */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Vendor & Contractor Directory</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Directly pulled during PO procurement and GRN invoicing.</p>
            </div>
            <button onClick={() => openForm('vendor')} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
              <Plus size={12} /> Add New Supplier
            </button>
          </div>

          <div className="overflow-x-auto text-xs text-slate-600">
            <table className="w-full text-left border-collapse" id="vendors-master-table">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  <th className="py-2">Company Name</th>
                  <th className="py-2">Contact Person</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Mobile</th>
                  <th className="py-2">Location</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{v.companyName}</td>
                    <td className="py-3 font-semibold text-slate-800">{v.contactPerson}</td>
                    <td className="py-3 font-mono text-slate-500">{v.email}</td>
                    <td className="py-3 font-mono text-slate-500">{v.mobile}</td>
                    <td className="py-3 text-slate-500">{v.city}, {v.state} (PIN: {v.pin})</td>
                    <td className="py-3 text-right space-x-1 shrink-0">
                      <button onClick={() => openForm('vendor', v)} className="text-slate-400 hover:text-slate-800 p-1">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete('vendor', v.id)} className="text-red-400 hover:text-red-700 p-1">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DYNAMIC MASTER EDIT MODAL */}
      {editingType && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm capitalize">
                {isNewRecord ? 'Create' : 'Edit'} {editingType} Form
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              
              {/* COMPANY FIELDS */}
              {editingType === 'company' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Company Legal Name</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">GSTIN NO</label>
                      <input type="text" required value={formData.gstinNo || ''} onChange={e => setFormData({ ...formData, gstinNo: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">CIN NO</label>
                      <input type="text" required value={formData.cinNo || ''} onChange={e => setFormData({ ...formData, cinNo: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Complete Address</label>
                    <input type="text" required value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
                      <input type="text" required value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">State</label>
                      <input type="text" required value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">PIN Code</label>
                      <input type="text" required value={formData.pin || ''} onChange={e => setFormData({ ...formData, pin: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Country</label>
                      <input type="text" required value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact No</label>
                      <input type="text" required value={formData.contactNo || ''} onChange={e => setFormData({ ...formData, contactNo: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Corporate Email</label>
                      <input type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Logo URL (Preview)</label>
                    <input type="text" value={formData.logo || ''} onChange={e => setFormData({ ...formData, logo: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Footer Note (Appends to print labels)</label>
                    <input type="text" value={formData.footerNote || ''} onChange={e => setFormData({ ...formData, footerNote: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" placeholder="e.g. ESTEEM HIGH-SECURITY INDUSTRIAL TRANSIT REGISTER" />
                  </div>
                </>
              )}

              {/* PROJECT FIELDS */}
              {editingType === 'project' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Transit Project Name</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Subsidiary Mapped to</label>
                    <select required value={formData.companyId || selectedCompanyId} onChange={e => setFormData({ ...formData, companyId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Site Office Yard Address</label>
                    <input type="text" required value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
                      <input type="text" required value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">State</label>
                      <input type="text" required value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                </>
              )}

              {/* CATEGORY FIELDS */}
              {editingType === 'category' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category Title</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Depreciation %</label>
                      <input type="number" required value={formData.depreciationRate || ''} onChange={e => setFormData({ ...formData, depreciationRate: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" placeholder="e.g. 15 for 15%" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Effective Scaling Date</label>
                      <input type="date" required value={formData.effectiveDate || ''} onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Remarks</label>
                    <input type="text" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                </>
              )}

              {/* ITEM FIELDS */}
              {editingType === 'item' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Item Title</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" placeholder="e.g. DELL Latitude LAP-220" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Link Category</label>
                      <select required value={formData.categoryId || (categories[0]?.id || '')} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Link Unit</label>
                      <select required value={formData.unitId || (units[0]?.id || '')} onChange={e => setFormData({ ...formData, unitId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Specs & Remarks</label>
                    <input type="text" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                </>
              )}

              {/* UNIT FIELDS */}
              {editingType === 'unit' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Unit Symbol</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" placeholder="e.g. Nos, Sets, Coils" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Remarks</label>
                    <input type="text" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                </>
              )}

              {/* USER FIELDS */}
              {editingType === 'user' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Username</label>
                      <input type="text" required value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                      <input type="text" required value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Id</label>
                      <input type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile No</label>
                      <input type="text" required value={formData.mobile || ''} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                      <input type="password" required value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Security Role</label>
                      <select required value={formData.role || 'DATA_ENTRY'} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase font-mono">
                        <option value="ADMIN">ADMIN</option>
                        <option value="AUDITOR">AUDITOR</option>
                        <option value="DATA_ENTRY">DATA ENTRY</option>
                        <option value="MANAGEMENT">MANAGEMENT</option>
                        <option value="MOBILE_SCANNER">MOBILE SCANNER</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Company Scope</label>
                    <select required value={formData.companyId || selectedCompanyId} onChange={e => setFormData({ ...formData, companyId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* VENDOR FIELDS */}
              {editingType === 'vendor' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Vendor Company Name</label>
                    <input type="text" required value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Address Location</label>
                    <input type="text" required value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
                      <input type="text" required value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">State</label>
                      <input type="text" required value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">PIN Code</label>
                      <input type="text" required value={formData.pin || ''} onChange={e => setFormData({ ...formData, pin: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile No</label>
                      <input type="text" required value={formData.mobile || ''} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Person Name</label>
                      <input type="text" required value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Email</label>
                      <input type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="bg-slate-900 font-extrabold hover:bg-slate-800 text-white px-5 py-1.5 rounded-lg text-xs flex items-center gap-2">
                  <Save size={14} /> Save Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

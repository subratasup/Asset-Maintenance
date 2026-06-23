/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, Project, User, Category, Unit, Item, Vendor, PurchaseOrder, Invoice, GRN, Asset, AssetTransferLog, AssetReconciliationLog, MaterialEntry, MaterialIssue, SystemAuditLog } from './types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-esteem',
    name: 'ESTEEM InfraProjects Pvt. Ltd.',
    address: '401-405, Pride Silicon Plaza, Senapati Bapat Road',
    city: 'Pune',
    state: 'Maharashtra',
    pin: '411016',
    country: 'India',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop',
    gstinNo: '27AAECE1234A1Z5',
    cinNo: 'U45202PN2015PTC123456',
    contactNo: '+91 20 40123456',
    email: 'info@esteeminfra.com',
    footerNote: 'ESTEEM HIGH-SECURITY INDUSTRIAL TRANSIT REGISTER'
  },
  {
    id: 'comp-steelcorp',
    name: 'STEELCORP Constructions Ltd.',
    address: 'Plot No. 12, Industrial Area, Sector 4',
    city: 'Gurugram',
    state: 'Haryana',
    pin: '122001',
    country: 'India',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop',
    gstinNo: '06AACCS9876C2Z3',
    cinNo: 'U27100HR2010PLC987654',
    contactNo: '+91 124 5098765',
    email: 'assets@steelcorp.com',
    footerNote: 'STEELCORP HEAVY INDUSTRIES ASSET DIRECTORY'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-esteem-mumbai',
    name: 'Mumbai Metro Phase 3 Line 3',
    address: 'Colaba-Bandit-SEEPZ Transit Yard',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400005',
    country: 'India',
    companyId: 'comp-esteem'
  },
  {
    id: 'proj-esteem-highway',
    name: 'Delhi-Mumbai Express Highway Corridor B',
    address: 'Sohna Entry Toll Complex Yard',
    city: 'Sohna',
    state: 'Haryana',
    pin: '122103',
    country: 'India',
    companyId: 'comp-esteem'
  },
  {
    id: 'proj-steelcorp-yard',
    name: 'Mega Blast Furnace Structural Expansion',
    address: 'Steel Plant Road Ground Site 2',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    pin: '831001',
    country: 'India',
    companyId: 'comp-steelcorp'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-vicky',
    username: 'vicky_admin',
    fullName: 'Vicky Kumar',
    email: 'vickymrspblue@gmail.com',
    mobile: '+91 9876543210',
    role: 'ADMIN',
    companyId: 'comp-esteem',
    allowedProjects: ['proj-esteem-mumbai', 'proj-esteem-highway', 'proj-steelcorp-yard'],
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'user-scanner',
    username: 'vicky_scanner',
    fullName: 'Vicky Scan Operator',
    email: 'scanner.vicky@esteem.com',
    mobile: '+91 9102938475',
    role: 'MOBILE_SCANNER',
    companyId: 'comp-esteem',
    allowedProjects: ['proj-esteem-mumbai'],
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop'
  },
  {
    id: 'user-sam',
    username: 'sam_auditor',
    fullName: 'Samuel D Souza',
    email: 'samuel@esteem.com',
    mobile: '+91 8888884422',
    role: 'AUDITOR',
    companyId: 'comp-esteem',
    allowedProjects: ['proj-esteem-mumbai', 'proj-esteem-highway'],
    profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2670&auto=format&fit=crop'
  },
  {
    id: 'user-priya',
    username: 'priya_entry',
    fullName: 'Priya Sharma',
    email: 'priya@esteem.com',
    mobile: '+91 7777666655',
    role: 'DATA_ENTRY',
    companyId: 'comp-esteem',
    allowedProjects: ['proj-esteem-mumbai'],
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'
  },
  {
    id: 'user-anil',
    username: 'anil_manager',
    fullName: 'Anil Deshmukh',
    email: 'anil@esteem.com',
    mobile: '+91 9991112223',
    role: 'MANAGEMENT',
    companyId: 'comp-steelcorp',
    allowedProjects: ['proj-steelcorp-yard'],
    profilePic: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=2680&auto=format&fit=crop'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-laptops',
    name: 'IT Equipment & Laptops',
    depreciationRate: 40,
    effectiveDate: '2025-04-01',
    remarks: 'Higher wear and obsolescence factor'
  },
  {
    id: 'cat-ac',
    name: 'HVAC & Air Conditioners',
    depreciationRate: 15,
    effectiveDate: '2024-04-01',
    remarks: 'Office and server room climate control systems'
  },
  {
    id: 'cat-generators',
    name: 'Heavy Diesel Power Generators',
    depreciationRate: 15,
    effectiveDate: '2023-04-01',
    remarks: 'Core transit yard power machinery'
  },
  {
    id: 'cat-precision',
    name: 'Precision Survey Tools',
    depreciationRate: 20,
    effectiveDate: '2025-04-01',
    remarks: 'Theodolites, leveling stations, total GPS gear'
  },
  {
    id: 'cat-materials',
    name: 'Bulk Construction Materials',
    depreciationRate: 0,
    effectiveDate: '2026-01-01',
    remarks: 'Consumable materials managed by quantity ledger, no individual tags required'
  }
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unit-nos', name: 'Nos', remarks: 'Individual countable products' },
  { id: 'unit-sets', name: 'Sets', remarks: 'Bundled group products' },
  { id: 'unit-meters', name: 'Meters', remarks: 'Linear measurement' },
  { id: 'unit-boxes', name: 'Boxes', remarks: 'Bulk master carton units' },
  { id: 'unit-bags', name: 'Bags', remarks: 'Standard cement paper bags (50kg)' },
  { id: 'unit-tons', name: 'Metric Tons (MT)', remarks: 'Weight based material sizing' }
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-dell-lat',
    name: 'DELL Latitude 5420 Laptop i7 16GB',
    categoryId: 'cat-laptops',
    unitId: 'unit-nos',
    remarks: 'Corporate executive workhorse computing device'
  },
  {
    id: 'item-voltas-split',
    name: 'Voltas 2.0 Ton 5-Star Commercial Split AC',
    categoryId: 'cat-ac',
    unitId: 'unit-nos',
    remarks: 'Inverter heavy cooling outdoor/indoor component'
  },
  {
    id: 'item-honda-gen',
    name: 'Honda EX5500 Silent Diesel Generator',
    categoryId: 'cat-generators',
    unitId: 'unit-nos',
    remarks: 'Backup 5.5 kVA portable power source'
  },
  {
    id: 'item-sokkia-geo',
    name: 'Sokkia DX-200 Precision Theodolite Survey Gear',
    categoryId: 'cat-precision',
    unitId: 'unit-sets',
    remarks: 'Highly sensitive ground leveling optic item'
  },
  {
    id: 'item-cement',
    name: 'OPC 53 Grade Ultratech Cement',
    categoryId: 'cat-materials',
    unitId: 'unit-bags',
    remarks: 'Ordinary Portland Cement for premium structural mix Design Mix M40'
  },
  {
    id: 'item-steel',
    name: 'Fe550 TMT Steel Bars 12mm',
    categoryId: 'cat-materials',
    unitId: 'unit-tons',
    remarks: 'High strength thermo-mechanically treated reinforcement rebar steel wires'
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vend-dell',
    companyName: 'Dell Technology India Solutions',
    address: 'Tower B, Cyber City Office Park, Phase III',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560001',
    contactPerson: 'Rohan Nambiar',
    mobile: '+91 9448821033',
    email: 'rohan.nambiar@dellsolutions.in'
  },
  {
    id: 'vend-voltas',
    companyName: 'Voltas Industrial AC Enterprise',
    address: 'Shastri Nagar Industrial Estate Ext 4',
    city: 'Jaipur',
    state: 'Rajasthan',
    pin: '302016',
    contactPerson: 'Suresh Singhania',
    mobile: '+91 9829011223',
    email: 'suresh@voltasindustrial.com'
  },
  {
    id: 'vend-honda',
    companyName: 'Gupta Power Equipment Plaza',
    address: 'C-72, Phase-2 New Okhla Block',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pin: '201305',
    contactPerson: 'Mehul Gupta',
    mobile: '+91 9911225544',
    email: 'sales@guptapowerplaza.co.in'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    orderNo: 'ESTM-PO-2026-601',
    orderDate: '2026-05-10',
    vendorId: 'vend-dell',
    vendorName: 'Dell Technology India Solutions',
    vendorAddress: 'Tower B, Cyber City Office Park, Phase III, Bengaluru, Karnataka, PIN: 560001',
    vendorContactPerson: 'Rohan Nambiar',
    vendorContactNo: '+91 9448821033',
    attachmentName: 'po_dell_latitude_approved.pdf',
    remarks: 'Procuring high priority laptops for Mumbai Metro transit workspace engineers.'
  },
  {
    id: 'po-102',
    orderNo: 'ESTM-PO-2026-602',
    orderDate: '2026-05-18',
    vendorId: 'vend-voltas',
    vendorName: 'Voltas Industrial AC Enterprise',
    vendorAddress: 'Shastri Nagar Industrial Estate Ext 4, Jaipur, Rajasthan, PIN: 302016',
    vendorContactPerson: 'Suresh Singhania',
    vendorContactNo: '+91 9829011223',
    attachmentName: 'po_ac_office.pdf',
    remarks: 'Server cooling backup requirements.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNo: 'DELL-INV-88912',
    invoiceDate: '2026-05-25',
    vendorId: 'vend-dell',
    vendorName: 'Dell Technology India Solutions',
    vendorAddress: 'Tower B, Cyber City Office Park, Phase III, Bengaluru, Karnataka, PIN: 560001',
    vendorContactPerson: 'Rohan Nambiar',
    vendorContactNo: '+91 9448821033',
    attachmentName: 'dell_tax_invoice_verified.pdf',
    type: 'Purchase Invoice'
  },
  {
    id: 'inv-102',
    invoiceNo: 'VOLT-INV-44109',
    invoiceDate: '2026-05-29',
    vendorId: 'vend-voltas',
    vendorName: 'Voltas Industrial AC Enterprise',
    vendorAddress: 'Shastri Nagar Industrial Estate Ext 4, Jaipur, Rajasthan, PIN: 302016',
    vendorContactPerson: 'Suresh Singhania',
    vendorContactNo: '+91 9829011223',
    attachmentName: 'voltas_commercial_invoice_901.pdf',
    type: 'Purchase Invoice'
  }
];

export const INITIAL_GRNS: GRN[] = [
  {
    id: 'grn-101',
    grnNo: 'ESTM-GRN-2026-0001',
    dateTime: '2026-05-26T11:30',
    vendorId: 'vend-dell',
    itemId: 'item-dell-lat',
    qty: 5,
    unit: 'Nos',
    challanNo: 'CH-DELL-5981',
    price: 68500,
    attachmentName: 'dell_receipt_challan.pdf',
    isTagged: true
  },
  {
    id: 'grn-102',
    grnNo: 'ESTM-GRN-2026-0002',
    dateTime: '2026-06-02T16:15',
    vendorId: 'vend-voltas',
    itemId: 'item-voltas-split',
    qty: 2,
    unit: 'Nos',
    challanNo: 'CH-VOLTAS-2210',
    price: 34000,
    attachmentName: 'voltas_transit_slip.pdf',
    isTagged: true
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    assetTagNo: 'ESTM-EX-003',
    itemId: 'item-dell-lat',
    itemName: 'DELL Latitude 5420 Laptop i7 16GB',
    categoryName: 'IT Equipment & Laptops',
    unit: 'Nos',
    rate: 68500,
    productSerialNo: 'DSK-24H0021',
    purchaseDate: '2026-05-10',
    poNo: 'ESTM-PO-2026-601',
    poDate: '2026-05-10',
    warrantyMonths: 12,
    warrantyExpiry: '2027-05-10',
    hasOrderCopy: true,
    amcPeriodMonths: 0,
    invoiceNo: 'DELL-INV-88912',
    hasInvoiceCopy: true,
    allottedType: 'Person',
    allottedToName: 'Sarah Jenkins (Security Operations)',
    allottedToEmail: 'sarah.jenkins@esteeminfra.com',
    allottedToPhone: '+91 9900881122',
    allottedDate: '2026-05-27',
    remarks: 'Premium rugged coding laptop assigned for control room supervision.',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  },
  {
    id: 'asset-2',
    assetTagNo: 'EIP-12345',
    itemId: 'item-voltas-split',
    itemName: 'Voltas 2.0 Ton 5-Star Commercial Split AC',
    categoryName: 'HVAC & Air Conditioners',
    unit: 'Nos',
    rate: 34000,
    productSerialNo: 'VOLT-77291-C',
    purchaseDate: '2026-05-18',
    poNo: 'ESTM-PO-2026-602',
    poDate: '2026-05-18',
    warrantyMonths: 24,
    warrantyExpiry: '2026-07-15',
    hasOrderCopy: true,
    amcPeriodMonths: 12,
    invoiceNo: 'VOLT-INV-44109',
    hasInvoiceCopy: true,
    allottedType: 'Location',
    allottedToName: 'Server Room Alpha, Mumbai Metro transit Yard',
    allottedDate: '2026-06-03',
    remarks: 'Main cooling unit to protect core network cabinet.',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  },
  {
    id: 'asset-3',
    assetTagNo: 'EIP-22104',
    itemId: 'item-honda-gen',
    itemName: 'Honda EX5500 Silent Diesel Generator',
    categoryName: 'Heavy Diesel Power Generators',
    unit: 'Nos',
    rate: 155000,
    productSerialNo: 'HON-EX-99881A',
    purchaseDate: '2026-04-12',
    poNo: 'ESTM-PO-2026-501',
    poDate: '2026-04-12',
    warrantyMonths: 36,
    warrantyExpiry: '2029-04-12',
    hasOrderCopy: false,
    amcPeriodMonths: 0,
    invoiceNo: 'HON-INV-2210',
    hasInvoiceCopy: true,
    allottedType: 'Location',
    allottedToName: 'Sohna Entry Toll Complex Yard',
    allottedDate: '2026-04-20',
    remarks: 'Required for nocturnal lighting on Toll structure build.',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-highway'
  }
];

export const INITIAL_TRANSFERS: AssetTransferLog[] = [
  {
    id: 'tx-1',
    assetTagNo: 'ESTM-EX-003',
    assetName: 'DELL Latitude 5420 Laptop i7 16GB',
    fromAllottedTo: 'Priya Sharma (Transit Entry Office)',
    toAllottedType: 'Person',
    toAllottedTo: 'Sarah Jenkins (Security Operations)',
    toEmail: 'sarah.jenkins@esteeminfra.com',
    toPhone: '+91 9900881122',
    transferDate: '2026-05-27',
    remarks: 'Promoted to control room supervision laptop.'
  }
];

export const INITIAL_RECONCILIATION: AssetReconciliationLog[] = [
  {
    id: 'rec-1',
    assetTagNo: 'ESTM-EX-003',
    assetName: 'DELL Latitude 5420 Laptop i7 16GB',
    lastAllottedTo: 'Sarah Jenkins (Security Operations)',
    currentQty: 1,
    reconDate: '2026-06-15',
    status: 'Verified',
    remarks: 'Matched serial DSK-24H0021 perfectly. Clean physical shape.',
    auditorName: 'Samuel D Souza (Lead Auditor)'
  },
  {
    id: 'rec-2',
    assetTagNo: 'EIP-12345',
    assetName: 'Voltas 2.0 Ton 5-Star Commercial Split AC',
    lastAllottedTo: 'Server Room Alpha, Mumbai Metro transit Yard',
    currentQty: 1,
    reconDate: '2026-06-18',
    status: 'Verified',
    remarks: 'Operational, high performance. No cooling leaks detected.',
    auditorName: 'Samuel D Souza (Lead Auditor)'
  }
];

export const INITIAL_MATERIAL_ENTRIES: MaterialEntry[] = [
  {
    id: 'me-1',
    itemId: 'item-cement',
    itemName: 'OPC 53 Grade Ultratech Cement',
    qty: 500,
    unit: 'Bags',
    vendorId: 'vend-voltas', // reuse or set general vendor
    vendorName: 'Voltas Industrial AC Enterprise',
    challanNo: 'CH-CEM-90812',
    receivedDate: '2026-06-10',
    receivedBy: 'Priya Sharma',
    remarks: 'First batch of cement received for concrete structural expansion',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  },
  {
    id: 'me-2',
    itemId: 'item-steel',
    itemName: 'Fe550 TMT Steel Bars 12mm',
    qty: 15,
    unit: 'Metric Tons (MT)',
    vendorId: 'vend-dell',
    vendorName: 'Dell Technology India Solutions',
    challanNo: 'CH-STL-22419',
    receivedDate: '2026-06-12',
    receivedBy: 'Priya Sharma',
    remarks: 'TMT Reinforcement bars delivered to main transit yard site',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  }
];

export const INITIAL_MATERIAL_ISSUES: MaterialIssue[] = [
  {
    id: 'mi-1',
    itemId: 'item-cement',
    itemName: 'OPC 53 Grade Ultratech Cement',
    qty: 120,
    unit: 'Bags',
    issuedToPerson: 'Larsen & Toubro Core Sub-Contractor (Rajesh Yadav)',
    issuedDate: '2026-06-14',
    issuedBy: 'Priya Sharma',
    remarks: 'Issued for pile foundation casting of Metro Station gate 2',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  },
  {
    id: 'mi-2',
    itemId: 'item-steel',
    itemName: 'Fe550 TMT Steel Bars 12mm',
    qty: 3.5,
    unit: 'Metric Tons (MT)',
    issuedToPerson: 'Structural Rebar Crew Lead (Vikram Singh)',
    issuedDate: '2026-06-15',
    issuedBy: 'Priya Sharma',
    remarks: 'Issued for reinforcement fabrication of pier cap 15',
    companyId: 'comp-esteem',
    projectId: 'proj-esteem-mumbai'
  }
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-06-22T04:30:10-07:00',
    userId: 'u-1',
    userName: 'Vicky Admin',
    userRole: 'ADMIN',
    actionType: 'WARRANTY_EXTEND',
    description: 'Extended industrial air-cooled chiller (EIP-10002) warranty coverage by 12 months in core asset ledger.',
    ipAddress: '192.168.1.105',
    metadata: 'Target Asset ID: asset-2',
    companyId: 'comp-esteem'
  },
  {
    id: 'audit-2',
    timestamp: '2026-06-20T10:15:30-07:00',
    userId: 'u-2',
    userName: 'Priya Sharma',
    userRole: 'AUDITOR',
    actionType: 'RECONCILIATION',
    description: 'Executed manual field audit reconciliation for Heavy Excavator JCB-3DX (EIP-10001) - Status Verified.',
    ipAddress: '192.168.1.112',
    metadata: 'Status Code: 200 - MATCHED',
    companyId: 'comp-esteem'
  },
  {
    id: 'audit-3',
    timestamp: '2026-06-18T14:22:45-07:00',
    userId: 'u-3',
    userName: 'Rahul Kumar',
    userRole: 'DATA_ENTRY',
    actionType: 'GRN_APPROVAL',
    description: 'Approved Raw Material Receipt Slip GRN #GRN-0982 for Dell Precision Workstations under high security key signature.',
    ipAddress: '192.168.2.45',
    metadata: 'Quantity: 5 units • Approved',
    companyId: 'comp-esteem'
  },
  {
    id: 'audit-4',
    timestamp: '2026-06-16T11:05:12-07:00',
    userId: 'u-3',
    userName: 'Rahul Kumar',
    userRole: 'DATA_ENTRY',
    actionType: 'MATERIAL_ISSUE',
    description: 'Released 120 Bags of OPC 53 Grade Ultratech Cement to pile foundation sub-contractor Rajesh Yadav.',
    ipAddress: '191.132.88.54',
    metadata: 'Project Segment: Mumbai Metro Line 3',
    companyId: 'comp-esteem'
  },
  {
    id: 'audit-5',
    timestamp: '2026-06-15T09:40:00-07:00',
    userId: 'u-1',
    userName: 'Vicky Admin',
    userRole: 'ADMIN',
    actionType: 'ASSET_TRANSFER',
    description: 'Authorized inter-project transfer of Trimble Excavator GPS Guidance System from Pune Depot to Mumbai Site.',
    ipAddress: '192.168.1.105',
    metadata: 'Route Code: GATEPASS-MUM-951',
    companyId: 'comp-esteem'
  }
];



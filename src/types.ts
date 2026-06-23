/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'AUDITOR' | 'DATA_ENTRY' | 'MANAGEMENT' | 'MOBILE_SCANNER';

export interface Company {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  country: string;
  logo: string;
  gstinNo: string;
  cinNo: string;
  contactNo: string;
  email: string;
  footerNote: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  country: string;
  companyId: string; // Associated with Company
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  companyId: string; // Restricted to specific company
  allowedProjects: string[]; // List of project IDs
  profilePic: string;
}

export interface Category {
  id: string;
  name: string;
  depreciationRate: number; // e.g. 15 for 15%
  effectiveDate: string;
  remarks: string;
  companyId?: string; // Link to company specific if required
}

export interface Unit {
  id: string;
  name: string;
  remarks: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  unitId: string;
  remarks: string;
  companyId?: string; // Link to company specific if required
}

export interface Vendor {
  id: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  contactPerson: string;
  mobile: string;
  email: string;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  vendorContactPerson: string;
  vendorContactNo: string;
  attachmentName?: string;
  remarks: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  vendorContactPerson: string;
  vendorContactNo: string;
  attachmentName?: string;
  type: 'Purchase Invoice' | 'AMC Invoice';
}

export interface GRN {
  id: string;
  grnNo: string; // Auto generated
  dateTime: string;
  vendorId: string;
  itemId: string;
  qty: number;
  unit: string;
  challanNo?: string;
  price?: number;
  attachmentName?: string;
  isTagged: boolean;
}

export interface Asset {
  id: string;
  assetTagNo: string; // e.g. EIP-10001
  itemId: string;
  itemName: string;
  categoryName: string;
  unit: string;
  rate: number;
  productSerialNo: string; // Manual entry
  purchaseDate: string;
  poNo: string;
  poDate: string;
  warrantyMonths: number;
  warrantyExpiry?: string; // Expiry date (YYYY-MM-DD)
  hasOrderCopy: boolean;
  amcPeriodMonths: number;
  invoiceNo: string;
  hasInvoiceCopy: boolean;
  allottedType: 'Location' | 'Person';
  allottedToName: string; // Person name or Location name
  allottedToEmail?: string; // If person
  allottedToPhone?: string; // If person
  allottedDate: string;
  remarks: string;
  companyId: string; // Filter asset by company
  projectId: string; // Filter asset by project
}

export interface AssetTransferLog {
  id: string;
  assetTagNo: string;
  assetName: string;
  fromAllottedTo: string;
  toAllottedType: 'Location' | 'Person';
  toAllottedTo: string;
  toEmail?: string;
  toPhone?: string;
  transferDate: string;
  remarks?: string;
}

export interface AssetReconciliationLog {
  id: string;
  assetTagNo: string;
  assetName: string;
  lastAllottedTo: string;
  currentQty: number;
  reconDate: string;
  status: 'Verified' | 'Missing' | 'Damaged' | 'Transferred';
  remarks: string;
  auditorName: string;
}

export interface MaterialEntry {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  vendorId: string;
  vendorName: string;
  challanNo: string;
  receivedDate: string;
  receivedBy: string;
  remarks: string;
  companyId: string;
  projectId: string;
}

export interface MaterialIssue {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  issuedToPerson: string;
  issuedDate: string;
  issuedBy: string;
  remarks: string;
  companyId: string;
  projectId: string; // Destination/Associated project
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: string;
  description: string;
  ipAddress?: string;
  metadata?: string;
  companyId: string;
}



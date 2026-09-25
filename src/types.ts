export type UserRole = 'Owner' | 'Kasir';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  note?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'LAINNYA';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault?: boolean;
}

export interface QrisSettings {
  enabled: boolean;
  merchantName: string;
  qrImageUrl: string;
  nmid?: string;
  instructions?: string;
}

export interface TransferSettings {
  enabled: boolean;
  accounts: BankAccount[];
  instructions?: string;
}

export interface OtherPaymentSettings {
  enabled: boolean;
  defaultNote?: string;
  notePlaceholder?: string;
  instructions?: string;
}

export interface PaymentSettings {
  qris: QrisSettings;
  transfer: TransferSettings;
  other: OtherPaymentSettings;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  cashierName: string;
  cashierUsername: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  notes?: string;
  bankAccountInfo?: string;
}

export interface CashDrawerSession {
  isOpen: boolean;
  openedAt?: string;
  openedTimestamp?: number;
  openedBy?: string;
  initialCash: number;
  totalCashSales?: number;
}

export interface ShiftSummaryReport {
  openedAt: string;
  closedAt: string;
  openedBy: string;
  initialCash: number;
  totalTransactions: number;
  totalItemsSold: number;
  cashSales: number;
  qrisSales: number;
  transferSales: number;
  otherSales: number;
  totalSales: number;
  expectedCashInDrawer: number;
  actualCashInDrawer: number;
  cashDifference: number;
  transactions: Transaction[];
}

export interface PrinterSettings {
  printerName: string;
  connectionType: 'Bluetooth' | 'USB' | 'Network/LAN';
  paperWidth: '58 mm' | '80 mm';
  orientation: 'Portrait' | 'Landscape';
  copies: number;
  margin: '0 mm' | '5 mm' | '10 mm';
  autoPrint: boolean;
  autoCut: boolean;
  beepAfterPrint: boolean;
  ipAddress: string;
  port: string;
}

export interface ReceiptTemplate {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  footerNote: string;
  showCashier: boolean;
  showTime: boolean;
  showQrCode: boolean;
}

import { Product, User, PrinterSettings, ReceiptTemplate, PaymentSettings } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Owner',
    username: 'owner',
    password: '1234',
    role: 'Owner',
    status: 'active',
  },
  {
    id: 'usr_2',
    name: 'Kasir',
    username: 'kasir',
    password: '1234',
    role: 'Kasir',
    status: 'active',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Terbul cokelat',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v1_1', name: 'Ori', price: 10000 },
      { id: 'v1_2', name: 'Pandan', price: 12000 },
      { id: 'v1_3', name: 'Redvelvet', price: 12000 },
      { id: 'v1_4', name: 'Cokolatos', price: 12000 },
    ],
  },
  {
    id: 'prod_2',
    name: 'Terbul keju',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v2_1', name: 'Ori', price: 10000 },
      { id: 'v2_2', name: 'Pandan', price: 12000 },
      { id: 'v2_3', name: 'Redvelvet', price: 12000 },
      { id: 'v2_4', name: 'Cokolatos', price: 12000 },
    ],
  },
  {
    id: 'prod_3',
    name: 'Terbul cokelat keju',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v3_1', name: 'Ori', price: 12000 },
      { id: 'v3_2', name: 'Pandan', price: 14000 },
      { id: 'v3_3', name: 'Redvelvet', price: 14000 },
      { id: 'v3_4', name: 'Cokolatos', price: 14000 },
    ],
  },
  {
    id: 'prod_4',
    name: 'Terbul cokelat pisang',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v4_1', name: 'Ori', price: 12000 },
      { id: 'v4_2', name: 'Pandan', price: 14000 },
      { id: 'v4_3', name: 'Redvelvet', price: 14000 },
      { id: 'v4_4', name: 'Cokolatos', price: 14000 },
    ],
  },
  {
    id: 'prod_5',
    name: 'Terbul cokelat kacang',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v5_1', name: 'Ori', price: 12000 },
      { id: 'v5_2', name: 'Pandan', price: 14000 },
      { id: 'v5_3', name: 'Redvelvet', price: 14000 },
      { id: 'v5_4', name: 'Cokolatos', price: 14000 },
    ],
  },
  {
    id: 'prod_6',
    name: 'Terbul cokelat kacang keju',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v6_1', name: 'Ori', price: 13000 },
      { id: 'v6_2', name: 'Pandan', price: 15000 },
      { id: 'v6_3', name: 'Redvelvet', price: 15000 },
      { id: 'v6_4', name: 'Cokolatos', price: 15000 },
    ],
  },
  {
    id: 'prod_7',
    name: 'Terbul cokelat pisanag keju',
    category: 'Terang bulan',
    status: 'active',
    variants: [
      { id: 'v7_1', name: 'Ori', price: 13000 },
      { id: 'v7_2', name: 'Pandan', price: 15000 },
      { id: 'v7_3', name: 'Redvelvet', price: 15000 },
      { id: 'v7_4', name: 'Cokolatos', price: 15000 },
    ],
  },
  {
    id: 'prod_8',
    name: 'KOSMIX',
    category: 'Es Kopi Susu Mixing',
    status: 'active',
    variants: [
      { id: 'v8_1', name: 'Original', price: 10000 },
      { id: 'v8_2', name: 'Gula Aren', price: 12000 },
      { id: 'v8_3', name: 'Hazelnut', price: 13000 },
      { id: 'v8_4', name: 'Vanilla', price: 13000 },
      { id: 'v8_5', name: 'Caramel', price: 13000 },
    ],
  },
];

export const INITIAL_PRINTER_SETTINGS: PrinterSettings = {
  printerName: 'POS-80C',
  connectionType: 'Bluetooth',
  paperWidth: '58 mm',
  orientation: 'Portrait',
  copies: 1,
  margin: '0 mm',
  autoPrint: true,
  autoCut: true,
  beepAfterPrint: true,
  ipAddress: '192.168.1.100',
  port: '9100',
};

export const INITIAL_RECEIPT_TEMPLATE: ReceiptTemplate = {
  storeName: 'WARUNG SENJA TERANG BULAN',
  tagline: 'Point of Sale yang cepat dan sederhana',
  address: 'Jl. Senja Raya No. 45, Kota',
  phone: '0812-3456-7890',
  footerNote: 'Terima kasih atas kunjungan Anda!\nSelamat menikmati.',
  showCashier: true,
  showTime: true,
  showQrCode: true,
};

export const EMPTY_RECEIPT_TEMPLATE: ReceiptTemplate = {
  storeName: '',
  tagline: '',
  address: '',
  phone: '',
  footerNote: '',
  showCashier: true,
  showTime: true,
  showQrCode: false,
};

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  qris: {
    enabled: true,
    merchantName: 'WARUNG SENJA TERANG BULAN',
    qrImageUrl: '',
    nmid: 'ID1020030040050',
    instructions: 'Scan barcode QRIS menggunakan BCA, GoPay, OVO, Dana, ShopeePay, LinkAja, atau Mobile Banking lainnya.',
  },
  transfer: {
    enabled: true,
    accounts: [
      {
        id: 'acc_1',
        bankName: 'BCA',
        accountNumber: '123-456-7890',
        accountHolder: 'Warung Senja',
        isDefault: true,
      },
    ],
    instructions: 'Pastikan nama penerima dan nominal transfer sesuai sebelum memproses transaksi.',
  },
  other: {
    enabled: true,
    defaultNote: '',
    notePlaceholder: 'Contoh: Pesanan GrabFood #GF-8821 / GoFood / EDC Mandiri / Piutang / Voucher',
    instructions: 'Isikan catatan transaksi (nomor referensi / channel pesanan / keterangan custom) pada kolom catatan.',
  },
};

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  qris: {
    enabled: true,
    merchantName: '',
    qrImageUrl: '',
    nmid: '',
    instructions: '',
  },
  transfer: {
    enabled: true,
    accounts: [],
    instructions: '',
  },
  other: {
    enabled: true,
    defaultNote: '',
    notePlaceholder: 'Contoh: Pesanan GrabFood / GoFood / EDC / Piutang / Voucher',
    instructions: '',
  },
};



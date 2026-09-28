import { Transaction, ReceiptTemplate, PrinterSettings, ShiftSummaryReport } from '../types';
import { formatRupiah, formatDateIndo } from './format';

/**
 * ESC/POS Command Builder for Thermal Receipt Printers (58mm and 80mm)
 */
export class EscPosBuilder {
  private buffer: number[] = [];
  private lineWidth: number = 32; // Default 32 columns for 58mm (48 for 80mm)

  constructor(paperWidth: '58 mm' | '80 mm' = '58 mm') {
    this.lineWidth = paperWidth === '80 mm' ? 48 : 32;
    this.init();
  }

  /** Initialize printer */
  init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @
    return this;
  }

  /** Text alignment */
  align(alignment: 'left' | 'center' | 'right'): this {
    let val = 0;
    if (alignment === 'center') val = 1;
    if (alignment === 'right') val = 2;
    this.buffer.push(0x1B, 0x61, val); // ESC a n
    return this;
  }

  /** Text boldness */
  bold(enable: boolean = true): this {
    this.buffer.push(0x1B, 0x45, enable ? 1 : 0); // ESC E n
    return this;
  }

  /** Font sizing: normal, double height, double width, double both */
  fontSize(size: 'normal' | 'double-height' | 'double-width' | 'double'): this {
    let val = 0x00;
    if (size === 'double-height') val = 0x01;
    if (size === 'double-width') val = 0x10;
    if (size === 'double') val = 0x11;
    this.buffer.push(0x1D, 0x21, val); // GS ! n
    return this;
  }

  /** Underline */
  underline(enable: boolean = true): this {
    this.buffer.push(0x1B, 0x2D, enable ? 1 : 0);
    return this;
  }

  /** Write raw text */
  text(str: string): this {
    // Clean and normalize text to single-byte printable characters
    const cleanStr = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E\n\r]/g, ' ');

    for (let i = 0; i < cleanStr.length; i++) {
      this.buffer.push(cleanStr.charCodeAt(i));
    }
    return this;
  }

  /** Write text followed by newline */
  line(str: string = ''): this {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  /** Print horizontal divider line */
  divider(char: string = '-'): this {
    const lineStr = char.repeat(this.lineWidth);
    this.line(lineStr);
    return this;
  }

  /** Print 2 columns with left and right alignment */
  twoColumns(left: string, right: string): this {
    const leftClean = left.trim();
    const rightClean = right.trim();

    const maxLeftLen = this.lineWidth - rightClean.length - 1;
    let finalLeft = leftClean;
    if (finalLeft.length > maxLeftLen) {
      finalLeft = finalLeft.substring(0, maxLeftLen);
    }

    const spacesCount = Math.max(1, this.lineWidth - finalLeft.length - rightClean.length);
    const lineStr = finalLeft + ' '.repeat(spacesCount) + rightClean;
    this.line(lineStr);
    return this;
  }

  /** Item row formatting (Name on top, qty x price and total below) */
  itemRow(name: string, qty: number, priceStr: string, totalStr: string, note?: string): this {
    this.line(name);
    const leftSub = `  ${qty} x ${priceStr}`;
    this.twoColumns(leftSub, totalStr);
    if (note) {
      this.line(`  * ${note}`);
    }
    return this;
  }

  /** Feed lines */
  feed(lines: number = 3): this {
    this.buffer.push(0x1B, 0x64, lines); // ESC d n
    return this;
  }

  /** Cut paper (full or partial) */
  cut(partial: boolean = true): this {
    this.feed(3);
    // GS V m
    this.buffer.push(0x1D, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  /** Kick open cash drawer */
  openDrawer(): this {
    // ESC p m t1 t2 (pin 2: 0, pin 5: 1)
    this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA);
    return this;
  }

  /** Beep / Buzzer */
  beep(count: number = 1, duration: number = 2): this {
    // ESC B n t
    this.buffer.push(0x1B, 0x42, count, duration);
    return this;
  }

  /** Export as Uint8Array */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate binary ESC/POS buffer for a transaction receipt
 */
export function buildTransactionEscPos(
  transaction: Transaction,
  template: ReceiptTemplate,
  settings: PrinterSettings
): Uint8Array {
  const builder = new EscPosBuilder(settings.paperWidth);

  // Kick cash drawer if cash
  if (transaction.paymentMethod === 'CASH') {
    builder.openDrawer();
  }

  // Header - Centered
  builder.align('center');
  if (template.storeName) {
    builder.fontSize('double-height').bold(true).line(template.storeName).fontSize('normal').bold(false);
  }
  if (template.tagline) {
    builder.line(template.tagline);
  }
  if (template.address) {
    builder.line(template.address);
  }
  if (template.phone) {
    builder.line(`Telp/WA: ${template.phone}`);
  }

  // Divider
  builder.align('left');
  builder.divider('=');

  // Transaction info
  builder.twoColumns(`No: ${transaction.invoiceNumber}`, transaction.time);
  builder.twoColumns(`Tgl: ${formatDateIndo(transaction.date)}`, `Metode: ${transaction.paymentMethod}`);
  if (template.showCashier) {
    builder.line(`Kasir: ${transaction.cashierName}`);
  }
  if (transaction.bankAccountInfo) {
    builder.line(`Bank: ${transaction.bankAccountInfo}`);
  }
  if (transaction.notes) {
    builder.line(`Catatan: ${transaction.notes}`);
  }

  builder.divider('-');

  // Items
  for (const item of transaction.items) {
    const displayName = `${item.productName} (${item.variantName})`;
    const priceStr = formatRupiah(item.price);
    const totalStr = formatRupiah(item.price * item.quantity);
    builder.itemRow(displayName, item.quantity, priceStr, totalStr, item.note);
  }

  builder.divider('-');

  // Totals
  builder.twoColumns('Subtotal', formatRupiah(transaction.subtotal));
  if (transaction.discount > 0) {
    builder.twoColumns('Diskon', `-${formatRupiah(transaction.discount)}`);
  }

  builder.bold(true);
  builder.twoColumns('TOTAL', formatRupiah(transaction.total));
  builder.bold(false);

  builder.twoColumns(`Bayar (${transaction.paymentMethod})`, formatRupiah(transaction.amountPaid));
  builder.twoColumns('Kembali', formatRupiah(transaction.change));

  builder.divider('=');

  // Footer note
  builder.align('center');
  if (template.footerNote) {
    builder.line(template.footerNote);
  }
  builder.line('Terima Kasih Atas Kunjungan Anda');
  builder.line(`-- WSPOS Thermal ${settings.paperWidth} --`);

  // Buzzer if enabled
  if (settings.beepAfterPrint) {
    builder.beep(1, 2);
  }

  // Auto cut or feed
  if (settings.autoCut) {
    builder.cut(true);
  } else {
    builder.feed(4);
  }

  return builder.toUint8Array();
}

/**
 * Generate binary ESC/POS buffer for test print
 */
export function buildTestPrintEscPos(
  storeName: string = 'Warung Senja Terang Bulan',
  paperWidth: '58 mm' | '80 mm' = '58 mm',
  beep: boolean = true
): Uint8Array {
  const builder = new EscPosBuilder(paperWidth);

  builder.align('center');
  builder.fontSize('double').bold(true).line('TEST PRINT').fontSize('normal').bold(false);
  builder.line(storeName);
  builder.line('Koneksi Bluetooth Thermal Printer: OK!');
  builder.line(new Date().toLocaleString('id-ID'));

  builder.divider('=');
  builder.align('left');
  builder.twoColumns('Koneksi:', 'Bluetooth BLE ESC/POS');
  builder.twoColumns('Lebar Kertas:', paperWidth);
  builder.twoColumns('Status Driver:', 'Siap Cetak (Ready)');
  builder.twoColumns('Encoding:', 'ASCII / Raw Binary');

  builder.divider('-');
  builder.line('Karakter Uji Coba:');
  builder.line('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  builder.line('abcdefghijklmnopqrstuvwxyz 0123456789');
  builder.line('!@#$%^&*()_+~`-={}|[]\\:";\'<>?,./');

  builder.divider('=');
  builder.align('center');
  builder.bold(true).line('PRINTER BERHASIL TERHUBUNG!').bold(false);
  builder.line('Siap digunakan untuk transaksi kasir.');

  if (beep) {
    builder.beep(2, 2);
  }

  builder.cut(true);
  return builder.toUint8Array();
}

/**
 * Generate binary ESC/POS buffer for Shift Summary / Rekap Kasir
 */
export function buildShiftReportEscPos(
  report: ShiftSummaryReport,
  template: ReceiptTemplate,
  settings: PrinterSettings
): Uint8Array {
  const builder = new EscPosBuilder(settings.paperWidth);

  builder.align('center');
  builder.fontSize('double-height').bold(true).line('REKAP SHIFT KASIR').fontSize('normal').bold(false);
  builder.line(template.storeName || 'Warung Senja Terang Bulan');
  builder.line(new Date().toLocaleString('id-ID'));

  builder.divider('=');
  builder.align('left');
  builder.twoColumns('Kasir:', report.openedBy);
  builder.twoColumns('Buka Shift:', formatDateIndo(report.openedAt.split('T')[0]));
  builder.twoColumns('Tutup Shift:', formatDateIndo(report.closedAt.split('T')[0]));
  builder.twoColumns('Modal Awal:', formatRupiah(report.initialCash));

  builder.divider('-');
  builder.line('RINCIAN PENJUALAN:');
  builder.twoColumns(`Total Transaksi:`, `${report.totalTransactions} Nota`);
  builder.twoColumns(`Total Item Terjual:`, `${report.totalItemsSold} Pcs`);
  builder.twoColumns(`Penjualan Tunai:`, formatRupiah(report.cashSales));
  builder.twoColumns(`Penjualan QRIS:`, formatRupiah(report.qrisSales));
  builder.twoColumns(`Penjualan Transfer:`, formatRupiah(report.transferSales));
  builder.twoColumns(`Penjualan Lainnya:`, formatRupiah(report.otherSales));

  builder.divider('-');
  builder.bold(true);
  builder.twoColumns(`TOTAL OMZET:`, formatRupiah(report.totalSales));
  builder.bold(false);

  builder.divider('=');
  builder.line('REKONSILIASI KAS LACI:');
  builder.twoColumns('Target Kas Laci:', formatRupiah(report.expectedCashInDrawer));
  builder.twoColumns('Uang Kas Aktual:', formatRupiah(report.actualCashInDrawer));

  const diffText =
    report.cashDifference === 0
      ? 'PAS (Rp 0)'
      : report.cashDifference > 0
      ? `LEBIH (+${formatRupiah(report.cashDifference)})`
      : `KURANG (-${formatRupiah(Math.abs(report.cashDifference))})`;

  builder.bold(true);
  builder.twoColumns('Selisih Kas:', diffText);
  builder.bold(false);

  builder.feed(2);
  builder.align('center');
  builder.line('Kasir               Supervisor');
  builder.feed(2);
  builder.line(`(${report.openedBy})           (            )`);

  builder.cut(true);
  return builder.toUint8Array();
}

// Pre-designed SVG logos in data URL format for receipt footers
export interface PresetLogo {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

// Crisp monochrome SVG badges designed specifically for thermal POS printers
export const PRESET_FOOTER_LOGOS: PresetLogo[] = [
  {
    id: 'halal',
    name: 'Logo Halal Indonesia',
    category: 'Sertifikasi',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90" width="200" height="90">
        <rect x="2" y="2" width="196" height="86" rx="8" fill="none" stroke="#000" stroke-width="2.5"/>
        <circle cx="45" cy="45" r="28" fill="none" stroke="#000" stroke-width="2.5"/>
        <text x="45" y="49" font-family="Arial, sans-serif" font-weight="900" font-size="14" text-anchor="middle" fill="#000">حلال</text>
        <text x="45" y="62" font-family="Arial, sans-serif" font-weight="bold" font-size="8" text-anchor="middle" fill="#000">HALAL</text>
        <text x="120" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="13" text-anchor="middle" fill="#000">100% HALAL</text>
        <text x="120" y="52" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="#000">INDONESIA</text>
        <text x="120" y="64" font-family="Courier, monospace" font-size="7" text-anchor="middle" fill="#000">ID0011000000000</text>
      </svg>
    `.trim()),
  },
  {
    id: 'thankyou',
    name: 'Terima Kasih & Smiley',
    category: 'Ucapan',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
        <circle cx="36" cy="40" r="26" fill="none" stroke="#000" stroke-width="2.5"/>
        <circle cx="28" cy="34" r="3" fill="#000"/>
        <circle cx="44" cy="34" r="3" fill="#000"/>
        <path d="M 26 44 Q 36 54 46 44" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
        <text x="116" y="36" font-family="Arial, sans-serif" font-weight="900" font-size="13" text-anchor="middle" fill="#000">TERIMA KASIH</text>
        <text x="116" y="50" font-family="Arial, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" fill="#000">SENANG MELAYANI ANDA</text>
        <text x="116" y="62" font-family="Courier, monospace" font-size="8" text-anchor="middle" fill="#000">★ ★ ★ ★ ★</text>
      </svg>
    `.trim()),
  },
  {
    id: 'warungsenja',
    name: 'Warung Senja Authentic Seal',
    category: 'Branding',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
        <path d="M 10 40 Q 30 18 50 40 Q 30 62 10 40" fill="none" stroke="#000" stroke-width="2.5"/>
        <circle cx="30" cy="40" r="9" fill="#000"/>
        <text x="120" y="32" font-family="Arial, sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="#000">WARUNG SENJA</text>
        <text x="120" y="47" font-family="Arial, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" fill="#000">TERANG BULAN SPESIAL</text>
        <text x="120" y="61" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="#000">~ Resep Asli Sejak 2020 ~</text>
      </svg>
    `.trim()),
  },
  {
    id: 'qrcode_follow',
    name: 'Badge Follow IG / Medsos',
    category: 'Media Sosial',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
        <rect x="15" y="16" width="48" height="48" rx="10" fill="none" stroke="#000" stroke-width="2.5"/>
        <circle cx="39" cy="40" r="13" fill="none" stroke="#000" stroke-width="2.5"/>
        <circle cx="51" cy="27" r="3" fill="#000"/>
        <text x="128" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="#000">FOLLOW US ON IG</text>
        <text x="128" y="49" font-family="Arial, sans-serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#000">@warungsenja.pos</text>
        <text x="128" y="62" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="#000">Tag foto Anda untuk promo!</text>
      </svg>
    `.trim()),
  },
];

// Discovered Bluetooth Thermal Printers list for instant pairing or selection
export interface BluetoothThermalDevice {
  id: string;
  name: string;
  type: string;
  rssi: number;
  paired: boolean;
  paperWidth: '58 mm' | '80 mm';
  macAddress: string;
}

export const DISCOVERABLE_BT_PRINTERS: BluetoothThermalDevice[] = [
  {
    id: 'bt_pos_5802dd',
    name: 'POS-5802DD (Bluetooth Thermal)',
    type: 'Portable Bluetooth ESC/POS',
    rssi: -48,
    paired: true,
    paperWidth: '58 mm',
    macAddress: '66:32:8B:11:4A:2D',
  },
  {
    id: 'bt_rpp02n',
    name: 'RPP02N Mini Thermal Printer',
    type: 'Wireless Bluetooth 58mm',
    rssi: -56,
    paired: false,
    paperWidth: '58 mm',
    macAddress: 'DC:0D:30:44:98:C1',
  },
  {
    id: 'bt_pt210',
    name: 'PT-210 Mobile POS Printer',
    type: 'Bluetooth ESC/POS Thermal',
    rssi: -62,
    paired: false,
    paperWidth: '58 mm',
    macAddress: '88:29:9C:3B:19:FA',
  },
  {
    id: 'bt_panda_58b',
    name: 'Panda PRJ-58B Bluetooth',
    type: 'Desktop Bluetooth POS',
    rssi: -65,
    paired: false,
    paperWidth: '58 mm',
    macAddress: '40:22:D8:5F:AA:10',
  },
  {
    id: 'bt_pos_80c',
    name: 'POS-80C Bluetooth High-Speed',
    type: 'Heavy-Duty 80mm Bluetooth',
    rssi: -52,
    paired: false,
    paperWidth: '80 mm',
    macAddress: '00:15:83:ED:39:BB',
  },
  {
    id: 'bt_inner_printer',
    name: 'InnerPrinter (Sunmi / Android Built-in)',
    type: 'Direct Internal Bluetooth Bus',
    rssi: -30,
    paired: true,
    paperWidth: '58 mm',
    macAddress: '00:11:22:33:44:55',
  },
];

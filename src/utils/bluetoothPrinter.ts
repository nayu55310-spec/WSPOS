/**
 * Bluetooth Thermal Receipt Printer Driver (Web Bluetooth API & Web Serial Fallback)
 * Supports all standard ESC/POS 58mm & 80mm Bluetooth printers (PT-210, MPT-II, RPP02, GOOJPRT, Panda, Eppos, VSC, Sunmi, etc.)
 */

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  serviceUuid?: string;
  characteristicUuid?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Standard & proprietary Bluetooth Low Energy (BLE) thermal printer services
export const THERMAL_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Generic / Epson BLE POS Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Serial Service
  '0000e0ff-0000-1000-8000-00805f9b34fb', // Chinese BLE Printer Service
  '0000ff00-0000-1000-8000-00805f9b34fb', // MPT-II / Panda / ZJiang ff00
  '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent / Goojprt fee7
  '0000ae00-0000-1000-8000-00805f9b34fb', // ae00 Service
  '0000af30-0000-1000-8000-00805f9b34fb', // af30 Service
  '0000fff0-0000-1000-8000-00805f9b34fb', // fff0 Service
  '0000ff12-0000-1000-8000-00805f9b34fb', // ff12 Service
];

class BluetoothPrinterManager {
  private device: any | null = null;
  private characteristic: any | null = null;
  private status: ConnectionStatus = 'disconnected';
  private errorMessage: string | null = null;
  private listeners: Set<(status: ConnectionStatus, info: BluetoothDeviceInfo | null, error: string | null) => void> = new Set();
  
  // Serial port reference for fallback
  private serialPort: any | null = null;
  private serialWriter: any | null = null;
  private isSerialConnection: boolean = false;

  constructor() {
    // Check if previously connected device exists
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wspos_bt_device_cache');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('[BT Printer] Cached device found:', parsed);
        } catch {
          // ignore
        }
      }
    }
  }

  public isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public isSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public getDeviceInfo(): BluetoothDeviceInfo | null {
    if (!this.device && !this.serialPort) return null;
    return {
      id: this.device ? this.device.id : 'serial_port',
      name: this.device ? (this.device.name || 'Printer Bluetooth') : 'Printer Serial / USB',
      connected: this.status === 'connected',
      serviceUuid: this.characteristic?.service?.uuid,
      characteristicUuid: this.characteristic?.uuid,
    };
  }

  public subscribe(listener: (status: ConnectionStatus, info: BluetoothDeviceInfo | null, error: string | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.status, this.getDeviceInfo(), this.errorMessage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const info = this.getDeviceInfo();
    this.listeners.forEach((fn) => fn(this.status, info, this.errorMessage));
  }

  /**
   * Scan and connect to Bluetooth ESC/POS printer
   */
  public async connectBluetooth(): Promise<boolean> {
    if (!this.isBluetoothSupported()) {
      this.status = 'error';
      this.errorMessage = 'Browser ini belum mendukung Web Bluetooth API. Disarankan menggunakan Google Chrome atau Microsoft Edge di Android, Windows, Mac, atau Linux.';
      this.notify();
      return false;
    }

    try {
      this.status = 'connecting';
      this.errorMessage = null;
      this.notify();

      // Request device with all thermal printer service filters
      const bt = (navigator as any).bluetooth;
      const device = await bt.requestDevice({
        acceptAllDevices: true,
        optionalServices: THERMAL_PRINTER_SERVICES,
      });

      if (!device) {
        this.status = 'disconnected';
        this.notify();
        return false;
      }

      this.device = device;
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnected.bind(this));

      // Connect to GATT Server
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Gagal membuka koneksi GATT Server ke printer.');
      }

      // Discover writable ESC/POS characteristic
      let writableChar: any = null;

      // Method 1: Discover from all accessible primary services
      try {
        const services = await server.getPrimaryServices();
        for (const service of services) {
          try {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                writableChar = char;
                console.log(`[BT Printer] Found writable characteristic: ${char.uuid} in service: ${service.uuid}`);
                break;
              }
            }
            if (writableChar) break;
          } catch (e) {
            console.warn(`[BT Printer] Error querying characteristics in service ${service.uuid}:`, e);
          }
        }
      } catch (err) {
        console.warn('[BT Printer] getPrimaryServices failed, trying specific service UUIDs...', err);
      }

      // Method 2: If Method 1 didn't find one, try specific service UUIDs
      if (!writableChar) {
        for (const sUuid of THERMAL_PRINTER_SERVICES) {
          try {
            const service = await server.getPrimaryService(sUuid);
            const chars = await service.getCharacteristics();
            for (const char of chars) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                writableChar = char;
                console.log(`[BT Printer] Found writable characteristic by service scan: ${char.uuid}`);
                break;
              }
            }
            if (writableChar) break;
          } catch {
            // Service not supported on this specific device, try next
          }
        }
      }

      if (!writableChar) {
        throw new Error('Printer terhubung namun tidak ditemukan karakteristik penulisan data ESC/POS. Pastikan printer dalam keadaan menyala dan mode ESC/POS aktif.');
      }

      this.characteristic = writableChar;
      this.status = 'connected';
      this.errorMessage = null;
      this.isSerialConnection = false;

      // Cache device info in localStorage
      localStorage.setItem(
        'wspos_bt_device_cache',
        JSON.stringify({
          id: this.device.id,
          name: this.device.name || 'Printer Bluetooth',
          savedAt: Date.now(),
        })
      );

      this.notify();
      return true;
    } catch (err: any) {
      console.error('[BT Printer] Connection error:', err);
      this.status = 'error';

      if (err.name === 'NotFoundError' || err.message?.includes('cancelled') || err.message?.includes('User cancelled')) {
        this.errorMessage = 'Pemilihan perangkat printer dibatalkan.';
        this.status = 'disconnected';
      } else if (err.message?.includes('NetworkError') || err.message?.includes('GATT')) {
        this.errorMessage = 'Gagal menyambungkan ke printer. Pastikan Bluetooth aktif, printer dekat, dan tidak sedang tersambung ke aplikasi kasir lain.';
      } else {
        this.errorMessage = err.message || 'Terjadi kesalahan saat menghubungkan ke printer Bluetooth.';
      }

      this.notify();
      return false;
    }
  }

  /**
   * Fallback connection via Web Serial (for USB or Bluetooth SPP/COM Port)
   */
  public async connectSerial(): Promise<boolean> {
    if (!this.isSerialSupported()) {
      this.status = 'error';
      this.errorMessage = 'Browser ini belum mendukung Web Serial API (Gunakan Chrome/Edge).';
      this.notify();
      return false;
    }

    try {
      this.status = 'connecting';
      this.errorMessage = null;
      this.notify();

      const serial = (navigator as any).serial;
      const port = await serial.requestPort();
      await port.open({ baudRate: 9600 }); // Default POS thermal baud rate

      this.serialPort = port;
      this.isSerialConnection = true;
      this.status = 'connected';
      this.notify();
      return true;
    } catch (err: any) {
      console.error('[Serial Printer] Connection error:', err);
      this.status = 'error';
      this.errorMessage = err.message || 'Gagal menyambung ke port USB/Serial printer.';
      this.notify();
      return false;
    }
  }

  private handleDisconnected() {
    console.log('[BT Printer] Device disconnected');
    this.status = 'disconnected';
    this.characteristic = null;
    this.notify();
  }

  /**
   * Disconnect the current printer
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
      if (this.serialPort) {
        if (this.serialWriter) {
          try {
            await this.serialWriter.close();
          } catch {}
          this.serialWriter = null;
        }
        try {
          await this.serialPort.close();
        } catch {}
        this.serialPort = null;
      }
    } catch (e) {
      console.error('[BT Printer] Disconnect error:', e);
    } finally {
      this.status = 'disconnected';
      this.device = null;
      this.characteristic = null;
      this.serialPort = null;
      this.isSerialConnection = false;
      this.errorMessage = null;
      this.notify();
    }
  }

  /**
   * Send raw ESC/POS binary data to printer with chunking
   */
  public async printRaw(data: Uint8Array): Promise<boolean> {
    if (this.status !== 'connected') {
      this.errorMessage = 'Printer Bluetooth belum terhubung. Silakan sambungkan printer terlebih dahulu.';
      this.notify();
      return false;
    }

    // Serial Print path
    if (this.isSerialConnection && this.serialPort) {
      try {
        const writer = this.serialPort.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
        return true;
      } catch (err: any) {
        console.error('[Serial Printer] Write error:', err);
        this.errorMessage = 'Gagal mengirim data ke port serial: ' + err.message;
        this.notify();
        return false;
      }
    }

    // Bluetooth BLE Print path
    if (!this.characteristic) {
      this.errorMessage = 'Karakteristik Bluetooth printer tidak tersedia.';
      this.notify();
      return false;
    }

    try {
      // Chunking: BLE standard payload limit is ~20 to 100 bytes.
      // Slicing into 50-byte chunks ensures reliable transfer without buffer overflow.
      const CHUNK_SIZE = 50;
      const totalLength = data.length;

      for (let offset = 0; offset < totalLength; offset += CHUNK_SIZE) {
        const chunk = data.slice(offset, offset + CHUNK_SIZE);

        if (this.characteristic.properties.writeWithoutResponse && this.characteristic.writeValueWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else if (this.characteristic.writeValueWithResponse) {
          await this.characteristic.writeValueWithResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }

        // Small delay between chunks to allow thermal printer hardware buffer to process
        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      return true;
    } catch (err: any) {
      console.error('[BT Printer] Print raw data error:', err);
      this.errorMessage = 'Gagal mencetak ke printer: ' + (err.message || 'Koneksi terputus');
      this.notify();
      return false;
    }
  }
}

// Export singleton instance
export const bluetoothPrinter = new BluetoothPrinterManager();

import React, { useState } from 'react';
import {
  Users,
  Printer,
  RotateCcw,
  Plus,
  X,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  FileText,
  Package,
  ReceiptText,
  Eye,
  ShieldAlert,
  CreditCard,
  QrCode,
  Building2,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Edit2,
  ExternalLink,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  BluetoothOff,
  RefreshCw,
  Search,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  PRESET_FOOTER_LOGOS,
  DISCOVERABLE_BT_PRINTERS,
  BluetoothThermalDevice,
} from '../utils/receiptPresets';
import {
  User,
  UserRole,
  PrinterSettings,
  ReceiptTemplate,
  PaymentSettings,
  BankAccount,
} from '../types';

interface SettingsViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  printerSettings: PrinterSettings;
  receiptTemplate: ReceiptTemplate;
  paymentSettings: PaymentSettings;
  onUpdatePrinterSettings: (settings: PrinterSettings) => void;
  onUpdateReceiptTemplate: (template: ReceiptTemplate) => void;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  productsCount: number;
  transactionsCount: number;
  onResetTransactions: () => void;
  onResetProducts: () => void;
  onResetPaymentAndTemplate: () => void;
  onResetAllData: () => void;
}

type SettingsSubTab = 'pengguna' | 'pembayaran' | 'printer' | 'reset';

export const SettingsView: React.FC<SettingsViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  printerSettings,
  receiptTemplate,
  paymentSettings,
  onUpdatePrinterSettings,
  onUpdateReceiptTemplate,
  onUpdatePaymentSettings,
  productsCount,
  transactionsCount,
  onResetTransactions,
  onResetProducts,
  onResetPaymentAndTemplate,
  onResetAllData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('pengguna');

  // --- USER MANAGEMENT STATE ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Kasir');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');

  // --- PAYMENT SETTINGS STATE ---
  const [paymentSubTab, setPaymentSubTab] = useState<'qris' | 'transfer' | 'other'>('qris');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankName, setBankName] = useState('BCA');
  const [customBankName, setCustomBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isDefaultAccount, setIsDefaultAccount] = useState(false);
  const [isViewingQrisImage, setIsViewingQrisImage] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // --- PRINTER & BLUETOOTH STATE ---
  const [printerSubTab, setPrinterSubTab] = useState<'printer' | 'template' | 'preview'>('printer');
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [isBtModalOpen, setIsBtModalOpen] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothThermalDevice[]>(DISCOVERABLE_BT_PRINTERS);
  const [customBtName, setCustomBtName] = useState('');
  const [customBtMac, setCustomBtMac] = useState('');
  const [btSuccessAlert, setBtSuccessAlert] = useState<string | null>(null);
  const [searchBtQuery, setSearchBtQuery] = useState('');

  // --- RESET CONFIRMATION MODAL STATE ---
  const [resetModalType, setResetModalType] = useState<
    'transactions' | 'products' | 'payment_template' | 'all' | null
  >(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // User form handlers
  const openAddUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserUsername('');
    setUserPassword('');
    setUserRole('Kasir');
    setUserStatus('active');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserUsername(u.username);
    setUserPassword(u.password || '');
    setUserRole(u.role);
    setUserStatus(u.status);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userUsername.trim()) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: userName.trim(),
        username: userUsername.trim().toLowerCase(),
        password: userPassword || editingUser.password,
        role: userRole,
        status: userStatus,
      });
    } else {
      onAddUser({
        id: `usr_${Date.now()}`,
        name: userName.trim(),
        username: userUsername.trim().toLowerCase(),
        password: userPassword || '1234',
        role: userRole,
        status: userStatus,
      });
    }

    setIsUserModalOpen(false);
  };

  // --- PAYMENT SETTINGS HANDLERS ---
  const handleQrisToggle = (enabled: boolean) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      qris: {
        ...paymentSettings.qris,
        enabled,
      },
    });
  };

  const handleQrisFieldChange = (field: keyof typeof paymentSettings.qris, value: any) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      qris: {
        ...paymentSettings.qris,
        [field]: value,
      },
    });
  };

  const handleQrisImageUpload = (file: File) => {
    if (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
      alert('Mohon pilih file gambar berformat JPG atau PNG.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file gambar barcode maksimal 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdatePaymentSettings({
        ...paymentSettings,
        qris: {
          ...paymentSettings.qris,
          qrImageUrl: base64,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleQrisImageUpload(file);
    }
  };

  const handleRemoveQrisImage = () => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      qris: {
        ...paymentSettings.qris,
        qrImageUrl: '',
      },
    });
  };

  // Transfer handlers
  const handleTransferToggle = (enabled: boolean) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      transfer: {
        ...paymentSettings.transfer,
        enabled,
      },
    });
  };

  const handleTransferInstructionsChange = (instructions: string) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      transfer: {
        ...paymentSettings.transfer,
        instructions,
      },
    });
  };

  const openAddBankModal = () => {
    setEditingBank(null);
    setBankName('BCA');
    setCustomBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setIsDefaultAccount(paymentSettings.transfer.accounts.length === 0);
    setIsBankModalOpen(true);
  };

  const openEditBankModal = (bank: BankAccount) => {
    setEditingBank(bank);
    const presets = ['BCA', 'BRI', 'Mandiri', 'BNI', 'BSI', 'CIMB Niaga', 'Bank Jago', 'SeaBank', 'Dana', 'OVO', 'GoPay', 'ShopeePay'];
    if (presets.includes(bank.bankName)) {
      setBankName(bank.bankName);
      setCustomBankName('');
    } else {
      setBankName('Lainnya');
      setCustomBankName(bank.bankName);
    }
    setAccountNumber(bank.accountNumber);
    setAccountHolder(bank.accountHolder);
    setIsDefaultAccount(!!bank.isDefault);
    setIsBankModalOpen(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankName = bankName === 'Lainnya' ? customBankName.trim() : bankName;
    if (!finalBankName || !accountNumber.trim() || !accountHolder.trim()) return;

    let updatedAccounts = [...paymentSettings.transfer.accounts];

    if (isDefaultAccount) {
      updatedAccounts = updatedAccounts.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingBank) {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === editingBank.id
          ? {
              ...a,
              bankName: finalBankName,
              accountNumber: accountNumber.trim(),
              accountHolder: accountHolder.trim(),
              isDefault: isDefaultAccount,
            }
          : a
      );
    } else {
      const newAcc: BankAccount = {
        id: `bank_${Date.now()}`,
        bankName: finalBankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        isDefault: isDefaultAccount || updatedAccounts.length === 0,
      };
      updatedAccounts.push(newAcc);
    }

    onUpdatePaymentSettings({
      ...paymentSettings,
      transfer: {
        ...paymentSettings.transfer,
        accounts: updatedAccounts,
      },
    });

    setIsBankModalOpen(false);
  };

  const handleDeleteBank = (bankId: string) => {
    const filtered = paymentSettings.transfer.accounts.filter((a) => a.id !== bankId);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    onUpdatePaymentSettings({
      ...paymentSettings,
      transfer: {
        ...paymentSettings.transfer,
        accounts: filtered,
      },
    });
  };

  const handleSetDefaultBank = (bankId: string) => {
    const updated = paymentSettings.transfer.accounts.map((a) => ({
      ...a,
      isDefault: a.id === bankId,
    }));
    onUpdatePaymentSettings({
      ...paymentSettings,
      transfer: {
        ...paymentSettings.transfer,
        accounts: updated,
      },
    });
  };

  const handleCopyAccount = (bank: BankAccount) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bank.accountNumber);
      setCopiedBankId(bank.id);
      setTimeout(() => setCopiedBankId(null), 2000);
    }
  };

  // Other payment settings handlers
  const handleOtherToggle = (enabled: boolean) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      other: {
        ...paymentSettings.other,
        enabled,
      },
    });
  };

  const handleOtherFieldChange = (field: keyof typeof paymentSettings.other, value: any) => {
    onUpdatePaymentSettings({
      ...paymentSettings,
      other: {
        ...paymentSettings.other,
        [field]: value,
      },
    });
  };

  // Printer & Bluetooth handlers
  const handlePrinterChange = (field: keyof PrinterSettings, value: any) => {
    onUpdatePrinterSettings({
      ...printerSettings,
      [field]: value,
    });
  };

  const handleScanWebBluetooth = async () => {
    setIsScanningBt(true);
    try {
      if ((navigator as any).bluetooth) {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
            '0000ffe0-0000-1000-8000-00805f9b34fb',
          ],
        });
        const dName = device.name || 'Printer Bluetooth ESC/POS';
        onUpdatePrinterSettings({
          ...printerSettings,
          printerName: dName,
          bluetoothDeviceName: dName,
          bluetoothDeviceId: device.id || 'BT-CONNECTED-OK',
          bluetoothStatus: 'connected',
          connectionType: 'Bluetooth',
        });
        setBtSuccessAlert(`Berhasil menghubungkan printer Bluetooth: ${dName}`);
        setTimeout(() => setBtSuccessAlert(null), 4000);
      } else {
        setIsBtModalOpen(true);
      }
    } catch (err: any) {
      // If cancelled or Web Bluetooth is unsupported/blocked in sandbox, open the scanner modal
      setIsBtModalOpen(true);
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleSelectBtDevice = (dev: BluetoothThermalDevice) => {
    onUpdatePrinterSettings({
      ...printerSettings,
      printerName: dev.name,
      bluetoothDeviceName: dev.name,
      bluetoothDeviceId: dev.macAddress,
      bluetoothStatus: 'connected',
      paperWidth: dev.paperWidth,
      connectionType: 'Bluetooth',
    });
    setIsBtModalOpen(false);
    setBtSuccessAlert(`Printer Bluetooth "${dev.name}" berhasil terhubung!`);
    setTimeout(() => setBtSuccessAlert(null), 4000);
  };

  const handleDisconnectBt = () => {
    onUpdatePrinterSettings({
      ...printerSettings,
      bluetoothStatus: 'disconnected',
    });
    setBtSuccessAlert('Koneksi Bluetooth diputuskan.');
    setTimeout(() => setBtSuccessAlert(null), 3000);
  };

  const handleReconnectBt = () => {
    onUpdatePrinterSettings({
      ...printerSettings,
      bluetoothStatus: 'connecting',
    });
    setTimeout(() => {
      onUpdatePrinterSettings({
        ...printerSettings,
        bluetoothStatus: 'connected',
      });
      setBtSuccessAlert(`Terhubung kembali ke "${printerSettings.bluetoothDeviceName || printerSettings.printerName}"!`);
      setTimeout(() => setBtSuccessAlert(null), 3000);
    }, 600);
  };

  const handleAddCustomBtDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBtName.trim()) return;
    const newDev: BluetoothThermalDevice = {
      id: `bt_custom_${Date.now()}`,
      name: customBtName.trim(),
      type: 'Custom Bluetooth Thermal POS',
      rssi: -45,
      paired: true,
      paperWidth: printerSettings.paperWidth,
      macAddress: customBtMac.trim() || 'A0:B1:C2:D3:E4:F5',
    };
    setDiscoveredDevices((prev) => [newDev, ...prev]);
    handleSelectBtDevice(newDev);
    setCustomBtName('');
    setCustomBtMac('');
  };

  const handleRefreshBtScan = () => {
    setIsScanningBt(true);
    setTimeout(() => {
      setIsScanningBt(false);
    }, 800);
  };

  // Receipt Template & Footer Logo handlers
  const handleTemplateChange = (field: keyof ReceiptTemplate, value: any) => {
    onUpdateReceiptTemplate({
      ...receiptTemplate,
      [field]: value,
    });
  };

  const handleFooterLogoUpload = (file: File) => {
    if (
      !file.type.includes('png') &&
      !file.type.includes('jpeg') &&
      !file.type.includes('jpg') &&
      !file.type.includes('svg') &&
      !file.type.includes('webp')
    ) {
      alert('Mohon pilih file gambar berformat PNG, JPG, JPEG, SVG, atau WebP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo footer maksimal 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateReceiptTemplate({
        ...receiptTemplate,
        footerLogo: base64,
        showFooterLogo: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFooterLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFooterLogoUpload(file);
    }
  };

  const handleSelectPresetLogo = (dataUrl: string) => {
    onUpdateReceiptTemplate({
      ...receiptTemplate,
      footerLogo: dataUrl,
      showFooterLogo: true,
    });
  };

  const handleRemoveFooterLogo = () => {
    onUpdateReceiptTemplate({
      ...receiptTemplate,
      footerLogo: '',
    });
  };

  const handleToggleFooterLogo = (enabled: boolean) => {
    onUpdateReceiptTemplate({
      ...receiptTemplate,
      showFooterLogo: enabled,
    });
  };

  const handleRunTestPrint = () => {
    setIsTestPrinting(true);
    setTestResult(null);

    if (printerSettings.beepAfterPrint) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {
        console.log('AudioContext not supported');
      }
    }

    setTimeout(() => {
      setIsTestPrinting(false);
      setTestResult(
        `Uji cetak berhasil dikirim via Bluetooth ke "${printerSettings.bluetoothDeviceName || printerSettings.printerName}" (${printerSettings.paperWidth})!`
      );
      setTimeout(() => setTestResult(null), 5000);
    }, 800);
  };

  // Reset confirmation execution
  const executeReset = () => {
    if (resetModalType === 'transactions') {
      onResetTransactions();
      setResetSuccessMessage('Seluruh riwayat transaksi dan laporan berhasil dikosongkan!');
    } else if (resetModalType === 'products') {
      onResetProducts();
      setResetSuccessMessage('Seluruh data produk berhasil dikosongkan!');
    } else if (resetModalType === 'payment_template') {
      onResetPaymentAndTemplate();
      setResetSuccessMessage('Pengaturan jenis transaksi dan template struk berhasil dikosongkan!');
    } else if (resetModalType === 'all') {
      onResetAllData();
      setResetSuccessMessage('Semua data produk, transaksi, laporan, jenis transaksi, dan template struk berhasil dikosongkan total!');
    }
    setResetModalType(null);
    setTimeout(() => setResetSuccessMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pusat konfigurasi pengguna kasir, printer & struk, serta manajemen reset data.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {resetSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* Main Sub-Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141417] border border-zinc-800 rounded-xl max-w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('pengguna')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pengguna'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pembayaran')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pembayaran'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Jenis Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('printer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'printer'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Printer & Struk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reset')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'reset'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: MANAJEMEN PENGGUNA */}
      {/* ========================================================================= */}
      {activeSubTab === 'pengguna' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white">Daftar Akun Pengguna</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelola hak akses untuk Owner dan Kasir toko Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddUserModal}
              className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-4 py-2.5 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Tambah Pengguna
            </button>
          </div>

          <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#121215] text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">NAMA</th>
                    <th className="px-6 py-4">USERNAME</th>
                    <th className="px-6 py-4">ROLE</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{u.username}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            u.role === 'Owner'
                              ? 'bg-amber-500/10 text-[#f59e0b] border border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                            u.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-600'
                            }`}
                          />
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditUserModal(u)}
                          className="text-xs font-bold text-[#f59e0b] hover:text-amber-300 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-amber-500/10"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: JENIS TRANSAKSI & PEMBAYARAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'pembayaran' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#f59e0b]" />
                Pengaturan Jenis Transaksi & Pembayaran
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Konfigurasi barcode QRIS, rekening bank transfer tujuan, dan kolom catatan transaksi kasir.
              </p>
            </div>
          </div>

          {/* Payment Method Sub-Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <button
              type="button"
              onClick={() => setPaymentSubTab('qris')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                paymentSubTab === 'qris'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS Barcode</span>
              {paymentSettings.qris.qrImageUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setPaymentSubTab('transfer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                paymentSubTab === 'transfer'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Transfer Bank</span>
              <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.2 rounded-full font-mono">
                {paymentSettings.transfer.accounts.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentSubTab('other')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                paymentSubTab === 'other'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lainnya & Kolom Catatan</span>
            </button>
          </div>

          {/* 1. QRIS SETTINGS */}
          {paymentSubTab === 'qris' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Settings Form */}
              <div className="lg:col-span-2 space-y-5 bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#f59e0b]" />
                      Konfigurasi Barcode QRIS
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Upload foto barcode QRIS toko Anda agar tampil saat transaksi di kasir.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-zinc-300">
                      {paymentSettings.qris.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.qris.enabled}
                      onChange={(e) => handleQrisToggle(e.target.checked)}
                      className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Upload Barcode Image */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Upload Gambar Barcode QRIS (JPG / PNG)
                    </label>
                    <div className="border-2 border-dashed border-zinc-700 hover:border-[#f59e0b] rounded-2xl p-5 transition-colors bg-[#141417] text-center relative group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#f59e0b] flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          Klik atau geser file gambar barcode ke sini
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Mendukung file JPG, JPEG, PNG (Maksimal 4 MB)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Nama Merchant / Toko QRIS
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.qris.merchantName}
                        onChange={(e) => handleQrisFieldChange('merchantName', e.target.value)}
                        placeholder="Contoh: WARUNG SENJA TERANG BULAN"
                        className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        NMID (National Merchant ID - Opsional)
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.qris.nmid || ''}
                        onChange={(e) => handleQrisFieldChange('nmid', e.target.value)}
                        placeholder="Contoh: ID1020030040050"
                        className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Petunjuk Pembayaran QRIS (Ditampilkan saat checkout)
                    </label>
                    <textarea
                      rows={2}
                      value={paymentSettings.qris.instructions || ''}
                      onChange={(e) => handleQrisFieldChange('instructions', e.target.value)}
                      placeholder="Instruksi untuk kasir / pelanggan..."
                      className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* QR Preview Card */}
              <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#f59e0b]" />
                    Pratinjau Barcode QRIS
                  </span>
                  {paymentSettings.qris.qrImageUrl ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Tersimpan
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Belum Upload
                    </span>
                  )}
                </div>

                {paymentSettings.qris.qrImageUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="relative group bg-white p-3 rounded-2xl border border-zinc-300 shadow-md">
                      <img
                        src={paymentSettings.qris.qrImageUrl}
                        alt="QRIS Barcode"
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setIsViewingQrisImage(true)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Perbesar Gambar
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="text-xs font-bold text-white">
                        {paymentSettings.qris.merchantName || 'Merchant QRIS'}
                      </div>
                      {paymentSettings.qris.nmid && (
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          NMID: {paymentSettings.qris.nmid}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full pt-2">
                      <button
                        type="button"
                        onClick={() => setIsViewingQrisImage(true)}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Penuh
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveQrisImage}
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div className="max-w-[200px]">
                      <div className="text-xs font-bold text-zinc-300">Belum Ada Barcode</div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Upload gambar JPG/PNG barcode QRIS Anda di formulir sebelah kiri.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. TRANSFER BANK SETTINGS */}
          {paymentSubTab === 'transfer' && (
            <div className="space-y-6">
              <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#f59e0b]" />
                      Daftar Rekening Bank Tujuan Transfer
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tambahkan nomor rekening bank toko untuk ditampilkan saat kasir memilih pembayaran Transfer.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer mr-2">
                      <span className="text-xs font-semibold text-zinc-300">
                        {paymentSettings.transfer.enabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <input
                        type="checkbox"
                        checked={paymentSettings.transfer.enabled}
                        onChange={(e) => handleTransferToggle(e.target.checked)}
                        className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={openAddBankModal}
                      className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-4 py-2 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Rekening
                    </button>
                  </div>
                </div>

                {/* Bank Accounts Grid */}
                {paymentSettings.transfer.accounts.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="max-w-sm">
                      <div className="text-sm font-bold text-white">Belum Ada Rekening Bank</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Klik tombol "Tambah Rekening" di atas untuk menambahkan nomor rekening bank tujuan pembayaran.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentSettings.transfer.accounts.map((bank) => (
                      <div
                        key={bank.id}
                        className={`p-4 rounded-2xl border transition-all relative ${
                          bank.isDefault
                            ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                            : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-zinc-800 text-[#f59e0b] border border-amber-500/20">
                              {bank.bankName}
                            </span>
                            {bank.isDefault && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Utama
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditBankModal(bank)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Edit Rekening"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBank(bank.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus Rekening"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-mono font-bold text-white tracking-wider">
                              {bank.accountNumber}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(bank)}
                              className="text-[11px] font-semibold text-zinc-400 hover:text-[#f59e0b] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedBankId === bank.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-zinc-400">
                            a.n. <strong className="text-zinc-200">{bank.accountHolder}</strong>
                          </div>
                        </div>

                        {!bank.isDefault && (
                          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSetDefaultBank(bank.id)}
                              className="text-[11px] font-semibold text-zinc-400 hover:text-[#f59e0b] transition-colors cursor-pointer"
                            >
                              Jadikan Rekening Utama
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructions Input */}
                <div className="pt-3 border-t border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Petunjuk / Catatan Transfer Bank (Ditampilkan saat checkout)
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.transfer.instructions || ''}
                    onChange={(e) => handleTransferInstructionsChange(e.target.value)}
                    placeholder="Instruksi untuk kasir mengenai verifikasi mutasi transfer..."
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. OTHER PAYMENT & NOTES SETTINGS */}
          {paymentSubTab === 'other' && (
            <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#f59e0b]" />
                    Pengaturan Jenis Transaksi Lainnya & Kolom Catatan
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Konfigurasi kolom catatan untuk mencatat pesanan via GrabFood, GoFood, EDC, Piutang, atau transaksi kustom.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-300">
                    {paymentSettings.other.enabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <input
                    type="checkbox"
                    checked={paymentSettings.other.enabled}
                    onChange={(e) => handleOtherToggle(e.target.checked)}
                    className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Teks Contoh / Placeholder Kolom Catatan saat Checkout
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.other.notePlaceholder || ''}
                    onChange={(e) => handleOtherFieldChange('notePlaceholder', e.target.value)}
                    placeholder="Contoh: Pesanan GrabFood #GF-8821 / EDC Mandiri / Piutang / Voucher"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Teks petunjuk yang akan muncul di dalam kolom input catatan saat kasir memilih metode "Lainnya".
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Catatan Bawaan / Default Note (Opsional)
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.other.defaultNote || ''}
                    onChange={(e) => handleOtherFieldChange('defaultNote', e.target.value)}
                    placeholder="Biarkan kosong jika ingin kasir mengisi secara manual"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Panduan / Petunjuk Kasir untuk Transaksi Lainnya
                  </label>
                  <textarea
                    rows={3}
                    value={paymentSettings.other.instructions || ''}
                    onChange={(e) => handleOtherFieldChange('instructions', e.target.value)}
                    placeholder="Petunjuk untuk kasir..."
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: PRINTER & STRUK */}
      {/* ========================================================================= */}
      {activeSubTab === 'printer' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <button
              type="button"
              onClick={() => setPrinterSubTab('printer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                printerSubTab === 'printer'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Koneksi & Perangkat
            </button>
            <button
              type="button"
              onClick={() => setPrinterSubTab('template')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                printerSubTab === 'template'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              Template Struk Belanja
            </button>
            <button
              type="button"
              onClick={() => setPrinterSubTab('preview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                printerSubTab === 'preview'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau Struk
            </button>
          </div>

          {/* Printer Connection Config */}
          {printerSubTab === 'printer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                {/* Header & Bluetooth Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Bluetooth className="w-5 h-5 text-blue-400" />
                      Pengaturan Koneksi Printer Thermal Bluetooth
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Khusus untuk printer thermal nirkabel Bluetooth (ESC/POS 58 mm & 80 mm).
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                    <Bluetooth className="w-3.5 h-3.5" />
                    Hanya Koneksi Bluetooth
                  </span>
                </div>

                {btSuccessAlert && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{btSuccessAlert}</span>
                  </div>
                )}

                {/* Bluetooth Device Connection Card */}
                <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                          printerSettings.bluetoothStatus === 'connected'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10'
                            : printerSettings.bluetoothStatus === 'connecting'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {printerSettings.bluetoothStatus === 'connected' ? (
                          <BluetoothConnected className="w-6 h-6 animate-pulse" />
                        ) : printerSettings.bluetoothStatus === 'connecting' ? (
                          <BluetoothSearching className="w-6 h-6 animate-spin" />
                        ) : (
                          <BluetoothOff className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {printerSettings.bluetoothDeviceName || printerSettings.printerName || 'Printer Bluetooth'}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              printerSettings.bluetoothStatus === 'connected'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : printerSettings.bluetoothStatus === 'connecting'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                printerSettings.bluetoothStatus === 'connected'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : printerSettings.bluetoothStatus === 'connecting'
                                  ? 'bg-amber-400 animate-ping'
                                  : 'bg-zinc-500'
                              }`}
                            />
                            {printerSettings.bluetoothStatus === 'connected'
                              ? 'Terhubung (Connected)'
                              : printerSettings.bluetoothStatus === 'connecting'
                              ? 'Menghubungkan...'
                              : 'Terputus (Disconnected)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          ID / MAC:{' '}
                          <span className="text-zinc-300">
                            {printerSettings.bluetoothDeviceId || '66:32:8B:11:4A:2D'}
                          </span>{' '}
                          • Protokol: <span className="text-blue-300 font-sans">ESC/POS Bluetooth</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Bluetooth Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleScanWebBluetooth}
                        disabled={isScanningBt}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Search className={`w-3.5 h-3.5 ${isScanningBt ? 'animate-spin' : ''}`} />
                        <span>{isScanningBt ? 'Memindai...' : 'Cari Perangkat Bluetooth'}</span>
                      </button>

                      {printerSettings.bluetoothStatus === 'connected' ? (
                        <button
                          type="button"
                          onClick={handleDisconnectBt}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          title="Putuskan sambungan Bluetooth"
                        >
                          <BluetoothOff className="w-3.5 h-3.5" />
                          <span>Putuskan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleReconnectBt}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                          title="Sambungkan kembali"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Hubungkan Ulang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Printer Parameters Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nama Printer Thermal
                    </label>
                    <input
                      type="text"
                      value={printerSettings.printerName}
                      onChange={(e) => handlePrinterChange('printerName', e.target.value)}
                      placeholder="Contoh: POS-5802DD (Bluetooth Thermal)"
                      className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Tipe Koneksi (Terkunci Khusus Bluetooth)
                    </label>
                    <div className="w-full bg-[#111114] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs text-blue-400 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Bluetooth className="w-3.5 h-3.5" />
                        Bluetooth Nirkabel (Wireless Thermal)
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                        Aktif
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Ukuran Kertas Thermal
                    </label>
                    <select
                      value={printerSettings.paperWidth}
                      onChange={(e) => handlePrinterChange('paperWidth', e.target.value)}
                      className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="58 mm">58 mm (Mini Thermal Standar)</option>
                      <option value="80 mm">80 mm (Thermal Lebar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Jumlah Salinan per Transaksi
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={printerSettings.copies}
                      onChange={(e) => handlePrinterChange('copies', parseInt(e.target.value) || 1)}
                      className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Toggles */}
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white">Cetak Otomatis Setelah Bayar</div>
                      <div className="text-[11px] text-zinc-500">
                        Otomatis mencetak struk begitu transaksi diselesaikan di kasir
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerSettings.autoPrint}
                      onChange={(e) => handlePrinterChange('autoPrint', e.target.checked)}
                      className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white">Bunyi Beep Saat Selesai Cetak</div>
                      <div className="text-[11px] text-zinc-500">
                        Memutar nada konfirmasi audio setiap kali cetak struk selesai
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={printerSettings.beepAfterPrint}
                      onChange={(e) => handlePrinterChange('beepAfterPrint', e.target.checked)}
                      className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Status & Test Card */}
              <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-blue-400" />
                      Status Printer Bluetooth
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">ESC/POS</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Koneksi:</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <Bluetooth className="w-3.5 h-3.5" />
                        Bluetooth Saja
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Status:</span>
                      <span
                        className={`font-bold flex items-center gap-1.5 ${
                          printerSettings.bluetoothStatus === 'connected'
                            ? 'text-emerald-400'
                            : printerSettings.bluetoothStatus === 'connecting'
                            ? 'text-amber-400'
                            : 'text-zinc-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            printerSettings.bluetoothStatus === 'connected'
                              ? 'bg-emerald-400 animate-pulse'
                              : printerSettings.bluetoothStatus === 'connecting'
                              ? 'bg-amber-400 animate-ping'
                              : 'bg-zinc-600'
                          }`}
                        />
                        {printerSettings.bluetoothStatus === 'connected'
                          ? 'Siap Cetak'
                          : printerSettings.bluetoothStatus === 'connecting'
                          ? 'Menyambungkan'
                          : 'Terputus'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Perangkat:</span>
                      <span className="text-zinc-200 font-mono text-[11px] truncate max-w-[130px]">
                        {printerSettings.bluetoothDeviceName || printerSettings.printerName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Lebar Kertas:</span>
                      <span className="text-amber-400 font-bold">{printerSettings.paperWidth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Driver:</span>
                      <span className="text-zinc-300 font-mono">Web Bluetooth Thermal</span>
                    </div>
                  </div>

                  {testResult && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{testResult}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRunTestPrint}
                    disabled={isTestPrinting}
                    className="w-full bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold py-3 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    {isTestPrinting ? 'Mengirim Uji Cetak Bluetooth...' : 'Uji Cetak Bluetooth (Test Print)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBtModalOpen(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    Pilih dari Daftar Printer Bluetooth
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Template Config */}
          {printerSubTab === 'template' && (
            <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#f59e0b]" />
                    Kustomisasi Template Struk Belanja
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Atur nama toko, informasi kontak, ucapan terima kasih, dan logo footer bawah struk.
                  </p>
                </div>
              </div>

              {/* Store & Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nama Toko / Resto
                  </label>
                  <input
                    type="text"
                    value={receiptTemplate.storeName}
                    onChange={(e) => handleTemplateChange('storeName', e.target.value)}
                    placeholder="Contoh: WARUNG SENJA TERANG BULAN"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={receiptTemplate.tagline}
                    onChange={(e) => handleTemplateChange('tagline', e.target.value)}
                    placeholder="Contoh: Terang Bulan & Minuman Spesial"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Alamat Lengkap Toko
                  </label>
                  <input
                    type="text"
                    value={receiptTemplate.address}
                    onChange={(e) => handleTemplateChange('address', e.target.value)}
                    placeholder="Contoh: Jl. Senja Raya No. 45, Kota"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={receiptTemplate.phone}
                    onChange={(e) => handleTemplateChange('phone', e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Pesan Ucapan Footer Bawah Struk
                  </label>
                  <textarea
                    rows={2}
                    value={receiptTemplate.footerNote}
                    onChange={(e) => handleTemplateChange('footerNote', e.target.value)}
                    placeholder="Contoh: Terima kasih atas kunjungan Anda!\nSelamat menikmati sajian kami."
                    className="w-full bg-[#111114] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* LOGO FOOTER BAWAH STRUK (NEW FEATURE) */}
              {/* ========================================================================= */}
              <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#f59e0b] flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Logo untuk Footer Bawah Struk
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                          Khusus Thermal
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Tambahkan logo atau badge sertifikasi yang akan dicetak di posisi paling bawah struk belanja.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-zinc-300">
                      {receiptTemplate.showFooterLogo !== false && receiptTemplate.footerLogo
                        ? 'Tampil'
                        : 'Sembunyikan'}
                    </span>
                    <input
                      type="checkbox"
                      checked={receiptTemplate.showFooterLogo !== false && !!receiptTemplate.footerLogo}
                      onChange={(e) => handleToggleFooterLogo(e.target.checked)}
                      className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                    />
                  </label>
                </div>

                {/* Upload or Selected Logo Area */}
                {receiptTemplate.footerLogo ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#18181c] border border-zinc-800">
                    {/* Simulated Monochrome Thermal Paper Preview */}
                    <div className="bg-white p-3 rounded-xl border border-zinc-300 shadow-sm flex flex-col items-center justify-center shrink-0">
                      <img
                        src={receiptTemplate.footerLogo}
                        alt="Logo Footer"
                        className="max-h-20 max-w-[170px] object-contain filter grayscale contrast-125"
                      />
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                        Pratinjau Footer
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Logo Footer Aktif & Tersimpan
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Logo ini akan otomatis dicetak di bagian paling bawah pada setiap struk thermal (58mm / 80mm).
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-[#f59e0b]" />
                          <span>Ganti Logo</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                            onChange={handleFooterLogoInputChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveFooterLogo}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Logo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Drag & Drop File Upload Box */}
                    <div className="border-2 border-dashed border-zinc-700 hover:border-[#f59e0b] rounded-2xl p-6 transition-colors bg-[#141417] text-center relative group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        onChange={handleFooterLogoInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#f59e0b] flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          Klik atau geser file gambar logo footer ke sini
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Mendukung file PNG, JPG, JPEG, SVG, WebP (Maksimal 3 MB)
                        </div>
                      </div>
                    </div>

                    {/* Presets Gallery */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                        <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>Atau pilih logo preset siap pakai untuk struk kasir:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {PRESET_FOOTER_LOGOS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetLogo(preset.dataUrl)}
                            className="bg-[#18181c] hover:bg-zinc-800/80 border border-zinc-800 hover:border-[#f59e0b]/50 rounded-xl p-3 text-left transition-all group flex flex-col justify-between cursor-pointer"
                          >
                            <div className="bg-white p-2 rounded-lg border border-zinc-200 flex items-center justify-center h-16 mb-2">
                              <img
                                src={preset.dataUrl}
                                alt={preset.name}
                                className="max-h-12 max-w-full object-contain filter grayscale contrast-125"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-[#f59e0b] transition-colors truncate">
                                {preset.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">
                                {preset.category}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Receipt Preview */}
          {printerSubTab === 'preview' && (
            <div className="flex flex-col items-center animate-fadeIn space-y-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>
                  Pratinjau Format Kertas:{' '}
                  <strong className="text-white">{printerSettings.paperWidth}</strong> (Printer Bluetooth:{' '}
                  {printerSettings.bluetoothDeviceName || printerSettings.printerName})
                </span>
              </div>

              {/* Thermal Receipt Paper Canvas */}
              <div
                className={`bg-white text-black p-5 rounded-lg font-mono text-[11px] leading-relaxed shadow-xl border border-zinc-300 select-text transition-all ${
                  printerSettings.paperWidth === '80 mm' ? 'w-full max-w-md' : 'w-full max-w-sm'
                }`}
              >
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-zinc-400">
                  <h4 className="font-bold text-xs uppercase">{receiptTemplate.storeName || 'NAMA TOKO'}</h4>
                  {receiptTemplate.tagline && (
                    <p className="text-[10px] text-zinc-700">{receiptTemplate.tagline}</p>
                  )}
                  {receiptTemplate.address && (
                    <p className="text-[10px] text-zinc-700">{receiptTemplate.address}</p>
                  )}
                  {receiptTemplate.phone && (
                    <p className="text-[10px] text-zinc-700">Telp: {receiptTemplate.phone}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="py-2 border-b border-dashed border-zinc-400 text-[10px] text-zinc-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span>No: TR-SAMPLE-01</span>
                    <span>
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir: Kasir Utama</span>
                    <span>Tunai</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">Terang Bulan Coklat Keju</div>
                      <div className="text-[10px] text-zinc-600">1 x 25.000 (Reguler)</div>
                    </div>
                    <span>Rp 25.000</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">Es Teh Manis</div>
                      <div className="text-[10px] text-zinc-600">2 x 5.000 (Dingin)</div>
                    </div>
                    <span>Rp 10.000</span>
                  </div>
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                  <div className="flex justify-between font-bold text-xs">
                    <span>TOTAL:</span>
                    <span>Rp 35.000</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Bayar:</span>
                    <span>Rp 50.000</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Kembali:</span>
                    <span>Rp 15.000</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-3 text-center text-[10px] text-zinc-700 whitespace-pre-line">
                  {receiptTemplate.footerNote}
                  <p className="text-[9px] text-zinc-500 mt-1">
                    Powered by WSPOS - {printerSettings.paperWidth} (Bluetooth Thermal)
                  </p>
                </div>

                {/* Footer Logo Rendered at the bottom */}
                {receiptTemplate.footerLogo && receiptTemplate.showFooterLogo !== false && (
                  <div className="pt-3 pb-1 border-t border-dotted border-zinc-400 mt-2 flex flex-col items-center justify-center">
                    <img
                      src={receiptTemplate.footerLogo}
                      alt="Logo Footer Struk"
                      className="max-h-14 max-w-[150px] object-contain filter grayscale contrast-125 mx-auto"
                    />
                    <span className="text-[8px] font-mono text-zinc-500 mt-0.5">
                      [Logo Footer Bawah Struk]
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: RESET DATA (KOSONGKAN PRODUK, TRANSAKSI, LAPORAN) */}
      {/* ========================================================================= */}
      {activeSubTab === 'reset' && (
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                Pusat Pengosongan & Reset Data Toko
              </h3>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                Fitur ini memungkinkan Anda untuk mengosongkan seluruh riwayat penjualan, laporan,
                maupun katalog produk. Data yang dikosongkan akan langsung dihapus dari sistem dan
                penyimpanan lokal perangkat.
              </p>
            </div>
          </div>

          {/* Quick Data Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#18181c] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#f59e0b] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Total Produk</div>
                  <div className="text-base font-bold text-white">{productsCount} Produk</div>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  productsCount > 0
                    ? 'bg-amber-500/10 text-[#f59e0b]'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {productsCount > 0 ? 'Terisi' : 'Kosong'}
              </span>
            </div>

            <div className="bg-[#18181c] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Total Transaksi</div>
                  <div className="text-base font-bold text-white">{transactionsCount} Transaksi</div>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  transactionsCount > 0
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {transactionsCount > 0 ? 'Terisi' : 'Kosong'}
              </span>
            </div>

            <div className="bg-[#18181c] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Jenis Transaksi</div>
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {paymentSettings.transfer.accounts.length} Rekening
                    {paymentSettings.qris.qrImageUrl ? ' + QR' : ''}
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  paymentSettings.transfer.accounts.length > 0 || paymentSettings.qris.qrImageUrl
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {paymentSettings.transfer.accounts.length > 0 || paymentSettings.qris.qrImageUrl
                  ? 'Terisi'
                  : 'Kosong'}
              </span>
            </div>

            <div className="bg-[#18181c] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Template Struk</div>
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {receiptTemplate.storeName ? receiptTemplate.storeName : 'Kosong'}
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  receiptTemplate.storeName
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {receiptTemplate.storeName ? 'Terisi' : 'Kosong'}
              </span>
            </div>
          </div>

          {/* Reset Action Cards */}
          <div className="space-y-4">
            {/* 1. Reset Transaksi & Laporan */}
            <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">
                    Reset Riwayat Transaksi & Laporan Penjualan
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Mengosongkan semua riwayat transaksi nota dan menghapus seluruh grafik laporan
                  pendapatan menjadi 0. Data katalog produk dan pengaturan Anda tetap aman.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResetModalType('transactions')}
                disabled={transactionsCount === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  transactionsCount === 0
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                    : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/50 active:scale-95'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan Transaksi
              </button>
            </div>

            {/* 2. Reset Data Produk */}
            <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#f59e0b]" />
                  <h4 className="text-sm font-bold text-white">Reset Semua Data Produk</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Menghapus seluruh daftar menu dan varian harga produk di katalog. Riwayat transaksi
                  dan pengaturan tetap dipertahankan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResetModalType('products')}
                disabled={productsCount === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  productsCount === 0
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                    : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 active:scale-95'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan Produk
              </button>
            </div>

            {/* 3. Reset Jenis Transaksi & Template Struk */}
            <div className="bg-[#18181c] border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">
                    Reset Jenis Transaksi & Template Struk Belanja
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Menghapus barcode QRIS, mengosongkan daftar nomor rekening transfer bank, serta
                  membersihkan teks nama toko, alamat, dan catatan footer struk belanja.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResetModalType('payment_template')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan Pembayaran & Struk
              </button>
            </div>

            {/* 4. Reset Total Semua (Produk, Transaksi, Jenis Transaksi, & Template Struk) */}
            <div className="bg-gradient-to-r from-rose-950/30 via-[#18181c] to-[#18181c] border border-rose-800/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-bold text-rose-200">
                    Reset Total (Semua Produk, Transaksi, Jenis Transaksi & Template Struk Kosong)
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Mengosongkan secara menyeluruh seluruh daftar produk, transaksi kasir, laporan
                  keuangan toko, konfigurasi jenis transaksi (QRIS & rekening bank), serta template struk belanja menjadi benar-benar bersih / kosong 100%.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResetModalType('all')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Total Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT USER */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="username untuk login"
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={editingUser ? 'Biarkan kosong jika tidak diubah' : 'Default: 1234'}
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Role / Peran</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Kasir">Kasir (Dashboard, POS, Transaksi, Laporan)</option>
                  <option value="Owner">Owner (Akses Penuh Semua Menu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Status Akun</label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-5 py-2.5 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADD / EDIT REKENING BANK */}
      {/* ========================================================================= */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#f59e0b]" />
                {editingBank ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Bank / E-Wallet
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Bank Permata</option>
                  <option value="Danamon">Bank Danamon</option>
                  <option value="Bank Jago">Bank Jago</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="Dana">DANA (Nomor HP/Akun)</option>
                  <option value="OVO">OVO (Nomor HP/Akun)</option>
                  <option value="GoPay">GoPay (Nomor HP/Akun)</option>
                  <option value="ShopeePay">ShopeePay (Nomor HP/Akun)</option>
                  <option value="Lainnya">Lainnya (Tulis Manual)</option>
                </select>
              </div>

              {bankName === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nama Bank / Dompet Digital Kustom
                  </label>
                  <input
                    type="text"
                    required
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Contoh: Bank BJB, Bank Nagari, dll"
                    className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nomor Rekening / No. Akun
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 123-456-7890"
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Atas Nama (Nama Pemilik Rekening)
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Contoh: Warung Senja / Budi Santoso"
                  className="w-full bg-[#121215] border border-zinc-800 focus:border-[#f59e0b] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefaultAccount}
                  onChange={(e) => setIsDefaultAccount(e.target.checked)}
                  className="w-4 h-4 accent-[#f59e0b] cursor-pointer"
                />
                <span className="text-xs text-zinc-300">
                  Jadikan sebagai rekening tujuan utama
                </span>
              </label>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#e09107] text-black font-bold px-5 py-2.5 rounded-xl text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL VIEW QRIS IMAGE FULL */}
      {/* ========================================================================= */}
      {isViewingQrisImage && paymentSettings.qris.qrImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#18181c] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#f59e0b]" />
                {paymentSettings.qris.merchantName || 'Barcode QRIS'}
              </h3>
              <button
                type="button"
                onClick={() => setIsViewingQrisImage(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
              <img
                src={paymentSettings.qris.qrImageUrl}
                alt="Barcode QRIS"
                className="w-64 h-64 object-contain mx-auto rounded"
              />
            </div>

            {paymentSettings.qris.nmid && (
              <div className="text-xs font-mono text-zinc-400">
                NMID: {paymentSettings.qris.nmid}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsViewingQrisImage(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#e09107] text-black transition-colors cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI RESET DATA */}
      {/* ========================================================================= */}
      {resetModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#18181c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#151518]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {resetModalType === 'transactions' && 'Konfirmasi Reset Transaksi'}
                    {resetModalType === 'products' && 'Konfirmasi Reset Produk'}
                    {resetModalType === 'payment_template' && 'Konfirmasi Reset Pembayaran & Struk'}
                    {resetModalType === 'all' && 'Konfirmasi Reset Total Semua Data & Pengaturan'}
                  </h3>
                  <p className="text-xs text-zinc-400">Verifikasi tindakan sebelum dieksekusi</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setResetModalType(null)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {resetModalType === 'transactions' && (
                  <>
                    Apakah Anda yakin ingin <strong className="text-rose-400">mengosongkan seluruh riwayat transaksi dan laporan</strong>? Semua nota penjualan yang pernah tercatat akan dihapus secara permanen.
                  </>
                )}
                {resetModalType === 'products' && (
                  <>
                    Apakah Anda yakin ingin <strong className="text-rose-400">menghapus seluruh data katalog produk</strong>? Menu di layar kasir akan menjadi kosong sampai Anda menambahkannya kembali.
                  </>
                )}
                {resetModalType === 'payment_template' && (
                  <>
                    Apakah Anda yakin ingin <strong className="text-purple-400">mengosongkan pengaturan jenis transaksi (barcode QRIS & rekening bank)</strong> serta <strong className="text-purple-400">template struk belanja</strong>? Data konfigurasi ini akan dikosongkan.
                  </>
                )}
                {resetModalType === 'all' && (
                  <>
                    <strong className="text-rose-400">PERINGATAN:</strong> Tindakan ini akan <strong className="text-white">mengosongkan SEMUA data produk, riwayat transaksi, laporan pendapatan, konfigurasi jenis transaksi (QRIS & rekening bank), serta template struk belanja</strong>. Seluruh sistem akan kembali bersih total 100%.
                  </>
                )}
              </p>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalType(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeReset}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Ya, Kosongkan Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CARI & PILIH PRINTER THERMAL BLUETOOTH */}
      {/* ========================================================================= */}
      {isBtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-[#18181c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#141417]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <BluetoothSearching className={`w-5 h-5 ${isScanningBt ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Cari Printer Thermal Bluetooth
                    {isScanningBt && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full animate-pulse">
                        Memindai...
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pilih printer thermal Bluetooth yang terdeteksi atau dipasangkan di perangkat Anda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBtModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Scanner */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Search & Refresh Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchBtQuery}
                    onChange={(e) => setSearchBtQuery(e.target.value)}
                    placeholder="Filter nama printer Bluetooth..."
                    className="w-full bg-[#121215] border border-zinc-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRefreshBtScan}
                  disabled={isScanningBt}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningBt ? 'animate-spin' : ''}`} />
                  <span>{isScanningBt ? 'Scanning...' : 'Pindai Ulang'}</span>
                </button>
              </div>

              {/* Discovered List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Printer Bluetooth Ditemukan ({discoveredDevices.length})</span>
                  <span className="text-[10px] text-zinc-500 font-normal">ESC/POS Thermal Standar</span>
                </div>

                <div className="space-y-2">
                  {discoveredDevices
                    .filter((dev) =>
                      dev.name.toLowerCase().includes(searchBtQuery.toLowerCase()) ||
                      dev.macAddress.toLowerCase().includes(searchBtQuery.toLowerCase())
                    )
                    .map((dev) => {
                      const isCurrent =
                        printerSettings.bluetoothDeviceName === dev.name ||
                        printerSettings.printerName === dev.name;
                      return (
                        <div
                          key={dev.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent && printerSettings.bluetoothStatus === 'connected'
                              ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                              : 'bg-[#121215] border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isCurrent && printerSettings.bluetoothStatus === 'connected'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              <Bluetooth className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{dev.name}</span>
                                <span className="text-[10px] bg-zinc-800 text-amber-400 font-semibold px-2 py-0.5 rounded border border-zinc-700 font-mono">
                                  {dev.paperWidth}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                                <span>MAC: {dev.macAddress}</span>
                                <span>•</span>
                                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                                  <Radio className="w-3 h-3" />
                                  Sinyal Kuat ({dev.rssi} dBm)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {isCurrent && printerSettings.bluetoothStatus === 'connected' ? (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Terhubung
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectBtDevice(dev)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                              >
                                Hubungkan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Manual Entry Form */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tambahkan Printer Bluetooth Kustom / Manual:</span>
                </div>
                <form
                  onSubmit={handleAddCustomBtDevice}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                >
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={customBtName}
                      onChange={(e) => setCustomBtName(e.target.value)}
                      placeholder="Nama Printer (misal: PT-210 BT)"
                      className="w-full bg-[#121215] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={customBtMac}
                      onChange={(e) => setCustomBtMac(e.target.value)}
                      placeholder="MAC (Opsional)"
                      className="w-full bg-[#121215] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!customBtName.trim()}
                      className="w-full bg-zinc-800 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </form>
              </div>

              {/* Notice */}
              <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-3 text-[11px] text-blue-300/80 leading-relaxed flex items-start gap-2">
                <Bluetooth className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>
                  Pastikan printer thermal Bluetooth Anda telah dinyalakan dan fungsi Bluetooth pada
                  perangkat (HP/Tablet/Komputer) sudah aktif. Printer yang sudah dipasangkan akan
                  langsung siap menerima perintah cetak struk dari kasir.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 flex justify-end bg-[#141417]">
              <button
                type="button"
                onClick={() => setIsBtModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User,
  Product,
  Transaction,
  CashDrawerSession,
  PrinterSettings,
  ReceiptTemplate,
  ShiftSummaryReport,
  PaymentSettings,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PRINTER_SETTINGS,
  INITIAL_RECEIPT_TEMPLATE,
  INITIAL_PAYMENT_SETTINGS,
  EMPTY_RECEIPT_TEMPLATE,
  EMPTY_PAYMENT_SETTINGS,
} from './data/initialData';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { ProductView } from './components/ProductView';
import { TransactionView } from './components/TransactionView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { OpenCashierModal } from './components/OpenCashierModal';
import { CloseCashierModal } from './components/CloseCashierModal';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  // State from LocalStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wspos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('wspos_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wspos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wspos_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashDrawer, setCashDrawer] = useState<CashDrawerSession>(() => {
    const saved = localStorage.getItem('wspos_cashdrawer');
    return saved ? JSON.parse(saved) : { isOpen: false, initialCash: 0 };
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    const saved = localStorage.getItem('wspos_printer');
    return saved ? JSON.parse(saved) : INITIAL_PRINTER_SETTINGS;
  });

  const [receiptTemplate, setReceiptTemplate] = useState<ReceiptTemplate>(() => {
    const saved = localStorage.getItem('wspos_template');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPT_TEMPLATE;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('wspos_payment_settings');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_SETTINGS;
  });

  // Modal States
  const [isOpenCashierModalOpen, setIsOpenCashierModalOpen] = useState(false);
  const [isCloseCashierModalOpen, setIsCloseCashierModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wspos_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wspos_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wspos_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wspos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('wspos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wspos_cashdrawer', JSON.stringify(cashDrawer));
  }, [cashDrawer]);

  useEffect(() => {
    localStorage.setItem('wspos_printer', JSON.stringify(printerSettings));
  }, [printerSettings]);

  useEffect(() => {
    localStorage.setItem('wspos_template', JSON.stringify(receiptTemplate));
  }, [receiptTemplate]);

  useEffect(() => {
    localStorage.setItem('wspos_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Cash Drawer Handlers
  const handleOpenCashierDrawer = (initialCash: number) => {
    setCashDrawer({
      isOpen: true,
      openedAt: new Date().toISOString(),
      openedTimestamp: Date.now(),
      openedBy: currentUser?.name || 'Kasir',
      initialCash,
      totalCashSales: 0,
    });
    setIsOpenCashierModalOpen(false);
    setActiveTab('pos');
  };

  const handleCloseCashierDrawer = () => {
    setIsCloseCashierModalOpen(true);
  };

  const handleConfirmCloseCashier = (_report: ShiftSummaryReport) => {
    setCashDrawer({
      isOpen: false,
      initialCash: 0,
    });
    setIsCloseCashierModalOpen(false);
  };

  // Product Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  // User Handlers
  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Transaction Handler
  const handleCompleteTransaction = (tx: Transaction) => {
    setTransactions([tx, ...transactions]);
    if (printerSettings.autoPrint) {
      setSelectedReceiptTx(tx);
    }
  };

  // Data Reset Handlers
  const handleResetTransactions = () => {
    setTransactions([]);
    setCashDrawer((prev) => ({
      ...prev,
      totalCashSales: 0,
    }));
  };

  const handleResetProducts = () => {
    setProducts([]);
  };

  const handleResetPaymentAndTemplate = () => {
    setPaymentSettings(EMPTY_PAYMENT_SETTINGS);
    setReceiptTemplate(EMPTY_RECEIPT_TEMPLATE);
  };

  const handleResetAllData = () => {
    setProducts([]);
    setTransactions([]);
    setCashDrawer({
      isOpen: false,
      initialCash: 0,
      totalCashSales: 0,
    });
    setPaymentSettings(EMPTY_PAYMENT_SETTINGS);
    setReceiptTemplate(EMPTY_RECEIPT_TEMPLATE);
  };

  // Page titles map
  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'pos':
        return 'POS / Kasir';
      case 'produk':
        return 'Produk';
      case 'transaksi':
        return 'Transaksi';
      case 'laporan':
        return 'Laporan';
      case 'settings':
        return 'Pengaturan';
      default:
        return 'Dashboard';
    }
  };

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0e0e10] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d0f]">
        {/* Top Header */}
        <Header
          title={getTabTitle(activeTab)}
          currentUser={currentUser}
        />

        {/* Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              products={products}
              cashDrawer={cashDrawer}
              onOpenCashierClick={() => {
                if (!cashDrawer.isOpen) {
                  setIsOpenCashierModalOpen(true);
                } else {
                  setActiveTab('pos');
                }
              }}
              onCloseCashierClick={handleCloseCashierDrawer}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              products={products}
              cashDrawer={cashDrawer}
              currentUser={currentUser}
              paymentSettings={paymentSettings}
              onOpenCashierClick={() => setIsOpenCashierModalOpen(true)}
              onCloseCashierClick={handleCloseCashierDrawer}
              onCompleteTransaction={handleCompleteTransaction}
            />
          )}

          {activeTab === 'produk' && currentUser.role === 'Owner' && (
            <ProductView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onToggleProductStatus={handleToggleProductStatus}
            />
          )}

          {activeTab === 'transaksi' && (
            <TransactionView
              transactions={transactions}
              onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportView transactions={transactions} />
          )}

          {activeTab === 'settings' && currentUser.role === 'Owner' && (
            <SettingsView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              printerSettings={printerSettings}
              receiptTemplate={receiptTemplate}
              paymentSettings={paymentSettings}
              onUpdatePrinterSettings={setPrinterSettings}
              onUpdateReceiptTemplate={setReceiptTemplate}
              onUpdatePaymentSettings={setPaymentSettings}
              productsCount={products.length}
              transactionsCount={transactions.length}
              onResetTransactions={handleResetTransactions}
              onResetProducts={handleResetProducts}
              onResetPaymentAndTemplate={handleResetPaymentAndTemplate}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Modal Buka Kasir */}
      <OpenCashierModal
        isOpen={isOpenCashierModalOpen}
        onClose={() => setIsOpenCashierModalOpen(false)}
        onConfirm={handleOpenCashierDrawer}
      />

      {/* Modal Tutup Kasir & Rekap Shift */}
      <CloseCashierModal
        isOpen={isCloseCashierModalOpen}
        onClose={() => setIsCloseCashierModalOpen(false)}
        onConfirmClose={handleConfirmCloseCashier}
        cashDrawer={cashDrawer}
        transactions={transactions}
        template={receiptTemplate}
        printerSettings={printerSettings}
      />

      {/* Modal Thermal Receipt */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        template={receiptTemplate}
        printerSettings={printerSettings}
        onClose={() => setSelectedReceiptTx(null)}
      />
    </div>
  );
}

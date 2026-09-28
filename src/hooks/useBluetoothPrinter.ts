import { useState, useEffect, useCallback } from 'react';
import {
  bluetoothPrinter,
  ConnectionStatus,
  BluetoothDeviceInfo,
} from '../utils/bluetoothPrinter';
import {
  buildTransactionEscPos,
  buildTestPrintEscPos,
  buildShiftReportEscPos,
} from '../utils/escpos';
import {
  Transaction,
  ReceiptTemplate,
  PrinterSettings,
  ShiftSummaryReport,
} from '../types';

export function useBluetoothPrinter() {
  const [status, setStatus] = useState<ConnectionStatus>(bluetoothPrinter.getStatus());
  const [deviceInfo, setDeviceInfo] = useState<BluetoothDeviceInfo | null>(
    bluetoothPrinter.getDeviceInfo()
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    bluetoothPrinter.getErrorMessage()
  );
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = bluetoothPrinter.subscribe((newStatus, info, error) => {
      setStatus(newStatus);
      setDeviceInfo(info);
      setErrorMessage(error);
    });
    return unsubscribe;
  }, []);

  const connectBluetooth = useCallback(async () => {
    return await bluetoothPrinter.connectBluetooth();
  }, []);

  const connectSerial = useCallback(async () => {
    return await bluetoothPrinter.connectSerial();
  }, []);

  const disconnect = useCallback(async () => {
    await bluetoothPrinter.disconnect();
  }, []);

  const printTest = useCallback(
    async (
      storeName: string = 'Warung Senja Terang Bulan',
      paperWidth: '58 mm' | '80 mm' = '58 mm',
      beep: boolean = true
    ) => {
      setIsPrinting(true);
      setPrintSuccess(false);
      try {
        const escPosBytes = buildTestPrintEscPos(storeName, paperWidth, beep);
        const ok = await bluetoothPrinter.printRaw(escPosBytes);
        if (ok) {
          setPrintSuccess(true);
          setTimeout(() => setPrintSuccess(false), 3000);
        }
        return ok;
      } finally {
        setIsPrinting(false);
      }
    },
    []
  );

  const printTransaction = useCallback(
    async (
      transaction: Transaction,
      template: ReceiptTemplate,
      settings: PrinterSettings
    ) => {
      setIsPrinting(true);
      setPrintSuccess(false);
      try {
        const escPosBytes = buildTransactionEscPos(transaction, template, settings);
        const ok = await bluetoothPrinter.printRaw(escPosBytes);
        if (ok) {
          setPrintSuccess(true);
          setTimeout(() => setPrintSuccess(false), 3000);
        }
        return ok;
      } finally {
        setIsPrinting(false);
      }
    },
    []
  );

  const printShiftReport = useCallback(
    async (
      report: ShiftSummaryReport,
      template: ReceiptTemplate,
      settings: PrinterSettings
    ) => {
      setIsPrinting(true);
      setPrintSuccess(false);
      try {
        const escPosBytes = buildShiftReportEscPos(report, template, settings);
        const ok = await bluetoothPrinter.printRaw(escPosBytes);
        if (ok) {
          setPrintSuccess(true);
          setTimeout(() => setPrintSuccess(false), 3000);
        }
        return ok;
      } finally {
        setIsPrinting(false);
      }
    },
    []
  );

  return {
    status,
    deviceInfo,
    errorMessage,
    isPrinting,
    printSuccess,
    isSupported: bluetoothPrinter.isBluetoothSupported(),
    isSerialSupported: bluetoothPrinter.isSerialSupported(),
    connectBluetooth,
    connectSerial,
    disconnect,
    printTest,
    printTransaction,
    printShiftReport,
  };
}

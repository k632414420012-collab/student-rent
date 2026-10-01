// VietQR Dynamic Generator Utility for BorrowMe Platform

export interface VietQRConfig {
  bankId: string; // e.g. "MB", "ICB" (VietinBank), "VCB" (Vietcombank)
  accountNo: string;
  accountName: string;
  amount: number;
  memo: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export const DEFAULT_BANK = {
  bankId: 'MB', // MBBank
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNo: '090123456789',
  accountName: 'BORROWME ESCROW SYSTEM',
};

/**
 * Generate a dynamic VietQR image URL with pre-filled amount, account and memo
 */
export function generateVietQRUrl(config: Partial<VietQRConfig> & { amount: number; memo: string }): {
  qrUrl: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  memo: string;
} {
  const bankId = config.bankId || DEFAULT_BANK.bankId;
  const accountNo = config.accountNo || DEFAULT_BANK.accountNo;
  const accountName = config.accountName || DEFAULT_BANK.accountName;
  const template = config.template || 'compact2';

  // Sanitize memo (VietQR supports alphanumeric and spaces, no special diacritics)
  const sanitizedMemo = encodeURIComponent(config.memo.replace(/[^a-zA-Z0-9 ]/g, ''));
  const encodedAccountName = encodeURIComponent(accountName);

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${Math.round(
    config.amount
  )}&addInfo=${sanitizedMemo}&accountName=${encodedAccountName}`;

  return {
    qrUrl,
    bankName: DEFAULT_BANK.bankName,
    accountNo,
    accountName,
    amount: config.amount,
    memo: config.memo,
  };
}

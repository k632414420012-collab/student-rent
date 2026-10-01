// System Constants for BorrowMe

export const APP_NAME = "BorrowMe";
export const APP_TAGLINE = "Nền tảng Cho thuê Đồ dùng Sinh viên Tự động hóa";

export const SERVICE_FEE_RATE = 0.08; // 8% transaction fee
export const DEFAULT_FREE_CANCEL_HOURS = 24; // Free cancellation within 24h
export const ESCROW_AUTO_REFUND_WINDOW_DAYS = 3; // Escrow auto refund buffer days

export const DEFAULT_CATEGORIES = [
  { name: "Thiết bị Điện tử", slug: "dien-tu", icon: "Laptop" },
  { name: "Trang phục Sự kiện", slug: "trang-phuc", icon: "Shirt" },
  { name: "Đồ gia dụng & KTX", slug: "gia-dung", icon: "Home" },
  { name: "Dụng cụ Học tập", slug: "hoc-tap", icon: "BookOpen" },
  { name: "Thiết bị Âm thanh & Sự kiện", slug: "am-thanh", icon: "Speaker" },
  { name: "Xe cộ & Di chuyển", slug: "phuong-tien", icon: "Bike" },
];

export const UNIVERSITY_DOMAINS: Record<string, string> = {
  'hcmut.edu.vn': 'Đại học Bách Khoa TP.HCM (ĐHQG-HCM)',
  'uit.edu.vn': 'Trường ĐH Công nghệ Thông tin (ĐHQG-HCM)',
  'uel.edu.vn': 'Trường ĐH Kinh Tế - Luật (ĐHQG-HCM)',
  'ussh.edu.vn': 'Trường ĐH Khoa học Xã hội và Nhân văn (ĐHQG-HCM)',
  'hcmus.edu.vn': 'Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM)',
  'vnuhcm.edu.vn': 'Đại học Quốc gia TP.HCM',
  'hust.edu.vn': 'Đại học Bách Khoa Hà Nội',
  'neu.edu.vn': 'Đại học Kinh tế Quốc dân (NEU)',
  'ftu.edu.vn': 'Đại học Ngoại Thương (FTU)',
  'ueh.edu.vn': 'Đại học Kinh tế TP.HCM (UEH)',
  'tdtu.edu.vn': 'Đại học Tôn Đức Thắng (TDTU)',
  'ute.edu.vn': 'Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
  'hcmute.edu.vn': 'Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
  'vnu.edu.vn': 'Đại học Quốc gia Hà Nội',
  'ou.edu.vn': 'Trường ĐH Mở TP.HCM',
  'huit.edu.vn': 'Trường ĐH Công Thương TP.HCM',
  'ntt.edu.vn': 'Trường ĐH Nguyễn Tất Thành',
  'fpt.edu.vn': 'Đại học FPT',
};

export const POPULAR_UNIVERSITIES = [
  'Đại học Bách Khoa TP.HCM (ĐHQG-HCM)',
  'Trường ĐH Công nghệ Thông tin (ĐHQG-HCM)',
  'Trường ĐH Kinh Tế - Luật (ĐHQG-HCM)',
  'Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM)',
  'Trường ĐH Khoa học Xã hội & Nhân văn (ĐHQG-HCM)',
  'Đại học Bách Khoa Hà Nội',
  'Đại học Kinh tế Quốc dân (NEU)',
  'Đại học Ngoại Thương (FTU)',
  'Đại học Kinh tế TP.HCM (UEH)',
  'Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
  'Đại học Tôn Đức Thắng (TDTU)',
  'Đại học Quốc gia Hà Nội (VNU)',
  'Đại học FPT',
  'Trường ĐH Công nghiệp TP.HCM (IUH)',
  'Trường ĐH Mở TP.HCM',
];

export function isEduEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  if (domain.endsWith('.edu.vn') || domain.endsWith('.edu')) return true;
  return Boolean(UNIVERSITY_DOMAINS[domain]);
}

export function extractUniversityFromEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return null;

  if (UNIVERSITY_DOMAINS[domain]) {
    return UNIVERSITY_DOMAINS[domain];
  }

  if (domain.endsWith('.edu.vn')) {
    const uniPart = domain.replace('.edu.vn', '').toUpperCase();
    return `Trường Đại học (${uniPart})`;
  }

  return null;
}

import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'BorrowMe – Nền tảng Cho thuê Đồ dùng Sinh viên Tự động hóa',
  description:
    'Nền tảng cho thuê đồ dùng sinh viên tự động với lịch trống thời gian thực, quét mã VietQR tự đối soát và quản lý cọc Escrow an toàn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}


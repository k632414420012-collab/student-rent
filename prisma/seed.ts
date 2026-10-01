import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding enriched database for BorrowMe (Student Rent)...');

  // 1. Seed System Configurations
  await prisma.systemConfig.upsert({
    where: { key: 'service_fee_percent' },
    update: {},
    create: {
      key: 'service_fee_percent',
      value: '8.0',
      description: 'Phí dịch vụ giao dịch thu trên mỗi đơn thành công (8%)',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'free_cancellation_hours' },
    update: {},
    create: {
      key: 'free_cancellation_hours',
      value: '24',
      description: 'Số giờ trước khi nhận đồ được hủy hoàn cọc 100%',
    },
  });

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Thiết bị Điện tử', slug: 'dien-tu', icon: 'Laptop', minDepositRate: 0.5 },
    { name: 'Trang phục Sự kiện', slug: 'trang-phuc', icon: 'Shirt', minDepositRate: 0.3 },
    { name: 'Đồ gia dụng & KTX', slug: 'gia-dung', icon: 'Home', minDepositRate: 0.4 },
    { name: 'Dụng cụ Học tập', slug: 'hoc-tap', icon: 'BookOpen', minDepositRate: 0.2 },
    { name: 'Thiết bị Âm thanh & Sự kiện', slug: 'am-thanh', icon: 'Speaker', minDepositRate: 0.5 },
    { name: 'Xe cộ & Di chuyển', slug: 'phuong-tien', icon: 'Bike', minDepositRate: 0.4 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 3. Seed Users (Admin, Lenders, Renters)
  const bcrypt = await import('bcryptjs');
  const defaultPasswordHash = await bcrypt.hash('borrowme123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@borrowme.vn' },
    update: {
      password: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
    create: {
      email: 'admin@borrowme.vn',
      password: adminPasswordHash,
      fullName: 'Quản trị viên Hệ thống',
      role: 'ADMIN',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      phone: '0901234567',
    },
  });

  const lender1 = await prisma.user.upsert({
    where: { email: 'lender.sv@hcmut.edu.vn' },
    update: {
      password: defaultPasswordHash,
      studentEmail: 'lender.sv@hcmut.edu.vn',
      studentCardNumber: 'SV2023-BK-089',
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
    create: {
      email: 'lender.sv@hcmut.edu.vn',
      password: defaultPasswordHash,
      studentEmail: 'lender.sv@hcmut.edu.vn',
      studentCardNumber: 'SV2023-BK-089',
      fullName: 'Nguyễn Văn An (Bách Khoa)',
      role: 'LENDER',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      university: 'Đại học Bách Khoa TP.HCM',
      phone: '0912345678',
    },
  });

  const lender2 = await prisma.user.upsert({
    where: { email: 'lender.uel@uel.edu.vn' },
    update: {
      password: defaultPasswordHash,
      studentEmail: 'lender.uel@uel.edu.vn',
      studentCardNumber: 'SV2022-UEL-112',
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
    create: {
      email: 'lender.uel@uel.edu.vn',
      password: defaultPasswordHash,
      studentEmail: 'lender.uel@uel.edu.vn',
      studentCardNumber: 'SV2022-UEL-112',
      fullName: 'Lê Hoàng Nam (ĐH Kinh Tế - Luật)',
      role: 'LENDER',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      university: 'Trường ĐH Kinh Tế - Luật ĐHQG',
      phone: '0933445566',
    },
  });

  const renterUser = await prisma.user.upsert({
    where: { email: 'renter.sv@uit.edu.vn' },
    update: {
      password: defaultPasswordHash,
      studentEmail: 'renter.sv@uit.edu.vn',
      studentCardNumber: 'SV2024-UIT-456',
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
    create: {
      email: 'renter.sv@uit.edu.vn',
      password: defaultPasswordHash,
      studentEmail: 'renter.sv@uit.edu.vn',
      studentCardNumber: 'SV2024-UIT-456',
      fullName: 'Trần Thị Mai (ĐH CNTT)',
      role: 'RENTER',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      university: 'Trường ĐH Công nghệ Thông tin - ĐHQG',
      phone: '0987654321',
    },
  });

  // 4. Seed Diverse Sample Items
  const catDienTu = await prisma.category.findUnique({ where: { slug: 'dien-tu' } });
  const catTrangPhuc = await prisma.category.findUnique({ where: { slug: 'trang-phuc' } });
  const catGiaDung = await prisma.category.findUnique({ where: { slug: 'gia-dung' } });
  const catHocTap = await prisma.category.findUnique({ where: { slug: 'hoc-tap' } });
  const catAmThanh = await prisma.category.findUnique({ where: { slug: 'am-thanh' } });
  const catPhuongTien = await prisma.category.findUnique({ where: { slug: 'phuong-tien' } });

  const itemsList = [
    {
      id: 'item-projector-01',
      title: 'Máy chiếu Mini Full HD Epson CO-W01 kết nối HDMI/Wifi',
      description: 'Máy chiếu còn mới 98%, độ sáng cao 3000 lumens, đầy đủ cáp HDMI và remote. Thích hợp thuyết trình đồ án, chiếu phim phòng trọ/KTX.',
      categoryId: catDienTu!.id,
      lenderId: lender1.id,
      conditionStatus: 'Rất tốt',
      rentalPricePerDay: 70000,
      depositAmount: 500000,
      location: 'KTX Khu B ĐHQG TP.HCM',
      isPremium: true,
    },
    {
      id: 'item-camera-sony-02',
      title: 'Máy ảnh Sony Alpha A6400 kèm lens Kit 16-50mm',
      description: 'Body + Lens kit chụp nét, quay 4K lấy nét cực nhanh. Kèm 2 pin, sạc đôi, thẻ nhớ 64GB và túi đựng. Rất hợp cho các bạn sinh viên chụp kỷ yếu hoặc quay sự kiện.',
      categoryId: catDienTu!.id,
      lenderId: lender1.id,
      conditionStatus: 'Mới 99%',
      rentalPricePerDay: 150000,
      depositAmount: 1200000,
      location: 'Quận 10, TP.HCM (Gần Bách Khoa)',
      isPremium: true,
    },
    {
      id: 'item-vest-event-03',
      title: 'Bộ Vest Nam Hàn Quốc màu Xanh Navy (Size L/XL) dự hội thảo/MC',
      description: 'Áo vest + quần tây form Slimfit sang trọng, đã giặt ủi sạch sẽ, thơm tho. Phù hợp bạn nam cao 1m70 - 1m78, nặng 65-74kg làm MC hoặc bảo vệ đồ án.',
      categoryId: catTrangPhuc!.id,
      lenderId: lender2.id,
      conditionStatus: 'Mới 99%',
      rentalPricePerDay: 45000,
      depositAmount: 200000,
      location: 'KTX Khu A ĐHQG TP.HCM',
      isPremium: false,
    },
    {
      id: 'item-speaker-jbl-04',
      title: 'Loa Kéo Di Động Karaoke Bluetooth 300W kèm 2 Mic không dây',
      description: 'Loa kéo công suất lớn, âm bass mạnh mẽ, pin dùng 5-7 tiếng liên tục. Thích hợp cho CLB sinh viên dã ngoại, sinh hoạt ngoại khóa, team building.',
      categoryId: catAmThanh!.id,
      lenderId: lender1.id,
      conditionStatus: 'Rất tốt',
      rentalPricePerDay: 120000,
      depositAmount: 600000,
      location: 'Làng Đại học Thủ Đức',
      isPremium: true,
    },
    {
      id: 'item-iron-steamer-05',
      title: 'Bàn là hơi nước đứng Philips cầm tay cho sinh viên KTX',
      description: 'Bàn là hơi nước ủi phẳng quần áo siêu nhanh trong 2 phút, không sợ cháy vải. Rất tiện cho sinh viên trước buổi phỏng vấn xin việc hoặc thi vấn đáp.',
      categoryId: catGiaDung!.id,
      lenderId: lender2.id,
      conditionStatus: 'Tốt',
      rentalPricePerDay: 25000,
      depositAmount: 150000,
      location: 'KTX Khu B ĐHQG TP.HCM',
      isPremium: false,
    },
    {
      id: 'item-calculator-casio-06',
      title: 'Máy tính Casio fx-580VN X chuẩn phòng thi Bộ GD&ĐT',
      description: 'Máy tính bấm nhạy, giải hệ phương trình 4 ẩn và ma trận cực nhanh. Pin mới thay, đầy đủ nắp bảo vệ. Cứu cánh cho mùa thi đại cương và chuyên ngành.',
      categoryId: catHocTap!.id,
      lenderId: lender2.id,
      conditionStatus: 'Rất tốt',
      rentalPricePerDay: 15000,
      depositAmount: 100000,
      location: 'ĐH Kinh Tế - Luật, Thủ Đức',
      isPremium: false,
    },
  ];

  const today = new Date();

  for (const itemData of itemsList) {
    const item = await prisma.item.upsert({
      where: { id: itemData.id },
      update: {},
      create: {
        ...itemData,
        status: 'ACTIVE',
      },
    });

    // Seed Availability Calendar: 30 days ahead
    for (let i = 0; i < 30; i++) {
      const availDate = new Date(today);
      availDate.setDate(today.getDate() + i);
      availDate.setHours(0, 0, 0, 0);

      // Randomly make day 5 and day 6 BOOKED on the first item to showcase locking
      const isBooked = item.id === 'item-projector-01' && (i === 4 || i === 5);

      await prisma.itemAvailability.upsert({
        where: {
          itemId_date: {
            itemId: item.id,
            date: availDate,
          },
        },
        update: { status: isBooked ? 'BOOKED' : 'AVAILABLE' },
        create: {
          itemId: item.id,
          date: availDate,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
        },
      });
    }

    // Seed sample review for the first item
    if (item.id === 'item-projector-01') {
      const existingReview = await prisma.review.findFirst({
        where: { itemId: item.id },
      });

      if (!existingReview) {
        // Create dummy completed booking first
        const dummyBooking = await prisma.booking.create({
          data: {
            bookingCode: 'BRW-2026-DEMO-01',
            renterId: renterUser.id,
            itemId: item.id,
            startDate: new Date(today.getTime() - 7 * 86400000),
            endDate: new Date(today.getTime() - 5 * 86400000),
            totalDays: 2,
            rentalFee: 140000,
            depositFee: 500000,
            serviceFee: 11200,
            totalAmount: 640000,
            status: 'COMPLETED',
          },
        });

        await prisma.review.create({
          data: {
            bookingId: dummyBooking.id,
            reviewerId: renterUser.id,
            revieweeId: lender1.id,
            itemId: item.id,
            rating: 5,
            comment: 'Máy chiếu dùng rất êm, hình ảnh rõ nét dù phòng có ánh sáng ban ngày. Bạn chủ đồ nhiệt tình hướng dẫn kết nối wifi và giao đồ đúng giờ.',
          },
        });
      }
    }
  }

  console.log('Enriched seed data populated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

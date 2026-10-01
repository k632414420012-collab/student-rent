import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const availabilities = await prisma.itemAvailability.findMany({
      where: { itemId: id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể lấy lịch món đồ' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { dates, status } = body; // status: 'AVAILABLE' | 'UNAVAILABLE'

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách ngày không hợp lệ' },
        { status: 400 }
      );
    }

    const updated = [];
    for (const dStr of dates) {
      const targetDate = new Date(dStr);
      targetDate.setHours(0, 0, 0, 0);

      // Do not allow updating if already BOOKED
      const existing = await prisma.itemAvailability.findUnique({
        where: {
          itemId_date: {
            itemId: id,
            date: targetDate,
          },
        },
      });

      if (existing && existing.status === 'BOOKED') {
        continue; // Skip booked dates
      }

      const res = await prisma.itemAvailability.upsert({
        where: {
          itemId_date: {
            itemId: id,
            date: targetDate,
          },
        },
        update: { status: status || 'AVAILABLE' },
        create: {
          itemId: id,
          date: targetDate,
          status: status || 'AVAILABLE',
        },
      });
      updated.push(res);
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật lịch khả dụng thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật lịch khả dụng' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  SERVICE_FEE_RATE,
  DEFAULT_FREE_CANCEL_HOURS,
  ESCROW_AUTO_REFUND_WINDOW_DAYS,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Admin mới có quyền truy cập' }, { status: 403 });
    }

    const configs = await prisma.systemConfig.findMany();

    const configMap: Record<string, string> = {
      serviceFeeRate: (SERVICE_FEE_RATE * 100).toString(),
      freeCancelHours: DEFAULT_FREE_CANCEL_HOURS.toString(),
      escrowAutoRefundDays: ESCROW_AUTO_REFUND_WINDOW_DAYS.toString(),
    };

    configs.forEach((c) => {
      configMap[c.key] = c.value;
    });

    return NextResponse.json({
      success: true,
      data: configMap,
    });
  } catch (error) {
    console.error('Get system configs error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải cấu hình hệ thống' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Admin mới có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Thiếu key hoặc value cấu hình' },
        { status: 400 }
      );
    }

    const saved = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: String(value),
        description: description || undefined,
      },
      create: {
        key,
        value: String(value),
        description: description || `Cấu hình ${key}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình hệ thống thành công!',
      data: saved,
    });
  } catch (error) {
    console.error('Save system config error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lưu cấu hình' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categoryCount = await prisma.category.count();
    const itemCount = await prisma.item.count();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        categories: categoryCount,
        items: itemCount,
        users: userCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user || !user.partnerId) {
      return NextResponse.json({
        partner: null,
      });
    }

    const partner = await User.findById(user.partnerId).select('-password');
    if (!partner) {
      return NextResponse.json({
        partner: null,
      });
    }

    return NextResponse.json({
      partner: {
        id: partner._id.toString(),
        name: partner.name,
        email: partner.email,
      },
    });
  } catch (error: any) {
    console.error('Get partner info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


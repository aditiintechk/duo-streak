import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.partnerId) {
      return NextResponse.json(
        { error: 'No partner linked' },
        { status: 400 }
      );
    }

    // Get partner
    const partner = await User.findById(currentUser.partnerId);
    if (partner) {
      partner.partnerId = null;
      await partner.save();
    }

    // Unlink current user
    currentUser.partnerId = null;
    await currentUser.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unlink partner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


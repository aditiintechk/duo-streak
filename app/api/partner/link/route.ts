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

    const { partnerEmail } = await req.json();

    if (!partnerEmail) {
      return NextResponse.json(
        { error: 'Partner email is required' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already linked
    if (currentUser.partnerId) {
      return NextResponse.json(
        { error: 'You are already linked to a partner' },
        { status: 400 }
      );
    }

    // Find partner by email
    const partner = await User.findOne({ email: partnerEmail.toLowerCase() });
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found. Make sure they have an account.' },
        { status: 404 }
      );
    }

    // Can't link to yourself
    if (partner._id.toString() === userId) {
      return NextResponse.json(
        { error: 'You cannot link to yourself' },
        { status: 400 }
      );
    }

    // Check if partner is already linked to someone else
    if (partner.partnerId && partner.partnerId.toString() !== userId) {
      return NextResponse.json(
        { error: 'This partner is already linked to another account' },
        { status: 400 }
      );
    }

    // Link both users
    currentUser.partnerId = partner._id;
    partner.partnerId = currentUser._id;
    
    await currentUser.save();
    await partner.save();

    return NextResponse.json({
      success: true,
      partner: {
        id: partner._id.toString(),
        name: partner.name,
        email: partner.email,
      },
    });
  } catch (error: any) {
    console.error('Link partner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


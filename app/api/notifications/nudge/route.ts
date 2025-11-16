import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Habit from '@/models/Habit';
import { getUserIdFromRequest } from '@/lib/auth';
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:your-email@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

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

    const { habitId, habitTitle } = await req.json();

    if (!habitId || !habitTitle) {
      return NextResponse.json(
        { error: 'Habit ID and title are required' },
        { status: 400 }
      );
    }

    // Get current user and their partner
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.partnerId) {
      return NextResponse.json(
        { error: 'No partner linked' },
        { status: 400 }
      );
    }

    // Verify the habit exists and user has permission to nudge
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Get partner's notification subscription
    const partner = await User.findById(user.partnerId);
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (!partner.notificationSubscription) {
      return NextResponse.json(
        { error: 'Partner has not enabled notifications' },
        { status: 400 }
      );
    }

    // Send push notification
    const payload = JSON.stringify({
      title: 'Nudge from ' + user.name,
      body: `Don't forget to complete: ${habitTitle}`,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: `habit-${habitId}`,
      data: {
        habitId,
        habitTitle,
        url: '/',
      },
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: partner.notificationSubscription.endpoint,
          keys: {
            p256dh: partner.notificationSubscription.keys.p256dh,
            auth: partner.notificationSubscription.keys.auth,
          },
        },
        payload
      );

      return NextResponse.json({ success: true, message: 'Nudge sent successfully' });
    } catch (pushError: any) {
      console.error('Push notification error:', pushError);
      
      // If subscription is invalid, remove it
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        partner.notificationSubscription = undefined;
        await partner.save();
        return NextResponse.json(
          { error: 'Partner notification subscription expired' },
          { status: 410 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Nudge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


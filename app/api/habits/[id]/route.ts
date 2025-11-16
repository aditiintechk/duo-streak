import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import HabitCompletion from '@/models/HabitCompletion';
import { getUserIdFromRequest } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: habitId } = await params;
    const habit = await Habit.findById(habitId);

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this habit
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();
    const habitPartnerId = habit.partnerId?.toString();

    const isOwner = habit.userId.toString() === userId;
    const isShared = habit.owner === 'shared';
    const isPartnerOfHabit = habitPartnerId === userId;

    // Allow if: user owns it, it's shared (both can delete), or user is the partner
    if (!isOwner && !isShared && !isPartnerOfHabit) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete all completions for this habit
    await HabitCompletion.deleteMany({ habitId });

    // Delete the habit
    await Habit.findByIdAndDelete(habitId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete habit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


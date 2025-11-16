import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import HabitCompletion from '@/models/HabitCompletion';
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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'my';

    // Get user's partner
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();

    // Build query based on filter
    let query: any = {};
    if (filter === 'partner' && partnerId) {
      // Show only partner's personal habits (exclude shared habits)
      query = { 
        userId: partnerId,
        owner: { $ne: 'shared' } // Exclude shared habits
      };
    } else if (filter === 'shared') {
      // Show shared habits where user or partner is involved
      query = {
        owner: 'shared',
        $or: [
          { userId },
          ...(partnerId ? [{ userId: partnerId }, { partnerId }] : []),
        ],
      };
    } else if (filter === 'my') {
      query = { userId, owner: 'me' };
    } else {
      query = { userId };
    }

    const habits = await Habit.find(query).sort({ createdAt: -1 });

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate streaks and today's completion status
    const habitsWithStats = await Promise.all(
      habits.map(async (habit) => {
        // For shared habits, require BOTH users to complete for streak
        if (habit.owner === 'shared' && partnerId) {
          // Get completions from both users
          const allCompletions = await HabitCompletion.find({
            habitId: habit._id,
            userId: { $in: [userId, partnerId] },
            completed: true,
          })
            .sort({ date: -1 })
            .limit(60);

          // Group completions by date and user
          const completionsByDate = new Map<string, { user: boolean; partner: boolean }>();
          allCompletions.forEach((comp) => {
            const dateKey = comp.date.toISOString().split('T')[0];
            const existing = completionsByDate.get(dateKey) || { user: false, partner: false };
            if (comp.userId.toString() === userId) {
              existing.user = true;
            } else if (comp.userId.toString() === partnerId) {
              existing.partner = true;
            }
            completionsByDate.set(dateKey, existing);
          });

          // Calculate streak - only counts when BOTH completed
          let streak = 0;
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateKey = checkDate.toISOString().split('T')[0];
            const dayCompletions = completionsByDate.get(dateKey);
            
            if (dayCompletions && dayCompletions.user && dayCompletions.partner) {
              streak++;
            } else {
              break;
            }
          }

          // Check completion status for both users today
          const userTodayCompletion = await HabitCompletion.findOne({
            habitId: habit._id,
            userId: userId,
            date: { $gte: today },
            completed: true,
          });

          const partnerTodayCompletion = await HabitCompletion.findOne({
            habitId: habit._id,
            userId: partnerId,
            date: { $gte: today },
            completed: true,
          });

          return {
            id: habit._id.toString(),
            title: habit.title,
            streak,
            completed: !!userTodayCompletion,
            owner: 'shared' as const,
            sharedCompletion: {
              user: !!userTodayCompletion,
              partner: !!partnerTodayCompletion,
            },
          };
        }

        // For partner habits, check partner's completions
        if (filter === 'partner' && partnerId) {
          const completions = await HabitCompletion.find({
            habitId: habit._id,
            userId: partnerId,
            completed: true,
          })
            .sort({ date: -1 })
            .limit(30);

          let streak = 0;
          const sortedCompletions = completions.sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          );

          for (let i = 0; i < sortedCompletions.length; i++) {
            const completionDate = new Date(sortedCompletions[i].date);
            completionDate.setHours(0, 0, 0, 0);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (
              completionDate.getTime() === expectedDate.getTime() ||
              (i === 0 && completionDate.getTime() === today.getTime())
            ) {
              streak++;
            } else {
              break;
            }
          }

          const todayCompletion = await HabitCompletion.findOne({
            habitId: habit._id,
            userId: partnerId,
            date: { $gte: today },
            completed: true,
          });

          return {
            id: habit._id.toString(),
            title: habit.title,
            streak,
            completed: !!todayCompletion,
            owner: 'partner' as const,
          };
        }

        // For my habits, check current user's completions
        const completions = await HabitCompletion.find({
          habitId: habit._id,
          userId: userId,
          completed: true,
        })
          .sort({ date: -1 })
          .limit(30);

        let streak = 0;
        const sortedCompletions = completions.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        for (let i = 0; i < sortedCompletions.length; i++) {
          const completionDate = new Date(sortedCompletions[i].date);
          completionDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);

          if (
            completionDate.getTime() === expectedDate.getTime() ||
            (i === 0 && completionDate.getTime() === today.getTime())
          ) {
            streak++;
          } else {
            break;
          }
        }

        const todayCompletion = await HabitCompletion.findOne({
          habitId: habit._id,
          userId: userId,
          date: { $gte: today },
          completed: true,
        });

        return {
          id: habit._id.toString(),
          title: habit.title,
          streak,
          completed: !!todayCompletion,
          owner: habit.owner,
        };
      })
    );

    return NextResponse.json({ habits: habitsWithStats });
  } catch (error: any) {
    console.error('Get habits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const { title, owner } = await req.json();

    if (!title || !owner) {
      return NextResponse.json(
        { error: 'Title and owner are required' },
        { status: 400 }
      );
    }

    // Get user to check for partner
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString() || null;

    // Validate partner requirements
    if ((owner === 'partner' || owner === 'shared') && !partnerId) {
      return NextResponse.json(
        { error: 'You must link a partner first to create partner or shared habits' },
        { status: 400 }
      );
    }

    const habit = await Habit.create({
      title,
      userId,
      owner,
      partnerId: owner === 'partner' || owner === 'shared' ? partnerId : null,
    });

    return NextResponse.json(
      {
        habit: {
          id: habit._id.toString(),
          title: habit.title,
          streak: 0,
          completed: false,
          owner: habit.owner,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create habit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


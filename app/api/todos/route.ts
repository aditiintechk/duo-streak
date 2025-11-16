import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';
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

    // Get user's partner
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();

    // Get todos where user is involved
    const query: any = {
      $or: [
        { userId },
        ...(partnerId ? [{ partnerId }, { userId: partnerId }] : []),
      ],
    };

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      todos: todos.map((todo) => ({
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        assignedTo: todo.assignedTo,
      })),
    });
  } catch (error: any) {
    console.error('Get todos error:', error);
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

    const { text, assignedTo } = await req.json();

    if (!text || !assignedTo) {
      return NextResponse.json(
        { error: 'Text and assignedTo are required' },
        { status: 400 }
      );
    }

    // Get user to check for partner
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString() || null;

    // Validate partner requirements
    if ((assignedTo === 'partner' || assignedTo === 'both') && !partnerId) {
      return NextResponse.json(
        { error: 'You must link a partner first to assign tasks to partner or both' },
        { status: 400 }
      );
    }

    const todo = await Todo.create({
      text,
      userId,
      assignedTo,
      partnerId: assignedTo === 'partner' || assignedTo === 'both' ? partnerId : null,
    });

    return NextResponse.json(
      {
        todo: {
          id: todo._id.toString(),
          text: todo.text,
          completed: todo.completed,
          assignedTo: todo.assignedTo,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


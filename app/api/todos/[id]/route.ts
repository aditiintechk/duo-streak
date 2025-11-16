import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';
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

    const { id: todoId } = await params;
    const todo = await Todo.findById(todoId);

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this todo
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    const partnerId = user?.partnerId?.toString();
    const todoPartnerId = todo.partnerId?.toString();

    const isOwner = todo.userId.toString() === userId;
    const isPartnerOfTodo = todoPartnerId === userId;

    // Allow if: user owns it or user is the partner
    if (!isOwner && !isPartnerOfTodo) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the todo
    await Todo.findByIdAndDelete(todoId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete todo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


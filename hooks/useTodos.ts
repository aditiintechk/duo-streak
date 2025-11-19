'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'me' | 'partner' | 'both';
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos', {
        credentials: 'include', // Required for cookies to work on iOS
      });
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data.todos);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}/toggle`, { 
        method: 'POST',
        credentials: 'include', // Required for cookies to work on iOS
      });
      if (!res.ok) throw new Error('Failed to toggle todo');
      await fetchTodos(); // Refresh
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createTodo = async (text: string, assignedTo: 'me' | 'partner' | 'both') => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Required for cookies to work on iOS
        body: JSON.stringify({ text, assignedTo }),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      await fetchTodos(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTodo = async (id: string, text: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      await fetchTodos(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      await fetchTodos(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { todos, loading, error, toggleTodo, createTodo, updateTodo, deleteTodo, refetch: fetchTodos };
}


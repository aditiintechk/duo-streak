'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import TodoItem from '@/components/TodoItem'
import CustomSelect from '@/components/CustomSelect'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/contexts/AuthContext'

export default function TodoPage() {
	const router = useRouter()
	const { user, loading: authLoading } = useAuth()
	const { todos, loading, toggleTodo, createTodo, deleteTodo } = useTodos()
	const [showAddModal, setShowAddModal] = useState(false)
	const [newTodoText, setNewTodoText] = useState('')
	const [newTodoAssigned, setNewTodoAssigned] = useState<
		'me' | 'partner' | 'both'
	>('both')
	const [isCreating, setIsCreating] = useState(false)
	const [todoView, setTodoView] = useState<'todo' | 'completed'>('todo')

	// Redirect to login if not authenticated (in useEffect to avoid render issues)
	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/login')
		}
	}, [authLoading, user, router])

	// Show loading state while checking auth
	if (authLoading) {
		return (
			<div className='min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14 flex items-center justify-center'>
				<p className='text-sm text-(--text-secondary)'>Loading...</p>
			</div>
		)
	}

	// Show nothing if not authenticated (redirect is happening)
	if (!user) {
		return null
	}

	const handleCreateTodo = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newTodoText.trim()) return

		setIsCreating(true)
		try {
			await createTodo(newTodoText.trim(), newTodoAssigned)
			setNewTodoText('')
			setNewTodoAssigned('both')
			setShowAddModal(false)
		} catch (error) {
			console.error('Failed to create todo:', error)
		} finally {
			setIsCreating(false)
		}
	}

	const filteredTodos = todos.filter((todo) =>
		todoView === 'completed' ? todo.completed : !todo.completed
	)

	return (
		<div className='min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14'>
			<Navigation />

			<main className='mx-auto max-w-4xl px-4 py-6 sm:px-6'>
				<div className='mb-4 flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-(--foreground)'>
						Todo List
					</h1>
					<button
						onClick={() => setShowAddModal(true)}
						className='flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--accent-dark) hover:shadow-md'
					>
						<Plus className='h-3.5 w-3.5' />
						New Todo
					</button>
				</div>

				{/* Todo view toggle */}
				<div className='mb-4 flex gap-2 overflow-x-auto pb-2'>
					{([
						{ id: 'todo', label: 'Todo' },
						{ id: 'completed', label: 'Completed' },
					] as const).map((tab) => (
						<button
							key={tab.id}
							onClick={() => setTodoView(tab.id)}
							className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
								todoView === tab.id
									? 'bg-(--accent) text-white shadow-md'
									: 'bg-(--card-bg) text-(--text-secondary) hover:bg-(--border)'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Todo List */}
				<div className='space-y-2'>
					{loading ? (
						<div className='rounded-xl border border-(--border) bg-(--card-bg) p-8 text-center'>
							<p className='text-sm text-(--text-secondary)'>
								Loading todos...
							</p>
						</div>
					) : filteredTodos.length > 0 ? (
						filteredTodos.map((todo) => (
							<TodoItem
								key={todo.id}
								id={todo.id}
								text={todo.text}
								completed={todo.completed}
								assignedTo={todo.assignedTo}
								onToggle={() => toggleTodo(todo.id)}
								onDelete={() => deleteTodo(todo.id)}
							/>
						))
					) : (
						<div className='rounded-xl border-2 border-dashed border-(--border) bg-(--card-bg) p-8 text-center'>
							<div className='mb-2 text-2xl'>✨</div>
							<p className='text-sm font-medium text-(--foreground) mb-1'>
								{todoView === 'todo'
									? 'All caught up!'
									: 'No completed tasks yet'}
							</p>
							<p className='text-xs text-(--text-secondary)'>
								{todoView === 'todo'
									? 'Add a task or relax for a bit.'
									: 'Finish a task and it will show here.'}
							</p>
						</div>
					)}
				</div>

				{/* Add Todo Modal */}
				{showAddModal && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
						<div className='w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6'>
							<h2 className='text-xl font-bold text-(--foreground) mb-4'>
								Add New Todo
							</h2>
							<form
								onSubmit={handleCreateTodo}
								className='space-y-4'
							>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Task
									</label>
									<input
										type='text'
										value={newTodoText}
										onChange={(e) =>
											setNewTodoText(e.target.value)
										}
										className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
										placeholder='e.g., Plan weekend getaway'
										required
										autoFocus
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Type
									</label>
									<CustomSelect
										value={newTodoAssigned}
										onChange={(value) =>
											setNewTodoAssigned(
												value as
													| 'me'
													| 'partner'
													| 'both'
											)
										}
										options={[
											{ value: 'me', label: 'Me' },
											{
												value: 'partner',
												label: 'Partner',
											},
											{ value: 'both', label: 'Both' },
										]}
									/>
								</div>
								<div className='flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setShowAddModal(false)
											setNewTodoText('')
										}}
										className='flex-1 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--border) transition-all'
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={isCreating}
										className='flex-1 py-2 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50'
									>
										{isCreating ? 'Creating...' : 'Create'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}

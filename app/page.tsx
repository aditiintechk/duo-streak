'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Navigation from '@/components/Navigation'
import HabitCard from '@/components/HabitCard'
import CustomSelect from '@/components/CustomSelect'
import { useHabits } from '@/hooks/useHabits'
import { useAuth } from '@/contexts/AuthContext'

type TabType = 'my' | 'partner' | 'shared'

export default function Home() {
	const router = useRouter()
	const { user, loading: authLoading } = useAuth()
	const [activeTab, setActiveTab] = useState<TabType>('my')
	const { habits, loading, toggleHabit, createHabit, updateHabit, deleteHabit } =
		useHabits(activeTab)
	const [showAddModal, setShowAddModal] = useState(false)
	const [newHabitTitle, setNewHabitTitle] = useState('')
	const [newHabitOwner, setNewHabitOwner] = useState<'me' | 'shared'>('me')
	const [isCreating, setIsCreating] = useState(false)
	const [showMessageModal, setShowMessageModal] = useState(false)
	const [messageHabitId, setMessageHabitId] = useState<string | null>(null)
	const [messageContent, setMessageContent] = useState('')
	const [sendingMessage, setSendingMessage] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
	const [editHabitTitle, setEditHabitTitle] = useState('')
	const [isUpdating, setIsUpdating] = useState(false)
	const [isReorderMode, setIsReorderMode] = useState(false)
	const [orderKey, setOrderKey] = useState(0) // Force re-render when order changes

	// Set up drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	// Redirect to login if not authenticated (in useEffect to avoid render issues)
	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/login')
		}
	}, [authLoading, user, router])

	// Load and apply habit order from localStorage
	const getStoredOrder = (filter: TabType): string[] => {
		if (typeof window === 'undefined') return []
		const stored = localStorage.getItem(`habit-order-${filter}`)
		return stored ? JSON.parse(stored) : []
	}

	const saveOrder = (filter: TabType, order: string[]) => {
		if (typeof window === 'undefined') return
		localStorage.setItem(`habit-order-${filter}`, JSON.stringify(order))
	}

	// Apply stored order to habits
	const orderedHabits = useMemo(() => {
		if (habits.length === 0) return []
		
		const storedOrder = getStoredOrder(activeTab)
		const habitMap = new Map(habits.map(h => [h.id, h]))
		
		// Start with stored order, then add any new habits that aren't in the order
		const ordered: typeof habits = []
		const usedIds = new Set<string>()
		
		// Add habits in stored order
		for (const id of storedOrder) {
			if (habitMap.has(id)) {
				ordered.push(habitMap.get(id)!)
				usedIds.add(id)
			}
		}
		
		// Add any new habits that weren't in the stored order
		for (const habit of habits) {
			if (!usedIds.has(habit.id)) {
				ordered.push(habit)
			}
		}
		
		return ordered
	}, [habits, activeTab, orderKey])

	// Handle drag end event
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) {
			return
		}

		const oldIndex = orderedHabits.findIndex((habit) => habit.id === active.id)
		const newIndex = orderedHabits.findIndex((habit) => habit.id === over.id)

		if (oldIndex !== -1 && newIndex !== -1) {
			const newOrder = arrayMove(orderedHabits, oldIndex, newIndex)
			const orderIds = newOrder.map(h => h.id)
			saveOrder(activeTab, orderIds)
			// Force re-render by updating order key
			setOrderKey(prev => prev + 1)
		}
	}

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

	const handleCreateHabit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newHabitTitle.trim()) return

		setIsCreating(true)
		try {
			await createHabit(newHabitTitle.trim(), newHabitOwner)
			// The order will be updated automatically when habits refresh
			// New habits will be appended to the end of the stored order
			setNewHabitTitle('')
			setNewHabitOwner('me')
			setShowAddModal(false)
		} catch (error) {
			console.error('Failed to create habit:', error)
		} finally {
			setIsCreating(false)
		}
	}

	return (
		<div className='min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14'>
			<Navigation />

			<main className='mx-auto max-w-4xl px-4 py-6 sm:px-6'>
				<div className='mb-8 flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-(--foreground)'>
						Habits
					</h1>
					<div className='flex items-center gap-2'>
						<button
							onClick={() => setIsReorderMode(!isReorderMode)}
							className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
								isReorderMode
									? 'bg-(--accent) text-white hover:bg-(--accent-dark) hover:shadow-md'
									: 'border border-(--border) bg-(--card-bg) text-(--foreground) hover:bg-(--border)'
							}`}
						>
							<GripVertical className='h-3.5 w-3.5' />
							{isReorderMode ? 'Done' : 'Reorder'}
						</button>
						<button
							onClick={() => {
								setNewHabitOwner(
									activeTab === 'shared' ? 'shared' : 'me'
								)
								setShowAddModal(true)
							}}
							className='flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--accent-dark) hover:shadow-md'
						>
							<Plus className='h-3.5 w-3.5' />
							New Habit
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className='mb-4 flex gap-2 overflow-x-auto pb-2'>
					{[
						{ id: 'my' as TabType, label: 'Mine' },
						{ id: 'partner' as TabType, label: "Partner's" },
						{ id: 'shared' as TabType, label: 'Together' },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
								activeTab === tab.id
									? 'bg-(--accent) text-white shadow-md'
									: 'bg-(--card-bg) text-(--text-secondary) hover:bg-(--border)'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Habits Grid */}
				<div className='space-y-3'>
					{loading ? (
						<div className='rounded-xl border border-(--border) bg-(--card-bg) p-8 text-center'>
							<p className='text-sm text-(--text-secondary)'>
								Loading habits...
							</p>
						</div>
					) : orderedHabits.length > 0 ? (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={orderedHabits.map(h => h.id)}
								strategy={verticalListSortingStrategy}
								disabled={!isReorderMode}
							>
								{orderedHabits.map((habit) => {
									// Only allow delete for my habits and shared habits (not partner habits)
									const canDelete =
										habit.owner === 'me' || habit.owner === 'shared'
									return (
										<HabitCard
											key={habit.id}
											id={habit.id}
											title={habit.title}
											streak={habit.streak}
											completed={habit.completed}
											owner={habit.owner}
											sharedCompletion={habit.sharedCompletion}
											onToggle={() => toggleHabit(habit.id)}
											onDelete={
												canDelete
													? () => deleteHabit(habit.id)
													: undefined
											}
											onMessage={
												(habit.owner === 'partner' &&
													!habit.completed) ||
												(habit.owner === 'shared' &&
													habit.sharedCompletion &&
													habit.sharedCompletion.user &&
													!habit.sharedCompletion.partner)
													? () => {
															setMessageHabitId(habit.id)
															setShowMessageModal(true)
													  }
													: undefined
											}
											onEdit={
												canDelete
													? () => {
															setEditingHabitId(habit.id)
															setEditHabitTitle(habit.title)
															setShowEditModal(true)
													  }
													: undefined
											}
											isReorderMode={isReorderMode}
										/>
									)
								})}
							</SortableContext>
						</DndContext>
					) : (
						<div className='rounded-xl border-2 border-dashed border-(--border) bg-(--card-bg) p-8 text-center'>
							<div className='mb-2 text-2xl'>✨</div>
							<p className='text-sm font-medium text-(--foreground) mb-1'>
								No habits yet
							</p>
							<p className='text-xs text-(--text-secondary)'>
								Add one to get started on your journey together!
							</p>
						</div>
					)}
				</div>

				{/* Add Habit Modal */}
				{showAddModal && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
						<div className='w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6'>
							<h2 className='text-xl font-bold text-(--foreground) mb-4'>
								Add New Habit
							</h2>
							<form
								onSubmit={handleCreateHabit}
								className='space-y-4'
							>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Habit Name
									</label>
									<input
										type='text'
										value={newHabitTitle}
										onChange={(e) =>
											setNewHabitTitle(e.target.value)
										}
										className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
										placeholder='e.g., Morning Meditation'
										required
										autoFocus
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Type
									</label>
									<CustomSelect
										value={newHabitOwner}
										onChange={(value) =>
											setNewHabitOwner(
												value as 'me' | 'shared'
											)
										}
										options={[
											{ value: 'me', label: 'Mine' },
											{
												value: 'shared',
												label: 'Together',
											},
										]}
									/>
								</div>
								<div className='flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setShowAddModal(false)
											setNewHabitTitle('')
											setNewHabitOwner('me')
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

				{/* Send Message Modal */}
				{showMessageModal && messageHabitId && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
						<div className='w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6'>
							<h2 className='text-xl font-bold text-(--foreground) mb-4'>
								Send Message
							</h2>
							<form
								onSubmit={async (e) => {
									e.preventDefault()
									if (!messageContent.trim()) return

									setSendingMessage(true)
									try {
										const habit = habits.find(h => h.id === messageHabitId)
										const res = await fetch('/api/messages', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											credentials: 'include',
											body: JSON.stringify({
												content: messageContent.trim(),
												relatedHabitId: messageHabitId,
											}),
										})

										if (!res.ok) {
											const data = await res.json()
											throw new Error(data.error || 'Failed to send message')
										}

										setMessageContent('')
										setShowMessageModal(false)
										setMessageHabitId(null)
										alert('Message sent!')
									} catch (error: any) {
										alert(error.message || 'Failed to send message')
									} finally {
										setSendingMessage(false)
									}
								}}
								className='space-y-4'
							>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Message
									</label>
									<textarea
										value={messageContent}
										onChange={(e) =>
											setMessageContent(e.target.value)
										}
										className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent) min-h-[100px]'
										placeholder='Send a motivational message to your partner...'
										required
										autoFocus
									/>
								</div>
								<div className='flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setShowMessageModal(false)
											setMessageContent('')
											setMessageHabitId(null)
										}}
										className='flex-1 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--border) transition-all'
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={sendingMessage}
										className='flex-1 py-2 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50'
									>
										{sendingMessage ? 'Sending...' : 'Send'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Edit Habit Modal */}
				{showEditModal && editingHabitId && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
						<div className='w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6'>
							<h2 className='text-xl font-bold text-(--foreground) mb-4'>
								Edit Habit
							</h2>
							<form
								onSubmit={async (e) => {
									e.preventDefault()
									if (!editHabitTitle.trim()) return

									setIsUpdating(true)
									try {
										await updateHabit(editingHabitId, editHabitTitle.trim())
										setShowEditModal(false)
										setEditingHabitId(null)
										setEditHabitTitle('')
									} catch (error: any) {
										alert(error.message || 'Failed to update habit')
									} finally {
										setIsUpdating(false)
									}
								}}
								className='space-y-4'
							>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Habit Name
									</label>
									<input
										type='text'
										value={editHabitTitle}
										onChange={(e) =>
											setEditHabitTitle(e.target.value)
										}
										className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
										placeholder='e.g., Morning Meditation'
										required
										autoFocus
									/>
								</div>
								<div className='flex gap-3'>
									<button
										type='button'
										onClick={() => {
											setShowEditModal(false)
											setEditingHabitId(null)
											setEditHabitTitle('')
										}}
										className='flex-1 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--border) transition-all'
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={isUpdating}
										className='flex-1 py-2 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50'
									>
										{isUpdating ? 'Updating...' : 'Update'}
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

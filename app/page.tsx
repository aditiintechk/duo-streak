'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import HabitCard from '@/components/HabitCard'
import CustomSelect from '@/components/CustomSelect'
import { useHabits } from '@/hooks/useHabits'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

type TabType = 'my' | 'partner' | 'shared'

export default function Home() {
	const router = useRouter()
	const { user, loading: authLoading } = useAuth()
	const [activeTab, setActiveTab] = useState<TabType>('my')
	const { habits, loading, toggleHabit, createHabit, deleteHabit } = useHabits(activeTab)
	const { sendNudge, isSubscribed, subscribeToNotifications } = useNotifications()
	const [showAddModal, setShowAddModal] = useState(false)
	const [newHabitTitle, setNewHabitTitle] = useState('')
	const [newHabitOwner, setNewHabitOwner] = useState<'me' | 'shared'>('me')
	const [isCreating, setIsCreating] = useState(false)
	const [nudging, setNudging] = useState<string | null>(null)

	// Redirect to login if not authenticated (in useEffect to avoid render issues)
	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/login')
		}
	}, [authLoading, user, router])

	// Show loading state while checking auth
	if (authLoading) {
		return (
			<div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14 flex items-center justify-center">
				<p className="text-sm text-(--text-secondary)">Loading...</p>
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
					<button
						onClick={() => setShowAddModal(true)}
						className='flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--accent-dark) hover:shadow-md'
					>
						<Plus className='h-3.5 w-3.5' />
						New Habit
					</button>
				</div>

				{/* Tabs */}
				<div className='mb-4 flex gap-2 overflow-x-auto pb-2'>
					{[
						{ id: 'my' as TabType, label: 'My Habits' },
						{ id: 'partner' as TabType, label: "Partner's" },
						{ id: 'shared' as TabType, label: 'Shared' },
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
							<p className='text-sm text-(--text-secondary)'>Loading habits...</p>
						</div>
					) : habits.length > 0 ? (
						habits.map((habit) => {
							// Only allow delete for my habits and shared habits (not partner habits)
							const canDelete = habit.owner === 'me' || habit.owner === 'shared';
							return (
								<HabitCard
									key={habit.id}
									title={habit.title}
									streak={habit.streak}
									completed={habit.completed}
									owner={habit.owner}
									sharedCompletion={habit.sharedCompletion}
									onToggle={() => toggleHabit(habit.id)}
									onDelete={canDelete ? () => deleteHabit(habit.id) : undefined}
									onNudge={
										(habit.owner === 'partner' && !habit.completed) ||
										(habit.owner === 'shared' && habit.sharedCompletion && habit.sharedCompletion.user && !habit.sharedCompletion.partner)
											? async () => {
													if (!isSubscribed) {
														const subscribed = await subscribeToNotifications();
														if (!subscribed) {
															alert('Please enable notifications to send nudges');
															return;
														}
													}
													
													setNudging(habit.id);
													try {
														const success = await sendNudge(habit.id, habit.title);
														if (success) {
															// Show success feedback
															console.log('Nudge sent successfully');
														} else {
															alert('Failed to send nudge. Make sure your partner has enabled notifications.');
														}
													} catch (error) {
														console.error('Error sending nudge:', error);
														alert('Failed to send nudge');
													} finally {
														setNudging(null);
													}
												}
											: undefined
									}
								/>
							);
						})
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
							<form onSubmit={handleCreateHabit} className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-(--foreground) mb-1.5'>
										Habit Name
									</label>
									<input
										type='text'
										value={newHabitTitle}
										onChange={(e) => setNewHabitTitle(e.target.value)}
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
										onChange={(value) => setNewHabitOwner(value as 'me' | 'shared')}
										options={[
											{ value: 'me', label: 'My Habit' },
											{ value: 'shared', label: 'Shared Habit' },
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
			</main>
		</div>
	)
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
	try {
		await connectDB()

		const { email, password, name } = await req.json()

		if (!email || !password || !name) {
			return NextResponse.json(
				{ error: 'Email, password, and name are required' },
				{ status: 400 }
			)
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() })
		if (existingUser) {
			return NextResponse.json(
				{ error: 'User already exists' },
				{ status: 400 }
			)
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Create user
		const user = await User.create({
			email: email.toLowerCase(),
			password: hashedPassword,
			name,
		})

		// Generate token
		const token = generateToken({
			userId: user._id.toString(),
			email: user.email,
		})

		// Set cookie
		const response = NextResponse.json(
			{
				user: {
					id: user._id.toString(),
					email: user.email,
					name: user.name,
					partnerId: user.partnerId?.toString() || null,
				},
			},
			{ status: 201 }
		)

		response.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/', // Explicit path for iOS compatibility
			maxAge: 60 * 60 * 24 * 90, // 90 days
		})

		return response
	} catch (error: unknown) {
		console.error('Registration error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

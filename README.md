# DuoStreak

A modern, minimal habit tracking app for couples to build better habits together.

## Features

- ✅ Track personal and shared habits
- ✅ Together todo list
- ✅ Stats and insights
- ✅ Streak tracking
- ✅ Dark/Light mode
- ✅ Progressive Web App (PWA) - Install on mobile/desktop

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Push Notifications (VAPID Keys)
# Generate these keys by running: node scripts/generate-vapid-keys.js
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Generate VAPID Keys for Push Notifications:**
```bash
node scripts/generate-vapid-keys.js
```
Copy the output to your `.env.local` file.

### 3. Set Up PWA Icons (Optional but Recommended)

For the PWA to work properly, you need to add icon files:

1. Create two PNG icons:
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Place them in the `/public` folder

**Quick Options:**
- Use [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- Use [RealFaviconGenerator](https://realfavicongenerator.net/)
- Create simple icons with your brand color (#f97316)

See `public/icon-generator.md` for more details.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** PWA features are disabled in development mode. To test PWA:
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Visit the site and use browser's "Install" option

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Habits
- `GET /api/habits?filter=my|partner|shared` - Get habits
- `POST /api/habits` - Create habit
- `POST /api/habits/[id]/toggle` - Toggle habit completion

### Todos
- `GET /api/todos` - Get todos
- `POST /api/todos` - Create todo
- `POST /api/todos/[id]/toggle` - Toggle todo completion

### Stats
- `GET /api/stats` - Get statistics

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── page.tsx       # Habits page
│   ├── todo/          # Todo page
│   ├── stats/         # Stats page
│   └── settings/      # Settings page
├── components/        # React components
├── lib/               # Utilities (auth, db connection)
├── models/            # MongoDB models
└── public/            # Static assets
```

## Quick Start

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your MongoDB connection string
   - Generate a JWT secret

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Create your account:**
   - Go to `/login`
   - Click "Sign up" to create an account
   - Start adding habits!

## Features Implemented

✅ **Authentication**
- User registration and login
- JWT-based session management
- Protected routes

✅ **Habits**
- Create habits (My/Partner/Together)
- Toggle daily completion
- Streak tracking
- Filter by owner

✅ **Todos**
- Create todos with assignment
- Toggle completion
- Progress tracking

✅ **Stats**
- Weekly progress charts
- Completion rates
- Together streak tracking

✅ **Settings**
- Profile management
- Theme toggle (light/dark)
- Account settings

## Database Schema

- **User**: email, password (hashed), name, partnerId
- **Habit**: title, userId, owner, completions[]
- **HabitCompletion**: habitId, userId, date, completed
- **Todo**: text, userId, assignedTo, completed

## PWA (Progressive Web App)

This app is configured as a PWA and can be installed on mobile devices and desktops.

### Features:
- ✅ Offline support (via service worker)
- ✅ Installable on mobile/desktop
- ✅ App-like experience
- ✅ Fast loading with caching

### To Install:
1. **On Mobile (Android/iPhone):**
   - Open the app in your browser
   - Tap the browser menu (three dots)
   - Select "Add to Home Screen" or "Install App"

2. **On Desktop (Chrome/Edge):**
   - Look for the install icon in the address bar
   - Click "Install" when prompted

### Testing PWA:
PWA is disabled in development. To test:
```bash
npm run build
npm start
```
Then visit the site and check for install prompts.

## Next Steps (Future Enhancements)

- [ ] Partner linking functionality
- [ ] Real-time updates with WebSockets
- [ ] Habit editing and deletion
- [ ] Todo editing and deletion
- [ ] Email notifications
- [ ] Push notifications
- [ ] Deploy to production

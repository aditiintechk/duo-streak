# Testing Push Notifications - Step by Step Guide

## Prerequisites

1. ✅ VAPID keys added to `.env` file
2. ✅ Email updated in `VAPID_EMAIL`
3. ✅ MongoDB connected
4. ✅ Server restarted after adding keys

## Step-by-Step Testing

### Option 1: Test with Two Browser Windows (Easiest)

#### Setup:

1. **Start the app in production mode** (notifications work better):

    ```bash
    npm run build
    npm start
    ```

2. **Open two browser windows** (or use incognito for one):
    - Window 1: Regular Chrome/Edge window
    - Window 2: Incognito/Private window (or different browser)

#### Test Account 1 (Window 1):

1. Go to `http://localhost:3000`
2. Click "Sign up" and create account:
    - Name: `User1`
    - Email: `user1@test.com`
    - Password: `test123`
3. After login, go to **Settings** page
4. Scroll to **Notifications** section
5. Click **"Enable"** button
6. **Allow notifications** when browser asks
7. You should see "Enabled" status

#### Test Account 2 (Window 2):

1. Go to `http://localhost:3000` (in incognito/other browser)
2. Click "Sign up" and create account:
    - Name: `User2`
    - Email: `user2@test.com`
    - Password: `test123`
3. After login, go to **Settings** page
4. Scroll to **Notifications** section
5. Click **"Enable"** button
6. **Allow notifications** when browser asks
7. You should see "Enabled" status

#### Link the Accounts:

**In Window 1 (User1):**

1. Go to **Settings** page
2. Scroll to **Partner** section
3. Click **"Link Partner"**
4. Enter: `user2@test.com`
5. Click **"Link Partner"** button

**In Window 2 (User2):**

1. Go to **Settings** page
2. You should see User1 as your partner (or link User1 back)

#### Create a Test Habit:

**In Window 1 (User1):**

1. Go to **Habits** page
2. Click **"New Habit"**
3. Enter: `Morning Meditation`
4. Select: **"Shared Habit"**
5. Click **"Create"**

#### Test the Nudge:

**In Window 1 (User1):**

1. Go to **Habits** page
2. Click on **"Shared"** tab
3. You should see "Morning Meditation"
4. Click the **checkmark** to complete it (you complete it)
5. Now you should see a **"Nudge"** button appear
6. Click the **"Nudge"** button

**In Window 2 (User2):**

1. You should receive a **push notification** that says:
    - Title: "Nudge from User1"
    - Body: "Don't forget to complete: Morning Meditation"
2. Click the notification - it should open the app

### Option 2: Test with Partner Habits

**In Window 1 (User1):**

1. Go to **Habits** page
2. Click **"New Habit"**
3. Enter: `Evening Workout`
4. Select: **"My Habit"**
5. Click **"Create"**

**In Window 2 (User2):**

1. Go to **Habits** page
2. Click on **"Partner's"** tab
3. You should see "Evening Workout" (User1's habit)
4. Since it's not completed, you should see a **"Nudge"** button
5. Click the **"Nudge"** button

**In Window 1 (User1):**

1. You should receive a push notification!

## Troubleshooting

### "VAPID public key is not configured"

-   Make sure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is in your `.env` file
-   Restart the server after adding keys
-   Make sure you're using `npm start` (production mode) not `npm run dev`

### "Please enable notifications to send nudges"

-   Go to Settings and click "Enable" under Notifications
-   Make sure you allowed notifications when browser asked

### "Partner has not enabled notifications"

-   Your partner needs to go to Settings and enable notifications first
-   Both users must enable notifications

### No notification received

1. Check browser notification permissions:
    - Chrome: Settings → Privacy and security → Site settings → Notifications
    - Make sure localhost is allowed
2. Make sure you're using HTTPS or localhost (not http://192.168.x.x)
3. Check browser console for errors (F12)
4. Make sure both users have notifications enabled
5. Try refreshing both windows

### Notifications work but app doesn't open

-   This is normal in development
-   In production with HTTPS, clicking notification will open the app

## Quick Test Checklist

-   [ ] VAPID keys in `.env` file
-   [ ] Email updated in `VAPID_EMAIL`
-   [ ] Server restarted
-   [ ] Two test accounts created
-   [ ] Both accounts linked as partners
-   [ ] Both users enabled notifications
-   [ ] Created a shared habit
-   [ ] One user completed it
-   [ ] Clicked "Nudge" button
-   [ ] Partner received notification ✅

## Testing in Development vs Production

**Development (`npm run dev`):**

-   May have some limitations
-   Service worker might not register properly
-   Use production build for best results

**Production (`npm run build && npm start`):**

-   Full functionality
-   Better service worker support
-   Recommended for testing

## Browser Support

✅ **Chrome/Edge** - Full support  
✅ **Firefox** - Full support  
⚠️ **Safari** - Limited support (iOS 16.4+)  
❌ **Opera** - May have issues

## Next Steps After Testing

Once notifications work:

1. Deploy to production (with HTTPS)
2. Add the same VAPID keys to your hosting platform
3. Test with real users!

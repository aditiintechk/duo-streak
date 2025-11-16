'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if user is already subscribed (only on mount or when user changes)
      const checkSubscription = async () => {
        if (!user) {
          setIsSubscribed(false);
          return;
        }
        
        try {
          // First check with server if subscription exists in DB
          const serverResponse = await fetch('/api/notifications/subscribe', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (serverResponse.ok) {
            const data = await serverResponse.json();
            if (data.subscribed) {
              // Verify browser subscription exists
              try {
                const registration = await navigator.serviceWorker.ready;
                const browserSubscription = await registration.pushManager.getSubscription();
                if (browserSubscription) {
                  // Both server and browser have subscription
                  setIsSubscribed(true);
                  return;
                } else {
                  // Server has subscription but browser doesn't - clear server
                  setIsSubscribed(false);
                  return;
                }
              } catch (swError) {
                console.warn('Service worker check error:', swError);
                setIsSubscribed(false);
                return;
              }
            }
          }
          
          // If no server subscription, check browser
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              // Browser has subscription but server doesn't - save it
              const saveResponse = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                      auth: arrayBufferToBase64(subscription.getKey('auth')!),
                    },
                  },
                }),
              });
              if (saveResponse.ok) {
                setIsSubscribed(true);
              } else {
                setIsSubscribed(false);
              }
            } else {
              setIsSubscribed(false);
            }
          } catch (swError) {
            setIsSubscribed(false);
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
          setIsSubscribed(false);
        }
      };
      
      // Only check if user is loaded
      if (user) {
        checkSubscription();
      }
    }
  }, [user]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications are not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      console.error('Notifications not supported or user not logged in');
      return false;
    }

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.error('Notification permission denied');
        return false;
      }

      // Get service worker registration
      // next-pwa should have registered it automatically, but we'll ensure it's ready
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser');
      }

      let registration;
      try {
        // Wait for service worker to be ready (next-pwa registers it on page load)
        // This might take a moment, so we'll wait with a timeout
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) => 
            setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
          )
        ]);
      } catch (readyError: any) {
        // If ready fails, try to get existing registration or register manually
        console.warn('Service worker not ready, attempting to register:', readyError.message);
        
        registration = await navigator.serviceWorker.getRegistration('/');
        
        if (!registration) {
          // Try to register manually - next-pwa should have created sw.js
          try {
            registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            // Wait a bit for it to install
            await new Promise(resolve => setTimeout(resolve, 1000));
            registration = await navigator.serviceWorker.ready;
          } catch (regError: any) {
            throw new Error(`Failed to register service worker: ${regError.message}. Make sure you've built the app with 'npm run build'`);
          }
        } else {
          // Use existing registration
          registration = await navigator.serviceWorker.ready;
        }
      }

      // Check if VAPID key is configured
      // In Next.js, we need to access it differently
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key is not configured. Make sure NEXT_PUBLIC_VAPID_PUBLIC_KEY is in your .env file and server is restarted.');
        alert('VAPID key not configured. Please check your environment variables and restart the server.');
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!),
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save subscription:', errorData);
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch (error: any) {
      console.error('Error subscribing to notifications:', error);
      alert(`Failed to enable notifications: ${error.message || 'Unknown error'}`);
      return false;
    }
  }, [isSupported, user, requestPermission]);

  const sendNudge = useCallback(async (habitId: string, habitTitle: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ habitId, habitTitle }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending nudge:', error);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    sendNudge,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


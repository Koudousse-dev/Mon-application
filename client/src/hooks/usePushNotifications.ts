import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      setIsSupported(supported);
    };

    checkSupport();

    // Check if already subscribed
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        }
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error("Les notifications push ne sont pas supportées par ce navigateur");
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("Permission de notifications refusée");
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // Get VAPID public key from server
      const vapidRes = await apiRequest('GET', '/api/push/vapid-public-key');
      const { publicKey } = await vapidRes.json();

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to backend
      await apiRequest('POST', '/api/push/subscribe', pushSubscription.toJSON());

      setSubscription(pushSubscription);
      setIsSubscribed(true);

      return pushSubscription;
    } catch (error: any) {
      console.error('Push subscription error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      return;
    }

    setIsLoading(true);

    try {
      // Unsubscribe from push notifications
      await subscription.unsubscribe();

      // Notify backend
      await apiRequest('POST', '/api/push/unsubscribe', { endpoint: subscription.endpoint });

      setSubscription(null);
      setIsSubscribed(false);
    } catch (error: any) {
      console.error('Push unsubscribe error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscription,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Push Notification Utility

const PUBLIC_VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY_HERE'; // User needs to provide this, or I'll use a placeholder for now and ask them to replace it. 
// Actually, looking at the user input, they generated keys but didn't provide the output string. 
// I will create the structure and ask them to fill in the key in a config variable or similar.
// For now, I'll assume they will replace 'REPLACE_WITH_YOUR_PUBLIC_KEY'.

// Converting VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushManager = {
    // Check if push is supported and registered
    checkSubscription: async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return false;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
    },

    // Subscribe user to push notifications
    subscribeUser: async (memberName, publicVapidKey) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Push messaging is not supported');
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        console.log('User is subscribed:', subscription);

        // Save to DB
        await DB.savePushSubscription({
            member_name: memberName,
            subscription: subscription
        });
        
        return subscription;
    }
};
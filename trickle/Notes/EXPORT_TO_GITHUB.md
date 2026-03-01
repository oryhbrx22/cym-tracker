# Exporting to GitHub & Hosting

Your project is now **fully configured** to run on GitHub Pages, Vercel, or Netlify, using **Firebase Firestore** as the backend.

## 1. Export Files
1.  Create a local folder (e.g., `cym-tracker`).
2.  Copy all files from this project into that folder. Ensure you maintain the folder structure (put `utils/`, `components/` in their respective folders).

## 2. Push to GitHub
1.  Initialize git:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Push to your repository.
3.  Enable **GitHub Pages** in your repository settings (Source: `main` branch).

## 3. Firebase Setup (Important!)
For the app to work, you must ensure your Firebase project allows read/write operations.
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: `cym-leaders-web-type-handouts`.
3.  Go to **Build > Firestore Database**.
4.  Go to the **Rules** tab.
5.  **For development/testing**, you can allow public access (Warning: Insecure for production):
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```
6.  **For production**, you should implement proper authentication (Firebase Auth) or restrict rules.

**Note on CORS:**
If your hosted site (e.g., `your-username.github.io`) cannot access the database, you might need to check the browser console for CORS errors. Usually, Firebase allows standard web clients, but ensure your domain is authorized in Firebase Console > Authentication > Settings > Authorized domains (if you add Auth later).

## 4. Push Notifications
Push notifications require a Service Worker and VAPID keys.
- The `sw.js` file is included.
- You need to generate VAPID keys and update `utils/push.js` with your PUBLIC key if you want this feature to work fully.
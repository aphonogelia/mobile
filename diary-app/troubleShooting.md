# Expo + Supabase OAuth on Android Emulator — Setup Guide

## Context

- Expo SDK 54, React Native, expo-router
- Supabase OAuth (GitHub / Google)
- Testing on physical Android emulator (Android Studio) via tunnel
- School machine with limited home disk space (`/home` = 4.7G, `/goinfre` = 140G)

---

## 1. Project & Routing Issues

### Problem: "Unmatched Route" on `/`
Expo Router doesn't auto-redirect from `/` to route groups like `(auth)` or `(app)`.

**Fix:** Add `app/index.tsx`:
```tsx
export default function Index() {
  return null
}
```
Let the root `_layout.tsx` handle all redirects via the auth state `useEffect`.

### Problem: Landing on diary instead of landing page
The `index.tsx` was redirecting to `/(auth)/landing`, but the auth `useEffect` in `_layout.tsx` immediately overrode it because a cached Supabase session existed.

**Fix:** Keep `index.tsx` returning `null`, and add a `signOut()` in the landing page for dev testing:
```tsx
useEffect(() => {
    supabase.auth.signOut()
}, [])
```

### Required folder structure
```
app/
├── _layout.tsx        ← root layout with auth guard
├── index.tsx          ← returns null, lets layout handle routing
├── (auth)/
│   ├── _layout.tsx    ← minimal <Slot />
│   └── landing.tsx
└── (app)/
    ├── _layout.tsx    ← minimal <Slot />
    └── diary.tsx
```

---


## 2. OAuth Redirect Issues

### Problem: Supabase OAuth redirect fails in Expo Go + tunnel
Custom schemes like `diaryapp://` don't work in Expo Go. The tunnel URL also changes every session, making `exp://IP:PORT` unreliable.

**Fix:** Build a proper development build with `expo-dev-client`.

---

## 3. Building the Dev APK

### Prerequisites
- EAS CLI installed globally
- Enough disk space (use `/goinfre` on school machines)

### Configure npm global path (school machine)
```bash
mkdir -p /goinfre/htharrau/npm-global
npm config set prefix /goinfre/htharrau/npm-global
export PATH=/goinfre/htharrau/npm-global/bin:$PATH
```

Add the export to `~/.zshrc` to persist it.

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Install expo-dev-client
```bash
npx expo install expo-dev-client
```

### Make sure `app.json` has the scheme and package name
```json
{
  "expo": {
    "scheme": "diaryapp",
    "android": {
      "package": "com.yourname.diaryapp"
    }
  }
}
```

### Build
```bash
eas build --profile development --platform android
```

EAS will:
- Create an EAS project
- Generate and store a keystore
- Upload your project and build remotely
- Return a downloadable `.apk`

### Common build error: missing assets
If the build fails with `cannot access file at './assets/images/icon.png'`, the icon files are missing. Fix:
```bash
cp assets/images/yourimage.png assets/images/icon.png
cp assets/images/yourimage.png assets/images/adaptive-icon.png
```

---

## 4. Installing & Running on Emulator

### Check emulator is running
```bash
adb devices
# Should show: emulator-5554   device
```

### Install the APK
Download the `.apk` from expo.dev, then:
```bash
adb install ~/Downloads/your-build.apk
# or if space is an issue:
adb install /goinfre/htharrau/your-build.apk
```

### Start dev server
```bash
cd /goinfre/htharrau/your-project
npx expo start --tunnel --android
```

The dev build connects to your tunnel automatically.

---

## 5. Supabase Redirect URL Setup

In your Supabase dashboard under **Authentication → URL Configuration → Redirect URLs**, add:

```
diaryapp://
exp://*/*
http://localhost:8081
```

In your app, use:
```tsx
const redirectTo = makeRedirectUri({
    native: 'diaryapp://',
})
```

The `diaryapp://` scheme is baked into the dev build APK, so it works regardless of tunnel URL changes.

---

## Key Gotchas

- Expo Go cannot handle custom URI schemes for OAuth — always use a dev build for auth testing
- Supabase may return a cached session on app start — use `signOut()` in dev to test the landing flow
# diary-app — Dev Knowledge Base

> Notion-friendly reference. Copy-paste each section into its own Notion page or keep as one document.

---

## Table of Contents

1. Project Setup
2. Expo Concepts
3. Supabase
4. Android / ADB
5. OAuth & Auth Flow
6. Common Errors & Fixes
7. Cheat Sheet

---

## 1. Project Setup

### Stack
- Expo SDK 54, Expo Router (file-based routing), TypeScript
- React Native 0.81 / React 19
- Supabase (auth + database + storage)
- Android emulator (Pixel 6) via Android Studio

### Daily workflow

```bash
make build   # First time / after adding a native module (~2–5 min)
make dev     # Every other day — Metro only, no recompile
make tunnel  # If testing on a physical device
```

### Installing dependencies

```bash
# Expo / React Native packages — ALWAYS use this
npx expo install <package>

# Pure JS libraries only
npm install <package>
```

### Reset / debug

```bash
npx expo doctor        # Detect version mismatches and broken deps
npx expo start -c      # Clear Metro cache
npx expo install --fix # Fix SDK version mismatches

# Full nuclear reset
make re                # fclean + reinstall + prebuild + build
```

### School machine disk setup

```bash
mkdir -p /goinfre/htharrau/npm-global
npm config set prefix /goinfre/htharrau/npm-global
export PATH=/goinfre/htharrau/npm-global/bin:$PATH
# Add the export line to ~/.zshrc
```

---

## 2. Expo Concepts

### Expo Go vs Dev Client

| | Expo Go | Dev Client |
|---|---|---|
| Setup | Scan QR, done | Build once with EAS |
| Custom URI schemes | ❌ | ✅ |
| Custom native modules | ❌ | ✅ |
| Hot reload | ✅ | ✅ |
| Good for | Quick prototypes | Real apps with auth, native features |

**Why this matters for auth:** OAuth redirects to `diaryapp://` — Expo Go doesn't know that scheme. Your compiled dev build does.

---

### Expo Router mental model

```
app/_layout.tsx     ← always mounted (your frame)
  <Slot />          ← dynamic: renders the current page
  <Footer />        ← stays mounted across navigation
```

`<Slot />` is the equivalent of `{children}` in classic React.

**Entry point:** `app/_layout.tsx` — Expo Router takes over automatically. No `index.ts` or `registerRootComponent`.

**Required folder structure:**

```
app/
├── _layout.tsx        ← root layout with auth guard
├── index.tsx          ← returns null, lets layout handle routing
├── (auth)/
│   ├── _layout.tsx
│   └── landing.tsx
└── (app)/
    ├── _layout.tsx
    └── diary.tsx
```

---

### useSegments — avoiding infinite redirect loops

```ts
const segments = useSegments()
// /(auth)/landing  →  ['(auth)', 'landing']
// /(app)/diary     →  ['(app)', 'diary']

const inAuth = segments[0] === '(auth)'
// Redirect only if: no session AND not already in auth
```

Without this check: no session → redirect to `/landing` → no session → redirect → infinite loop.

---

### Persistent footer pattern (clean architecture)

```
app/
  _layout.tsx        ← providers only (no state)
  (main)/
    _layout.tsx      ← persistent UI lives here
    index.tsx
    page2.tsx
```

```tsx
// (main)/_layout.tsx
export default function MainLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <Footer />
    </View>
  )
}
```

**Rules to avoid re-renders:**
- Wrap `Footer` in `React.memo()`
- No changing props on Footer
- No state in the layout that wraps Footer

---

### useEffect with `[]`

Runs **once** when the component mounts. Not on every render.

---

### Environment variables

Expo requires the `EXPO_PUBLIC_` prefix for variables to be accessible client-side:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### hitSlop — expanding tap area

```tsx
hitSlop={8}
// Expands tappable area by 8px on all sides

hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
```

---

### React Fragments

```tsx
// Groups multiple elements without adding a wrapper View
<>
  <Pressable>GitHub</Pressable>
  <Pressable>Google</Pressable>
</>
// Same as <React.Fragment>...</React.Fragment>
```

---

### Props destructuring in React Native

```tsx
// ❌ Wrong — onProfileEdit is the entire props object
export default function Profile(onProfileEdit: () => void)

// ✅ Correct — destructure from props object
export default function Profile({ onProfileEdit }: { onProfileEdit: () => void })
```

---

### `!!` double negation

```ts
// selectedEntry is Entry | null
!!selectedEntry   // false if null, true if Entry
// Same as: selectedEntry !== null
// Use when a prop expects boolean but you have object | null
```

---

## 3. Supabase

### Client setup

```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: AsyncStorage } }
)
```

**Why AsyncStorage:** React Native has no `localStorage`. Without it, the session dies when the component unmounts or the app restarts.

---

### Row Level Security (RLS)

The session JWT is automatically attached to every Supabase request. You never pass `user_id` manually — Supabase reads `auth.uid()` server-side.

```sql
CREATE POLICY "users see own entries"
ON entries FOR SELECT
USING (auth.uid() = user_id);
```

```ts
// fetchEntries — no user_id needed, RLS handles it
const { data } = await supabase.from('entries').select('*')
```

---

### getSession() vs getUser()

| | `getSession()` | `getUser()` |
|---|---|---|
| Network call | ❌ reads local storage | ✅ verifies with Supabase |
| Speed | Fast | Slower |
| Use for | App init, getting user_id, checking auth | Sensitive ops where you need a guaranteed fresh token |

In practice: use `getSession()` for most things. Supabase validates the JWT on every DB request anyway.

---

### Functions vs Triggers

```
Function = a recipe (defines what to do, not when)
Trigger  = "cook this recipe every time someone orders"
```

```sql
-- Function: creates a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fires the function automatically
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Without the trigger, the function just sits there. Nothing happens on signup.

---

### Useful trigger: auto-set user_id on insert

```sql
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS trigger AS $$
BEGIN
  new.user_id = auth.uid();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON entries
FOR EACH ROW EXECUTE FUNCTION set_user_id();
```

---

### Schema

```sql
create table public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  username   text,
  avatar_url text,
  full_name  text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.entries (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  title      text not null,
  content    text,
  mood       text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

`timestamptz` = timestamp with timezone, stored in UTC. Always prefer over `timestamp`.

---

### Views

```sql
-- Mood breakdown as percentages
CREATE OR REPLACE VIEW mood_percentages AS
WITH mood_counts AS (
  SELECT mood, COUNT(*) AS count
  FROM entries
  WHERE mood IS NOT NULL AND mood != ''
  GROUP BY mood
),
total AS (
  SELECT COUNT(*) AS total_count
  FROM entries
  WHERE mood IS NOT NULL AND mood != ''
)
SELECT mood, count,
  ROUND((count::numeric / total_count) * 100, 2) AS percentage
FROM mood_counts, total
ORDER BY percentage DESC;

-- Total entries per user
CREATE OR REPLACE VIEW user_entry_stats AS
SELECT user_id, COUNT(*) AS total_entries
FROM entries
GROUP BY user_id;

-- Make views respect RLS
ALTER VIEW mood_percentages SET (security_invoker = true);
ALTER VIEW user_entry_stats SET (security_invoker = true);
```

---

### Image upload to Supabase Storage

Android can't upload raw `file:///...` URIs directly. You must fetch + convert to blob first:

```ts
const blob = await (await fetch(uri)).blob()
await supabase.storage.from('avatars').upload(path, blob)
```

**Cache buster:** Supabase storage keeps the same URL on upsert. Append `?t=${Date.now()}` to force React Native to re-fetch the image.

---

### expo-auth-session vs Supabase OAuth

| | expo-auth-session | Supabase OAuth |
|---|---|---|
| Client secret | Exposed in app ⚠️ | Stays on Supabase server ✅ |
| Token exchange | Manual | Handled by Supabase ✅ |
| Session management | Manual | Handled by Supabase ✅ |
| Security | Risky | Safe |

Use Supabase OAuth.

---

## 4. Android / ADB

ADB = Android Debug Bridge — terminal bridge between your machine and the Android emulator/device.

### Essential commands

```bash
adb devices                          # List connected devices
adb install /path/to/app.apk         # Install APK
adb uninstall com.package.name       # Uninstall app
adb push <local> <remote>            # Send file to emulator
adb pull <remote> <local>            # Get file from emulator
adb shell                            # Open terminal inside Android
adb logcat                           # Stream Android logs
adb reboot                           # Reboot emulator
```

### Option A — Direct APK install (simplest, no emulator needed)

Build remotely with EAS:
```bash
eas build --profile development --platform android
```

Download the `.apk` from expo.dev, install it:
```bash
adb install /path/to/your-build.apk
```

Then start Metro:
```bash
make dev       # local network
make tunnel    # physical device on different network
```

### Option B — Emulator (compile locally)

```bash
make build   # first time / after adding a native module (~2–5 min)
make dev     # daily
```

### Physical Android device (USB)

1. Settings → About phone → tap **Build number** 7 times
2. Settings → Developer options → enable **USB debugging**
3. Plug in via USB
4. `adb devices` → confirm it appears
5. Either install the APK via `adb install` or run `make build` (Expo asks which target)

### Push images to emulator gallery

```bash
adb push ~/goinfre/diary/diary-app/assets/images/* /sdcard/Pictures/
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE \
  -d file:///sdcard/Pictures/
```

### Testing on iPhone

iOS requires macOS + Xcode. On Linux, use EAS cloud build:

```bash
npx eas build --platform ios --profile development
```

Requires an Apple Developer account ($99/year). Install via TestFlight.

---

## 5. OAuth & Auth Flow

### Setup in Supabase dashboard

`Authentication → URL Configuration → Redirect URLs`:

```
diaryapp://
exp://*/*
http://localhost:8081
```

### In the app

```tsx
import { makeRedirectUri } from 'expo-auth-session'

const redirectTo = makeRedirectUri({ native: 'diaryapp://' })

await supabase.auth.signInWithOAuth({
  provider: 'github', // or 'google'
  options: { redirectTo }
})
```

### Dev testing — force sign out on landing

```tsx
useEffect(() => {
  supabase.auth.signOut()
}, [])
```

Prevents cached Supabase sessions from skipping the landing page during dev.

---

### useRef with BottomSheet

```ts
const bottomSheetRef = useRef<BottomSheet>(null)

const openSheet  = () => bottomSheetRef.current?.expand()
const closeSheet = () => bottomSheetRef.current?.close()
```

```
useRef<BottomSheet>(null)
     │              └── starts as null (not mounted yet)
     └── typed so TypeScript knows the available methods

bottomSheetRef.current?.expand()
              │         └── opens the sheet
              └── the actual BottomSheet instance (? = could still be null)
```

---

## 6. Common Errors & Fixes

### "Unmatched Route" on `/`

Expo Router doesn't auto-redirect from `/` to route groups.

**Fix:** Add `app/index.tsx` returning null, let `_layout.tsx` handle redirects.

```tsx
export default function Index() {
  return null
}
```

---

### OAuth redirect fails in Expo Go

Custom schemes like `diaryapp://` don't work in Expo Go.

**Fix:** Build a dev client with `expo-dev-client` and EAS:

```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```

---

### EAS build fails — missing assets

```bash
cp assets/images/yourimage.png assets/images/icon.png
cp assets/images/yourimage.png assets/images/adaptive-icon.png
```

---

### Session dies on app restart

React Native has no `localStorage`. Supabase needs AsyncStorage:

```bash
npx expo install @react-native-async-storage/async-storage
```

Then pass it to `createClient` (see Supabase Client Setup above).

---

### Peer dependency conflicts

```bash
npm install --legacy-peer-deps   # temporary fix only
```

---

### Android Studio lock file error

```bash
rm ~/.var/app/com.google.AndroidStudio/config/Google/AndroidStudio2025.3.4/.lock
```

---

### Image not refreshing after upload (Supabase storage)

The CDN and React Native's image cache both think nothing changed because the URL is the same after upsert.

**Fix:** append a cache buster:
```ts
const url = `${publicUrl}?t=${Date.now()}`
```

---

## 7. Cheat Sheet

### Expo commands

| Action | Command |
|---|---|
| Expo-native dependency | `npx expo install <pkg>` |
| JS-only library | `npm install <pkg>` |
| Run app | `npx expo start` |
| Run with cache clear | `npx expo start -c` |
| Debug setup | `npx expo doctor` |
| Fix SDK mismatches | `npx expo install --fix` |
| EAS Android build | `eas build --profile development --platform android` |
| EAS iOS build | `eas build --platform ios --profile development` |

### Make commands (this project)

| Command | What it does |
|---|---|
| `make build` | Compile + install APK + start Metro |
| `make dev` | Metro only (daily use) |
| `make tunnel` | Metro with tunnel (physical device) |
| `make re` | Full nuclear reset |
| `make clean` | Remove node_modules |
| `make fclean` | Remove everything |

### Supabase patterns

| Situation | Use |
|---|---|
| App init / check auth | `getSession()` |
| Sensitive op, need fresh token | `getUser()` |
| Insert — pass user_id? | No. Use trigger or RLS |
| Fetch entries — filter by user? | No. RLS does it automatically |
| Upload image | `fetch(uri).blob()` → Supabase upload |
# diary-app

A full-stack mobile journaling app for tracking mood over time — built solo from scratch with React Native, Expo, and Supabase.

Users can log daily entries, browse their history in a calendar or list view, visualize mood trends with live stats, and personalize their profile. Authentication is handled via OAuth (GitHub / Google) with secure, per-user data enforced at the database level through Row Level Security.


<div align="center">
  <img src="assets/video.gif" width="250" alt="Screen Recording" />
</div>

### Features

- 📅 **Calendar view** — browse past entries by date
- 📋 **List view** — scrollable entry history
- 📊 **Mood stats** — percentage breakdown of moods over time
- 👤 **Customizable profile** — username, full name, avatar upload
- 🔐 **OAuth authentication** — GitHub & Google via Supabase Auth
- 🔒 **Row Level Security** — users only ever see their own data

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Language | TypeScript |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Auth | OAuth 2.0 — GitHub & Google |
| Deployment | EAS Build (Android APK) |

---

## Prerequisites

- Node.js
- EAS CLI (`npm install -g eas-cli`)
- [ADB](https://developer.android.com/tools/adb) installed and available in your PATH
- Android Studio with a Pixel 6 AVD configured *(optional — only needed if using the emulator)*

---

## Quick Start

```bash
# First time — full native compile (~2–5 min)
make build

# Daily — Metro bundler only (APK already installed)
make dev

# Physical device or tunnel needed
make tunnel
```

---

## Make Commands

### Every day
| Command | Description |
|---|---|
| `make build` | Compile native Android code, install APK, start Metro |
| `make dev` | Start Metro only — no recompile (use daily) |

### Other
| Command | Description |
|---|---|
| `make studio` | Boot Android emulator manually |
| `make tunnel` | Metro with tunnel (physical devices) |
| `make web` | Expo web |
| `make install` | Install JS dependencies |
| `make lint` | Run ESLint |
| `make depcheck` | Check for unused dependencies |
| `make pics` | Push assets to emulator gallery |

### Cleanup (least → most destructive)
| Command | What it removes |
|---|---|
| `make clean` | `node_modules` |
| `make clean-build` | Android build output (~700MB) |
| `make clean-android` | Entire `android/` folder |
| `make clean-cache` | Metro/Expo cache |
| `make clean-emulator` | Wipes emulator data |
| `make fclean` | All of the above + `package-lock.json` |

### Nuclear reset
```bash
make re   # fclean + reinstall + prebuild + build
```

---

## Project Structure

```
app/
├── _layout.tsx          ← root layout with auth guard
├── index.tsx            ← returns null, lets layout handle routing
├── (auth)/
│   ├── _layout.tsx      ← minimal <Slot />
│   └── landing.tsx
└── (app)/
    ├── _layout.tsx      ← minimal <Slot />
    └── diary.tsx
```

---

## Auth Flow

Uses **Supabase OAuth** (GitHub / Google) with a custom dev build — Expo Go cannot handle custom URI schemes.

```tsx
const redirectTo = makeRedirectUri({ native: 'diaryapp://' })
```

Supabase redirect URLs to configure in the dashboard (`Authentication → URL Configuration`):
```
diaryapp://
exp://*/*
http://localhost:8081
```

---

## Database

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

### RLS

Row Level Security means you never need to manually pass `user_id` in queries — Supabase reads `auth.uid()` from the JWT on every request.

```sql
CREATE POLICY "users see own entries"
ON entries FOR SELECT
USING (auth.uid() = user_id);
```

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

## Android Testing

### Option A — Direct APK install (no emulator needed)

Build the APK remotely via EAS:
```bash
eas build --profile development --platform android
```

Download the `.apk` from expo.dev, then install it directly on your phone or emulator:
```bash
adb install /path/to/your-build.apk
```

Then start Metro:
```bash
make dev      # or: make tunnel for physical device
```

### Option B — Emulator (compile locally)
```bash
make build    # first time (~2–5 min)
make dev      # daily
```

### Physical Android device (USB)
1. Settings → About phone → tap **Build number** 7 times
2. Settings → Developer options → enable **USB debugging**
3. Plug in via USB
4. `adb devices` — confirm it's listed
5. Either install the APK via `adb install` or run `make build` (Expo will ask which target)

### iOS
iOS requires macOS + Xcode. On Linux, use EAS cloud build:
```bash
npx eas build --platform ios --profile development
```
Requires an Apple Developer account ($99/year). Install via TestFlight.



## Environment

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Expo requires the `EXPO_PUBLIC_` prefix for client-side env vars.

---

## Supabase Client

```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: AsyncStorage } }
)
```

`AsyncStorage` is required — React Native has no `localStorage`, so without it the session dies on unmount.
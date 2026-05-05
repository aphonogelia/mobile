## FOOTER PERSISTENCE WITH EXPO ROUTER

Correct pattern with Expo Router: persistent layout.

# Fix your RootLayout:
```
export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Slot />     {/* pages change here */}
          <Footer />   {/* stays mounted */}
        </View>
      </SafeAreaProvider>
    </AppProvider>
  );
}
```


BUT:  prevent that RootLayout re-rendering when navigation happens

1. Memorize Footer
```
const Footer = React.memo(() => {
  console.log("render footer"); // debug
  return <View>{/* UI */}</View>;
});
```
2. Ensure Footer has NO changing props

3. Avoid state in RootLayout
If RootLayout has state: ```const [x, setX] = useState(...)```
→ every update re-renders everything.


# Better architecture (clean)

Create a separate layout file:
```
app/
  _layout.tsx        // root (providers only)
  (main)/
    _layout.tsx      // persistent UI (footer here)
    index.tsx
    page2.tsx
(main)/_layout.tsx:
import { Slot } from 'expo-router';

export default function MainLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <Footer />
    </View>
  );
}
```
Now:

navigating inside (main) → footer stays mounted
only <Slot /> updates
Mental model
<Slot /> = dynamic content
_layout.tsx = persistent wrapper
persistence depends on where you place the layout in the tree



# The useEffect with [] runs once when the component mounts 



## getSession() vs getUser()

# getSession()

Reads from local storage — no network call
Returns the session object (access token, refresh token, user)
Fast but the token might be expired
Use when you just need the user id or to check if logged in

# getUser()

Makes a network request to Supabase to verify the token
Slower but guaranteed fresh/valid
Use when you need to be sure the session is still valid (e.g. before a sensitive operation)


# In practice:

getSession() → app init, checking auth state, getting user_id for inserts
getUser() → you rarely need it with RLS, since Supabase validates the JWT on every request anyway

So your createEntry and modifEntry can safely switch to getSession() — it's faster and the DB will reject the request anyway if the token is invalid.

# hitSlop
It's the invisible touch area extension around a component. Useful for small buttons that are hard to tap accurately.
```
hitSlop={8}
// expands the tappable area by 8px on all sides

hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}  
// or control each side individually
```


# const blob = await response.blob()

10:43 PM
Claude a répondu : A blob (Binary Large Object) is just raw binary data — in this case the image file bytes.
A blob (Binary Large Object) is just raw binary data — in this case the image file bytes.

The flow is:

uri (local file path on phone)
  → fetch(uri)          — reads the file
  → response.blob()     — converts it to raw binary
  → supabase upload     — sends those bytes to storage
The URI from expo-image-picker is a local path like file:///var/mobile/... — Supabase can't read that directly, so you need to fetch it first and convert to binary that can be sent over the network.


#  Props in React are always an object, so you need to destructure:
```
// ❌ wrong - onProfileEdit is the entire props object, not a function
export default function Profile(onProfileEdit: () => void)

// ✅ correct - destructures onProfileEdit from the props object
export default function Profile({ onProfileEdit }: { onProfileEdit: () => void })
```


# bottomSheetRef & useRef
```
const bottomSheetRef = useRef<BottomSheet>(null) 
const openSheet = () => bottomSheetRef.current?.expand() 
const closeSheet = () => bottomSheetRef.current?.close()??
```
useRef creates a reference to the bottom sheet component so you can call its methods directly.
useRef creates a reference to the bottom sheet component so you can call its methods directly.

useRef<BottomSheet>(null)
     │              │
     │              └── starts as null (not mounted yet)
     └── typed as BottomSheet so TypeScript knows what methods are available
Then:

bottomSheetRef.current?.expand()
              │         │
              │         └── opens the sheet
              └── the actual BottomSheet component instance
                  (? because it could still be null)
So instead of controlling open/closed with state like const [isOpen, setIsOpen] = useState(false), you call methods directly on the component — expand() to open, close() to close. That's the pattern @gorhom/bottom-sheet uses.


# Expo Cheat Sheet

## Project setup
```
npx create-expo-app my-app
cd my-app
npx expo start
```
## Installing dependencies (RULES)
Expo / React Native packages (IMPORTANT)
npx expo install <package>

Examples:

npx expo install expo-font expo-constants expo-linking
npx expo install react-native-reanimated
npx expo install expo-router

👉 Always use for:

Expo SDK packages
React Native native modules
anything touching iOS/Android runtime
Generic JS libraries
```npm install <package>```

Examples:  ```npm install axios lodash zod```
👉 Only for pure JS logic (no native code)

## Running app
```
npx expo start
```
Useful: ```npx expo start -c   # clear cache```
## Debugging commands
Check project health```npx expo doctor```
Detects:

version mismatch
missing deps
incompatible SDK packages
Full reset (when broken)
```
rm -rf node_modules package-lock.json
npm install
```

or:
```
npx expo install --fix
Clear Metro cache
npx expo start -c
```
## React / Expo version rules

❌ Don’t install manually:

npm install react react-native react-dom

✔ Correct:

npx expo install react react-dom
## Reanimated setup (if used)
babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'], // MUST be last
}
## Common errors & fixes

### Peer dependency conflicts

Temporary fix: ```npm install --legacy-peer-deps``` 👉 Use only for debugging, not final state

### Expo mismatch errors

Fix by: 
```
npx expo install react react-dom
npx expo doctor
```

## Mental model
```
  Action            	          Command
Expo-native dependency	        expo install
JS library	                    npm install
Run app	                        expo start
Debug setup	                    expo doctor
Reset cache	                    expo start -c
```



Android can't upload raw file URIs (file:///...) directly to Supabase Storage — you need to fetch the local URI first and convert it to a blob. Share your uploadAvatar function and I can give you the exact fix.


# Android Debug Bridge

ADB = Android Debug Bridge — it's a command line tool that lets you communicate with your Android emulator (or a real phone) from your terminal. Think of it as a bridge between your Mac and the virtual Android device.
You can use it to:

push/pull files to the emulator
run shell commands inside Android
install APKs
see logs

Devices
```
adb devices
```
Files
```
adb push <local> <remote> — send file from Mac to emulator
adb pull <remote> <local> — grab file from emulator to Mac
```
App
```
adb install app.apk — install an APK
adb uninstall com.package.name — uninstall an app
```
Logs
```
adb logcat — stream all Android logs (very noisy, but useful)
```
Shell
```
adb shell — open a terminal inside Android
adb shell <command> — run a single command and exit
```
Device
```
adb devices — list connected devices/emulators
adb reboot — reboot the emulator
```



adb push ~/Pictures/tiger.png /sdcard/Pictures/  
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE \
  -d file:///sdcard/Pictures/photo.jpg
adb shell "cd /sdcard/Pictures  && ls"
The files are pushed to /sdcard/Pictures/ — let's verify:
bashadb shell ls /sdcard/Pictures/
If they show up there but you can't see them in the Gallery app, the media scanner hasn't indexed them yet. Force a rescan:
bashadb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/

The ?t=${Date.now()} cache buster is a classic gotcha with Supabase storage (and S3-style storage in general) — since the file path stays the same on upsert, the CDN and React Native's image cache both think nothing changed.
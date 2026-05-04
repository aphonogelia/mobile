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
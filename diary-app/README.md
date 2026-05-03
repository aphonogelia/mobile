# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
<>


## SUPABASE

# concept clé de Supabase : Row Level Security (RLS).
-- Exemple : un user ne voit que SES entrées
````
CREATE POLICY "users see own entries"
ON diary_entries
FOR SELECT
USING (auth.uid() = user_id);
````

# create client supabase
````
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
````

# expo-auth-session vs Supabase OAuth
````
                    expo-auth-session   Supabase OAuth
Client Secret       Exposed in app ⚠️   Stays on Supabase server ✅
Token exchange      You handle manually Supabase handles it ✅
Session management  You handle manually Supabase handles it ✅
Code complexity     High                Low
Security            Risky               Safe

````
## EXPO ROUTER

Avec Expo Router le point d'entrée c'est app/_layout.tsx — Expo Router prend le contrôle automatiquement. Pas de index.ts ou app.tsx à la racine.
C'est justement une des différences avec ta structure précédente qui avait index.ts → registerRootComponent(App). Expo Router gère tout ça en interne.

<Slot /> c'est le concept central d'Expo Router.

En gros : "affiche ici la page qui correspond à l'URL courante"
_layout.tsx    ← le cadre, toujours présent
  <Slot />     ← ici s'affiche landing.tsx OU diary.tsx selon la route
C'est l'équivalent de {children} en React classique. Le layout reste monté, seul le contenu du <Slot /> change quand tu navigues.

Sans Slot, Expo Router ne saurait pas où injecter les pages. C'est obligatoire dans chaque _layout.tsx.

# Expo nécessite le préfixe EXPO_PUBLIC_ pour que les variables soient accessibles côté client.

## usesegment

useSegments retourne un tableau des segments de la route courante.

Exemples concrets :
URL: /(auth)/landing   →   segments = ['(auth)', 'landing']
URL: /(app)/diary      →   segments = ['(app)', 'diary']

Donc segments[0] c'est juste le premier segment — le groupe dans lequel tu es :
typescriptconst inAuth = segments[0] === '(auth)'
// true  si tu es sur /(auth)/landing
// false si tu es sur /(app)/diary

Pourquoi on en a besoin ?
Pour éviter les redirections infinies. Sans ça :

Pas de session → redirige vers /landing
/landing se charge → pas de session → redirige vers /landing
boucle infinie 🔄

Avec inAuth on dit : "si pas de session et je ne suis pas déjà dans auth → alors redirige".

## ESLint 
c'est un linter — il lit ton code sans l'exécuter et signale les problèmes.

Dans VS Code, les problèmes apparaissent en rouge/jaune directement dans le code. Tu peux aussi lancer :
npx eslint .
Pour voir tous les problèmes d'un coup.

eslint-config-expo spécifiquement ajoute des règles pour 
- React Native (pas de window, pas de document...)
- Les hooks React (useEffect avec les bonnes dépendances)
- TypeScript


# https://console.cloud.google.com/apis/dashboard?referrer=search&project=agile-tangent-494614-a3&supportedpurview=project


create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text,
  mood text[] default '{}',
  created_at timestamptz default now()
);

timestamptz is short for timestamp with time zone.

timestamp — stores the date/time but has no timezone info (ambiguous)
timestamptz — stores the date/time normalized to UTC, aware of timezones

For fetchEntries — no getUserid needed. RLS handles it automatically. When Supabase receives the request it reads auth.uid() from the session token and only returns rows where user_id matches. You just call .select('*') and you only get back your own entries.

The session token is passed automatically via the Supabase client. 
typescriptexport const supabase = createClient(supabaseUrl, supabaseAnonKey)
When the user logs in, Supabase stores the session (JWT token) internally in the client. Every request you make through that same supabase instance automatically attaches the token in the request headers — you never have to do it manually.


## function vs trigger 
In PostgreSQL (and therefore Supabase), a function is just a piece of logic stored in the database. It only runs if something explicitly calls it.

# Function
create function handle_new_user() ...
Defines what to do
Not executed automatically
# Trigger
create trigger ...
after insert on auth.users
Defines when to do it
Calls the function automatically


# Without trigger, your function just sits there.
Nothing happens when a user signs up:
auth.users INSERT → no effect on profiles
You would have to manually call it (which you typically can’t from the client for security reasons).

# With trigger, You connect the two:
auth.users INSERT → trigger fires → function runs → profiles row created

# Analogy
Function = a recipe
Trigger = “cook this recipe every time someone orders”
Without the trigger, nobody ever cooks.



## !! converts a value to a boolean.

selectedEntry is Entry | null
!null → true, !Entry → false
!!null → false, !!Entry → true

So !!selectedEntry just means "is there a selected entry?". Since visible expects a boolean and selectedEntry is not one, you need the conversion. You could also write it as selectedEntry !== null — same thing, just more explicit.


# rm ~/.var/app/com.google.AndroidStudio/config/Google/AndroidStudio2025.3.4/.lock




## React fragments 
— a way to return multiple elements without adding an extra wrapper <View> or <div> to the layout.

````
<>
    <Pressable ...>GitHub</Pressable>
    <Pressable ...>Google</Pressable>
</>
````
is exactly the same as 
````<React.Fragment>...</React.Fragment>.```` It groups the two buttons so the ternary has a single return value, without inserting any extra node into the component tree.

````
useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) supabase.auth.signOut()
    })
}, [])
````

## Expo/React Native doesn't have a built-in storage layer for Supabase to persist the session.
By default Supabase uses localStorage which doesn't exist in React Native, so the session lives only in memory and dies the moment the component unmounts or the app restarts.
Fix — add AsyncStorage to your Supabase client:
npx expo install @react-native-async-storage/async-storage


## TEST  IPHONE
You can't build for iOS on Linux — Xcode is macOS only. Your options are:
- Use a Mac — run make build with npx expo run:ios instead
- EAS Build (Expo's cloud build service) — builds the iOS IPA in the cloud without needing a Mac locally:````npx eas build --platform ios --profile development```` 

Then install the build on your iPhone via TestFlight or direct install. You need an Apple Developer account ($99/year) for this.
For your use case, EAS Build is probably the most realistic path if you want to test on a real iPhone from Linux.

## TEST  ANDROID
Enable USB debugging on your phone and plug it in:

On your Android phone:
- Settings → About phone → tap "Build number" 7 times
- Settings → Developer options → enable "USB debugging"

Plug it in via USB. Check it's detected:
````/goinfre/htharrau/android-sdk/platform-tools/adb devices````
You should see your device listed.

Then just run make build — Expo will detect your phone alongside the emulator and ask which one to install on. Pick your phone.
# Android Emulator — Setup & Commands

Reference for running diary-app on the Android emulator (Pixel 6) via Android Studio.

---

## Prerequisites

- Android Studio installed
- Pixel 6 AVD configured
- ADB available at `/goinfre/htharrau/android-sdk/platform-tools/adb`

---

## Daily Workflow

```bash
# First time, or after adding a native module (~2–5 min)
make build

# Every other day — Metro only, no recompile
make dev

# Boot the emulator manually (not needed if make build handles it)
make studio
```

---

## Cleanup

| Command | What it removes |
|---|---|
| `make clean` | `node_modules` |
| `make clean-build` | Android build output (~700MB) |
| `make clean-android` | Entire `android/` folder |
| `make clean-cache` | Metro/Expo cache |
| `make clean-emulator` | Wipes emulator data (boots fresh) |
| `make fclean` | All of the above + `package-lock.json` |

```bash
make re   # nuclear reset: fclean + reinstall + prebuild + build
```

---

## Pushing Files to the Emulator

### Push images to the emulator gallery

```bash
adb push ~/goinfre/diary/diary-app/assets/images/* /sdcard/Pictures/
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE \
  -d file:///sdcard/Pictures/
```

### Verify files landed

```bash
adb shell "cd /sdcard/Pictures && ls"
```

---

## ADB Cheat Sheet

```bash
adb devices                          # List connected devices/emulators
adb install /path/to/app.apk         # Install an APK
adb uninstall com.package.name       # Uninstall an app
adb push <local> <remote>            # Send file from machine to emulator
adb pull <remote> <local>            # Get file from emulator to machine
adb shell                            # Open a terminal inside Android
adb shell <command>                  # Run a single command and exit
adb logcat                           # Stream all Android logs
adb reboot                           # Reboot the emulator
```

---

## School Machine Notes

ADB is not in the system PATH by default — use the full path:

```bash
/goinfre/htharrau/android-sdk/platform-tools/adb devices
```

Or add it to `~/.zshrc` permanently:

```bash
export PATH=/goinfre/htharrau/android-sdk/platform-tools:$PATH
```

npm global packages also need a custom prefix to avoid filling `/home` (4.7G):

```bash
mkdir -p /goinfre/htharrau/npm-global
npm config set prefix /goinfre/htharrau/npm-global
export PATH=/goinfre/htharrau/npm-global/bin:$PATH
```

---

## Fixing Android Studio Lock File

If Android Studio won't launch:

```bash
rm ~/.var/app/com.google.AndroidStudio/config/Google/AndroidStudio2025.3.4/.lock
```
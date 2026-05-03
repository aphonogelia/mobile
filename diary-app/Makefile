NAME = diary-app

help:
	@echo "Available commands:"
	@echo ""
	@echo "  FIRST TIME / AFTER ADDING A NATIVE MODULE:"
	@echo "    make studio        - (1) Boot the Android emulator"
	@echo "    make build         - (2) Compile native code, install APK, start Metro"
	@echo ""
	@echo "  EVERY DAY (after first time setup):"
	@echo "    make studio        - (1) Boot the Android emulator"
	@echo "    make dev           - (2) Start Metro bundler (no recompile)"
	@echo ""
	@echo "  FULL NUCLEAR RESET (something is broken, start from scratch):"
	@echo "    make re            - Kill everything, clean, reinstall, reboot emulator, rebuild"
	@echo ""
	@echo "  OTHER:"
	@echo "    make install       - Install JS dependencies only"
	@echo "    make tunnel        - Start Metro with tunnel (for physical devices)"
	@echo "    make web           - Start Expo web"
	@echo "    make depcheck      - Check for unused dependencies"
	@echo "    make clean         - Remove node_modules"
	@echo "    make fclean        - Remove node_modules + lock file"

# ─── EMULATOR ────────────────────────────────────────────────────────────────

# Boot the Android emulator (no snapshot = clean state)
# Run this first, always, before build or dev
studio:
	/goinfre/htharrau/android-sdk/emulator/emulator -avd Pixel_6 -no-snapshot-load &

# ─── FIRST TIME / NATIVE MODULE ADDED ────────────────────────────────────────

# Compiles native Android code, installs the APK on the emulator, then starts Metro.
# Slow (~2-5 min). Only needed once, or after adding a native module (e.g. AsyncStorage).
build:
	npx expo run:android

# ─── EVERY DAY ───────────────────────────────────────────────────────────────

# Starts Metro bundler only. No recompile. Fast.
# Use this for daily development once the APK is already installed.
dev:
	npx expo start --dev-client --clear

tunnel:
	npx expo start --dev-client --tunnel --clear

web:
	npx expo start --web

# ─── DEPENDENCIES ────────────────────────────────────────────────────────────

install:
	npm install --legacy-peer-deps

depcheck:
	npx depcheck

# ─── CLEANUP ─────────────────────────────────────────────────────────────────

clean:
	rm -rf node_modules

fclean: clean
	rm -f package-lock.json

# ─── NUCLEAR RESET ───────────────────────────────────────────────────────────

# Full reset: kills processes, cleans everything, reinstalls deps,
# boots emulator, prebuild, recompiles native code, installs APK, starts Metro.
re: fclean
	@echo "Killing any running Expo/Metro processes..."
	-pkill -f "expo" 2>/dev/null; true
	-pkill -f "metro" 2>/dev/null; true
	@echo "Installing dependencies..."
	$(MAKE) install
	@echo "Regenerating android/ folder from app.json..."
	npx expo prebuild --clean --platform android
	@echo "Launching emulator..."
	/goinfre/htharrau/android-sdk/emulator/emulator -avd Pixel_6 -no-snapshot-load &
	@echo "Waiting for emulator to boot..."
	/goinfre/htharrau/android-sdk/platform-tools/adb wait-for-device
	@echo "Building and installing dev client..."
	$(MAKE) build

.PHONY: help install build dev tunnel web studio clean fclean re depcheck
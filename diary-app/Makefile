NAME = diary-app

help:
	@echo "Available commands:"
	@echo "  make install   - Install dependencies"
	@echo "  make android   - Start Expo (android)"
	@echo "  make tunnel    - Start Expo (tunnel)"
	@echo "  make web       - Start Expo (web)"	
	@echo "  make studio    - Reboot Android Studio no snapshot"
	@echo "  make clean     - Remove node_modules"
	@echo "  make fclean    - Full clean (including lock file)"
	@echo "  make re        - Reinstall everything"
	@echo "  make depcheck  - Check for unused dependencies"

install:
	npm install --legacy-peer-deps

android:
	npx expo start --clear --android 

ios:
	npx expo start --clear --ios 

web:
	npx expo start --web 

tunnel:
	npx expo start --tunnel --clear

start:
	npx expo start --tunnel --android  --clear 

studio:
	/goinfre/htharrau/android-sdk/emulator/emulator -avd Pixel_6 -no-snapshot-load

clean:
	rm -rf node_modules

fclean: clean
	rm -f package-lock.json

re: fclean install android 

depcheck: 
	npx depcheck

.PHONY: install android tunnel studio clean fclean re  depcheck
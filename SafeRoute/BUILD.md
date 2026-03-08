# Build Guide for SafeRoute Mobile App

## Requirements

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (or **yarn**: v1.22.0+)
- **Git**: v2.25.0 or higher
- **Xcode**: v12.0+ (for iOS development on macOS)
- **Android Studio**: v4.1+ (for Android development)
- **JDK**: Java Development Kit 11 or higher (for Android)
- **Cocoapods**: v1.11.0+ (for iOS dependencies)

### Optional Requirements
- **Expo CLI**: For simplified mobile development (if using Expo)
- **React Native CLI**: For direct React Native development
- **VS Code** or your preferred code editor

---

## Installation

### 1. Clone or Setup Project
```bash
git clone https://github.com/endofcoding/SafeRoute
cd SafeRoute
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Install Native Dependencies (for React Native)
```bash
# For iOS (macOS only)
cd ios
pod install
cd ..

# For Android, dependencies are handled via Gradle
```

### 4. Setup Environment Variables
Create a `.env` file in the project root with necessary configuration:
```
API_BASE_URL=<your-api-endpoint>
ENVIRONMENT=development
DEBUG=true
```

---

## Build Instructions

### Development Build

#### iOS (macOS)
```bash
# Using Xcode
npm run ios

# Or directly with Xcode
npx react-native run-ios

# Build for specific simulator
npx react-native run-ios --simulator="iPhone 14"
```

#### Android
```bash
# Build and run on connected device or emulator
npm run android

# Or directly
npx react-native run-android

# Start Android emulator first (if not already running)
emulator -avd <emulator-name>
```

### Production Build

#### iOS Release Build
```bash
# Using Xcode
npm run build:ios

# Or manual build
cd ios
xcodebuild -workspace SafeRoute.xcworkspace \
  -scheme SafeRoute \
  -configuration Release
cd ..
```

#### Android Release Build
```bash
# Build APK
npm run build:android:apk

# Or build AAB (Android App Bundle)
npm run build:android:aab

# Manual build
cd android
./gradlew assembleRelease
cd ..
```

---

## Running the App

### Start Development Server
```bash
# Start Metro bundler
npm start

# Or with cache clearing
npm start -- --reset-cache
```

### Run on Device

#### iOS Device
```bash
# Must have a connected iPhone or iPad
npx react-native run-ios --device
```

#### Android Device
```bash
# Enable USB debugging on device first
adb devices  # Verify device is connected
npm run android
```

---

## Development Setup

### Recommended Workflow
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run on iOS simulator
npm run ios

# Or Terminal 2: Run on Android emulator
npm run android
```

### Hot Reload
- **Fast Refresh**: Enabled by default. Changes reload automatically
- To disable: Add `FAST_REFRESH=false` to `.env`

### Debugging
```bash
# Open React Native debugger
# Press 'd' in the Metro bundler terminal (for iOS)
# Or 'i' for iOS, 'a' for Android

# External debugger
# Use React Native Debugger: https://github.com/jhen0409/react-native-debugger
```

---

## Testing

### Unit Tests
```bash
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Build Verification
```bash
# Lint code
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

---

## Troubleshooting

### Common Issues

#### Metro Bundler Cache Issues
```bash
npm start -- --reset-cache
```

#### iOS Build Errors
```bash
# Clean build folders
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Or clean Xcode build cache
xcodebuild clean -workspace ios/SafeRoute.xcworkspace -scheme SafeRoute
```

#### Android Build Errors
```bash
# Clean Gradle cache
cd android && ./gradlew clean && cd ..

# Full clean
rm -rf android/.gradle android/build node_modules
npm install
```

#### Port Already in Use
```bash
# Metro bundler uses port 8081 by default
# Change port:
npm start -- --port 8082
```

#### Device Not Recognized
```bash
# Restart adb (Android)
adb kill-server
adb start-server

# Check connected devices
adb devices
```

---

## Deployment

### iOS App Store
1. Increase version in `ios/SafeRoute/Info.plist`
2. Build release version
3. Open `ios/SafeRoute.xcworkspace` in Xcode
4. Archive and upload to App Store Connect

### Google Play Store
1. Increase version code in `android/app/build.gradle`
2. Build release APK/AAB
3. Sign the build with keystore
4. Upload to Google Play Console

---

## Additional Commands

```bash
# Install pods (iOS)
npm run ios:pods

# Clear all caches
npm run clean

# Generate TypeScript types (if applicable)
npm run generate-types

# Format code
npm run format

# Run linter with fixes
npm run lint:fix
```

---

## Useful Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Community](https://react-native-community.github.io/)
- [Android Development](https://developer.android.com/)
- [iOS Development](https://developer.apple.com/ios/)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review React Native documentation
3. Check GitHub Issues in the repository
4. Contact the development team

---

**Last Updated**: March 8, 2026

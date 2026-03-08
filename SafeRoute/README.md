# SafeRoute

A secure route planning mobile application built with React Native.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/endofcoding/SafeRoute
   cd SafeRoute
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   ```

4. **Run the app**
   - iOS: `npm run ios`
   - Android: `npm run android`

## Documentation

- [BUILD.md](BUILD.md) - Complete build and deployment guide
- [API Documentation](#) - Backend API specifications

## Features

- Real-time route planning
- Safety-aware navigation
- Offline maps support
- Location sharing
- Safety alerts and notifications

## Tech Stack

- **Frontend**: React Native
- **State Management**: Redux (if applicable)
- **Navigation**: React Navigation
- **Backend**: Node.js/Express (if applicable)
- **Database**: Firebase/PostgreSQL (if applicable)

## Project Structure

```
SafeRoute/
├── app/                 # Main app components
├── src/
│   ├── screens/        # Screen components
│   ├── components/    # Reusable components
│   ├── navigation/    # Navigation configuration
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── styles/        # Global styles
├── ios/                # iOS native code
├── android/           # Android native code
├── package.json
├── BUILD.md           # Build instructions
└── README.md          # This file
```

## Requirements

- Node.js v16+
- npm v7+ or yarn v1.22+
- Xcode 12+ (iOS)
- Android Studio 4.1+ (Android)
- JDK 11+ (Android)

## Development

### Run in Development Mode
```bash
npm start
```

In another terminal:
```bash
npm run ios    # iOS simulator
npm run android # Android emulator
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
npm run lint:fix
```

## Building for Production

See [BUILD.md](BUILD.md) for detailed production build instructions.

### iOS App Store
```bash
npm run build:ios
```

### Google Play Store
```bash
npm run build:android:apk
npm run build:android:aab
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@saferoute.com or open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: March 8, 2026

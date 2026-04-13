# Architecture Overview

SafePath is built with a modular architecture that separates mapping logic, AI analysis, and state management.

## 1. Safety Analysis Engine

The heart of SafePath is the `safetyService.ts`. It leverages the **Gemini 3 Flash** model to perform real-time safety assessments.

### Data Flow:
1. **Input**: Start location, end location, time of day, and nearby community reports.
2. **Prompt Engineering**: A structured prompt is sent to Gemini, requesting a JSON response that evaluates factors like lighting and foot traffic.
3. **Validation**: The response is validated against a strict JSON schema using Gemini's `responseSchema` feature.
4. **Fallback**: If the API call fails or returns invalid data, a deterministic fallback mechanism provides reasonable safety estimates based on the time of day.

## 2. Mapping Integration

We use `@vis.gl/react-google-maps` for a declarative React interface to the Google Maps JavaScript API.

- **MapClickListener**: A centralized listener in `Map.tsx` handles coordinate capturing for both route drawing and pin dropping.
- **DirectionsService**: Integrated to provide standard routing data which is then enriched with our safety scores.
- **TrafficLayer**: Managed via a React `useEffect` to ensure the layer is correctly synced with the map instance.

## 3. State Management

The application state is primarily managed in `App.tsx` using React hooks:
- **User Routes**: Persistent (for the session) array of drawn paths.
- **Reports**: Community-driven safety alerts.
- **Navigation State**: Tracks the user's progress along a selected route.

## 4. Testing Strategy

- **Unit Tests**: Focus on the `safetyService` logic, mocking the Gemini SDK to test various response scenarios.
- **Component Tests**: Use `jsdom` and `@testing-library/react` to verify UI interactions like toggling the traffic layer or rendering safety scores.
- **Mocks**: Google Maps API is mocked in `src/test/setup.ts` to allow testing without an active network connection or API key.

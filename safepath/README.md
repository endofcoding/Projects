# SafePath 🛡️

SafePath is a modern navigation application designed to prioritize user safety. Unlike traditional GPS apps that focus solely on the fastest route, SafePath analyzes environmental factors like street lighting, foot traffic, and community reports to suggest the safest possible path for pedestrians.

## 🌟 Key Features

- **AI-Powered Safety Analysis**: Uses Gemini AI to evaluate routes based on real-time and historical safety data.
- **Interactive Route Drawing**: Users can draw and save their own "Safe" or "Unsafe" routes, contributing to community knowledge.
- **Real-Time Traffic Layer**: Toggleable Google Maps traffic layer to stay informed about road conditions.
- **Dropped Pins**: Mark specific locations on the map for quick reference or reporting.
- **Community Safety Reports**: View and add reports about lighting, construction, or isolated areas.
- **Dynamic Navigation UI**: A polished navigation interface that provides turn-by-turn alerts and safety tips.
- **Dark Mode Support**: Optimized for both day and night use.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Mapping**: Google Maps API (via `@vis.gl/react-google-maps`)
- **AI**: Google Gemini API (`@google/genai`)
- **Styling**: Tailwind CSS 4, Lucide Icons, Framer Motion
- **Testing**: Vitest, React Testing Library
- **UI Components**: shadcn/ui

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Maps API Key
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd safepath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your keys:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   GOOGLE_MAPS_MAP_ID=your_google_maps_map_id
   GEMINI_API_KEY=your_gemini_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

SafePath uses Vitest for unit and component testing.

- **Run all tests**:
  ```bash
  npm test
  ```
- **Watch mode**:
  ```bash
  npx vitest
  ```

Test results are automatically logged to `test-results.txt` during CI/CD processes.

## 🏗️ Build Pipeline

SafePath includes a comprehensive build pipeline to ensure code quality and security.

### GitHub Actions
A CI workflow is configured in `.github/workflows/ci.yml` that automatically runs on every push and pull request to `main`. It performs:
1. **Dependency Installation**
2. **Linting** (`tsc --noEmit`)
3. **Unit Testing** (`vitest`)
4. **Security Auditing** (`audit-ci`)
5. **Production Build** (`vite build`)

### Local Execution
You can run the entire pipeline locally using the provided script:
```bash
chmod +x pipeline.sh
./pipeline.sh
```
Or via npm:
```bash
npm run pipeline
```

## 🔒 Security

We take security seriously. A vulnerability scan is performed regularly using `audit-ci`.
- **Latest Scan Result**: 0 vulnerabilities found.
- Full report available in `vulnerability-scan.txt`.

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── ui/           # Base shadcn components
│   ├── Map.tsx       # Core Map integration
│   └── ...
├── services/         # API and business logic (Gemini, Safety)
├── test/             # Test setup and mocks
├── types.ts          # TypeScript interfaces
└── App.tsx           # Main application entry
```

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

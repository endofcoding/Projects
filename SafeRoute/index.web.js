import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Load environment variables
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// Make env vars accessible on window for client-side use
if (window.process?.env) {
  window.process.env.GOOGLE_MAPS_API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';
}

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});

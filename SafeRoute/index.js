/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Run the app on web
if (typeof window !== 'undefined') {
  AppRegistry.runApplication(appName, {
    rootTag: 'root',
  });
}

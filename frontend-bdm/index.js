import { AppRegistry, LogBox } from 'react-native';
import App from './App.jsx';
import { name as appName } from './app.json';

LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);

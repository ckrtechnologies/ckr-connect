import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/shared/store/index.js';
import { ErrorBoundary } from './src/shared/components/index.js';
import RootNavigator from './src/shared/navigation/RootNavigator.jsx';

/**
 * Root Application Component — CKR Connect BDM Mobile
 * Wrapped with ErrorBoundary per CKR crash-resilience standards
 */
export const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

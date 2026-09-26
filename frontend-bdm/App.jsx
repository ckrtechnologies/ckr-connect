import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/shared/store/index.js';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary.jsx';
import { RootNavigator } from './src/shared/navigation/RootNavigator.jsx';
import { QuickAddLeadModal } from './src/domains/leads/components/QuickAddLeadModal.jsx';
import { CloseDealWonModal } from './src/domains/leads/components/CloseDealWonModal.jsx';
import { DropoffLostModal } from './src/domains/leads/components/DropoffLostModal.jsx';
import { initSocket, disconnectSocket } from './src/domains/notifications/socket.js';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { colors } from './src/shared/theme/colors.js';

const AppContent = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      initSocket(token, dispatch);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [token, dispatch]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />
      <RootNavigator />
      {/* Global Modals Layer */}
      <QuickAddLeadModal />
      <CloseDealWonModal />
      <DropoffLostModal />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </KeyboardProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

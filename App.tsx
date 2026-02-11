/**
 * 主应用入口 - 根导航
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import RootNavigator from './src/navigation/RootNavigator';
import database from './src/database/database';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar hidden barStyle="default" />
      <DatabaseProvider database={database}>
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                primary: '#6366f1',
                background: '#f2f2f7',
                card: '#ffffff',
                text: '#0f172a',
                border: '#e2e8f0',
                notification: '#6366f1',
              },
            }}
          >
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </DatabaseProvider>
    </>
  );
}

export default App;

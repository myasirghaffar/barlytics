/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: () =>
    Promise.resolve({
      executeSql: () => Promise.resolve([{ rows: { raw: () => [] }, insertId: 0, rowsAffected: 0 }]),
    }),
  DEBUG: () => {},
  enablePromise: () => {},
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Gesture: { Pan: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }) },
    GestureDetector: View,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});

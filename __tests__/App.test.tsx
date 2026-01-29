/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('axios', () => {
  const mockApi = jest.fn((config: any) => {
    if (config?.url === '/session/tonight') {
      return Promise.resolve({ status: 200, data: { tonightPlayerIds: [] } });
    }
    if (config?.url === '/players') {
      return Promise.resolve({ status: 200, data: [] });
    }
    return Promise.resolve({ status: 204, data: null });
  });

  return {
    create: () => mockApi,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

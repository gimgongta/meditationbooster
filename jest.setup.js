/**
 * @format
 */

/* eslint-env jest */

jest.mock('react-native-localize', () =>
  require('react-native-localize/mock/jest'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// 네이티브 스플래시 모듈은 테스트 환경에 없으므로 스텁으로 대체한다.
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(() => Promise.resolve()),
  isVisible: jest.fn(() => Promise.resolve(false)),
  useHideAnimation: jest.fn(),
}));

// WebView는 네이티브 TurboModule을 요구하므로 렌더 가능한 스텁으로 대체한다.
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  const WebView = React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({
      goBack: jest.fn(),
      goForward: jest.fn(),
      reload: jest.fn(),
    }));
    return React.createElement(View, { testID: 'webview' });
  });

  return { __esModule: true, WebView, default: WebView };
});

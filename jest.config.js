module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // 아래 패키지들은 ESM으로 배포되므로 babel 변환 대상에 포함시켜야 한다.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?' +
      '|react-native-webview|react-native-localize|react-native-safe-area-context)/)',
  ],
};

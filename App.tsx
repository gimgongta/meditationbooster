/**
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Main from './src/screens/main';
import { BACKGROUND_COLOR } from './src/config/config';

function App() {
  return (
    <SafeAreaProvider>
      {/*
       * 배경이 항상 밝은 색(BACKGROUND_COLOR)이므로 시스템 다크모드와 무관하게
       * 어두운 아이콘을 쓴다. 다크모드에서 light-content를 쓰면 상태바가 안 보인다.
       */}
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND_COLOR} />
      {/*
       * targetSdk 35+ 부터 안드로이드는 edge-to-edge가 강제되므로 인셋을 직접 적용한다.
       * SafeAreaView가 패딩 영역까지 배경색을 칠하므로 상태바/제스처바 뒤도 채워진다.
       */}
      <SafeAreaView style={styles.container}>
        <Main />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});

export default App;

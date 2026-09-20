import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import * as RNLocalize from 'react-native-localize';
import BootSplash from 'react-native-bootsplash';
import { BACKGROUND_COLOR, MAIN_URL } from '../../config/config';

const supported = ['en', 'ko'];
const deviceLocale = RNLocalize.getLocales()[0]?.languageCode ?? 'en';
const best = supported.includes(deviceLocale) ? deviceLocale : 'en';
const url = `${MAIN_URL}?lng=${best}`;

const COPY = {
  en: {
    title: "Couldn't load",
    body: 'Check your internet connection and try again.',
    retry: 'Retry',
  },
  ko: {
    title: '불러오지 못했어요',
    body: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
    retry: '다시 시도',
  },
} as const;

const copy = COPY[best as keyof typeof COPY] ?? COPY.en;

/**
 * 콘텐츠가 그려지기 전에 실행되어야 확대/축소가 처음부터 막히고 레이아웃이 튀지 않는다.
 * (injectedJavaScript는 로드가 끝난 뒤에 실행된다.)
 * 매 로드마다 meta가 중복 추가되지 않도록 기존 태그를 재사용한다.
 */
const VIEWPORT_SCRIPT = `
  (function () {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  })();
  true;
`;

export default function Main() {
  const webViewRef = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const splashHidden = useRef(false);
  const [hasError, setHasError] = useState(false);

  const hideSplash = useCallback(() => {
    if (splashHidden.current) {
      return;
    }
    splashHidden.current = true;
    BootSplash.hide({ fade: true }).catch(() => {});
  }, []);

  // 안드로이드 하드웨어 뒤로가기로 웹뷰 히스토리를 따라간다.
  // 히스토리가 없을 때만 기본 동작(앱 종료)에 맡긴다.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack.current) {
          webViewRef.current?.goBack();
          return true;
        }
        return false;
      },
    );

    return () => subscription.remove();
  }, []);

  const onNavigationStateChange = useCallback((state: WebViewNavigation) => {
    canGoBack.current = state.canGoBack;
  }, []);

  const onError = useCallback(
    (_event: WebViewErrorEvent) => {
      setHasError(true);
      hideSplash();
    },
    [hideSplash],
  );

  const onHttpError = useCallback(
    (event: WebViewHttpErrorEvent) => {
      if (event.nativeEvent.statusCode >= 400) {
        setHasError(true);
        hideSplash();
      }
    },
    [hideSplash],
  );

  const reload = useCallback(() => {
    setHasError(false);
    webViewRef.current?.reload();
  }, []);

  const renderError = useCallback(
    () => <ErrorView onRetry={reload} />,
    [reload],
  );

  const renderLoading = useCallback(
    () => (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#8a7a5c" />
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        cacheEnabled={true} // 캐시 사용
        scalesPageToFit={false} // (Android) 확대/축소 방지. iOS는 VIEWPORT_SCRIPT로 처리한다.
        overScrollMode="never" // (Android) 오버스크롤 제거
        mediaPlaybackRequiresUserAction={false} // 종료 벨 등 자동 재생 허용
        allowsInlineMediaPlayback={true} // (iOS) 전체화면으로 튀지 않게 인라인 재생
        onNavigationStateChange={onNavigationStateChange}
        onLoadEnd={hideSplash}
        onError={onError}
        onHttpError={onHttpError}
        startInLoadingState={true}
        renderLoading={renderLoading}
        renderError={renderError}
        injectedJavaScriptBeforeContentLoaded={VIEWPORT_SCRIPT}
      />
      {hasError && (
        <View style={styles.overlay}>
          <ErrorView onRetry={reload} />
        </View>
      )}
    </View>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorTitle}>{copy.title}</Text>
      <Text style={styles.errorBody}>{copy.body}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityRole="button">
        <Text style={styles.retryLabel}>{copy.retry}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  webView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3628',
  },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#6b6250',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#3d3628',
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BACKGROUND_COLOR,
  },
});

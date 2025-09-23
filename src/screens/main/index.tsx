import React from 'react';
import { WebView } from 'react-native-webview';
import * as RNLocalize from 'react-native-localize';
import { MAIN_URL } from '../../config/config';

const supported = ['en', 'ko'];
const deviceLocale = RNLocalize.getLocales()[0]?.languageCode ?? 'en';
const best = supported.includes(deviceLocale) ? deviceLocale : 'en';
const url = `${MAIN_URL}?lng=${best}`;

export default function Main() {
  return (
    <WebView
      source={{ uri: url }}
      cacheEnabled={true} // 캐시 사용
      scalesPageToFit={false} // (iOS) 확대/축소 방지
      androidScaleType="fitXY" // (Android) 스케일 타입 지정
      overScrollMode="never" // (Android) 오버스크롤 제거
      injectedJavaScript={`
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        document.head.appendChild(meta);
      `}
    />
  );
}

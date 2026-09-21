# 내사주 모바일 앱

모바일 앱은 별도의 Capacitor 프로젝트가 아니라 저장소의 `android/` 네이티브 WebView 앱입니다. 이 구조가 웹 최신 빌드(`dist/`)를 APK 안에 직접 포함하므로 웹과 Android 앱의 기능 차이를 최소화합니다.

## Windows에서 APK 만들기

```powershell
cd C:\Users\tjqmf\saju
git pull
npm install
npm run mobile:build
```

완료 후 APK:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

현재 앱 버전은 **2.1.0**이며 프로필 저장, 궁합, 날짜별 운세 탐색, 리포트 공유/복사, 모바일 하단 메뉴와 기존 사주·타로 기능이 포함됩니다.

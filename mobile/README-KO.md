# 내사주 Android 앱

이 저장소의 웹 기능을 그대로 사용하는 Android 앱입니다. 데이터는 기본적으로 기기 안에서 계산되며 별도 서버 API를 사용하지 않습니다.

## Windows 로컬 빌드

1. `npm install`
2. 최초 1회 `npm run mobile:init`
3. `npm run mobile:build`
4. APK: `android\app\build\outputs\apk\debug\app-debug.apk`

웹 코드가 바뀐 뒤에는 `npm run mobile:sync`으로 Android 앱에 최신 빌드를 반영할 수 있습니다.

## GitHub 자동 빌드

`.github/workflows/android-apk.yml`이 Android APK를 자동 생성합니다. 생성물 이름은 `Naesaju-Android-Debug`이며 개인 테스트용으로 바로 설치 가능한 debug APK입니다.

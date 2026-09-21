# 내사주 Android 앱

웹 버전의 최신 기능을 APK 내부에 그대로 포함해 실행하는 오프라인 Android 앱입니다. 별도 서버 API와 인터넷 권한을 사용하지 않으며, 사주 계산·프로필 저장·오늘의 운세·궁합·78장 타로·정밀 리포트가 기기 안에서 동작합니다.

## 현재 버전

- 앱 버전: **2.2.0**
- applicationId: `kr.naesaju.personal`
- minSdk: 24
- targetSdk / compileSdk: 35
- Java: 17

## 빌드

저장소 루트에서:

```powershell
npm install
npm run mobile:build
```

APK는 다음 위치에 생성됩니다.

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

웹 코드가 변경되면 `npm run check`가 새 `dist/`를 만들고 Android Gradle 빌드가 그 결과 전체를 APK 안에 자동 포함합니다.

## 앱 보안 구조

- `INTERNET` 권한 없음
- 외부 URL 로딩 차단
- HTTP/혼합 콘텐츠 차단
- 파일/콘텐츠 직접 접근 차단
- WebView 원격 디버깅 비활성화
- 프로필은 사용자가 저장 버튼을 누른 경우에만 WebView 로컬 저장소에 보관
- 공유/복사는 Android 네이티브 공유창·클립보드 브리지 사용
- 화면 밖으로 데이터 전송하는 자체 네트워크 코드 없음

## GitHub 자동 APK

`.github/workflows/android-apk.yml`은 웹 검증 후 Android Lint와 APK 빌드를 수행하고 `Naesaju-Android-Debug` 아티팩트를 생성합니다.

개인 테스트용 debug APK는 바로 설치할 수 있습니다. 지인 배포용 최종 APK는 별도 release 서명키로 서명해야 하며, 타로 이미지 재배포 조건은 `THIRD_PARTY_NOTICES.md`를 확인합니다.

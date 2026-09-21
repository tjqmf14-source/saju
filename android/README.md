# 내사주 Android 시험 앱

기존 Vite 사이트를 APK 내부에 담아 WebView에서 실행합니다. 앱은 인터넷 권한을 요청하지 않으며, 외부 웹 주소로 이동하지 않습니다. 사주 계산과 타로 이미지도 APK에 포함됩니다.

## 빌드

1. JDK 17과 Android SDK 35를 설치하고 `JAVA_HOME`, `ANDROID_HOME`을 설정합니다.
2. 저장소 루트에서 `npm run check`를 실행합니다. 이 단계가 `dist/`와 타로 이미지 78장을 준비합니다.
3. `android/`에서 `gradlew.bat assembleDebug`를 실행합니다.

시험용 APK는 `android/app/build/outputs/apk/debug/app-debug.apk`에 생성됩니다. `dist/`를 수정한 뒤에는 반드시 APK를 다시 빌드해야 합니다. APK에는 `dist/` 전체가 들어가며, 원격 서버 주소나 개인 출생정보를 넣지 않습니다.

## 설치와 배포 범위

USB 디버깅을 허용한 기기에서는 `adb install --user 0 -r app-debug.apk`로 시험 설치할 수 있습니다. 이 APK는 개발자 디버그 키로 서명되므로 지인 배포용 최종본으로 사용하지 마세요. 지인에게 보내기 전에는 별도의 안정적인 배포 서명키를 만들고 안전하게 백업해야 하며, [타로 이미지의 재배포 권리](THIRD_PARTY_NOTICES.md)를 확인해야 합니다.

앱에 문제가 있으면 휴대폰의 앱 정보 화면에서 삭제할 수 있습니다. 기존 사이트나 서버 데이터는 변경하지 않습니다.

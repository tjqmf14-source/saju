# 사주타로 Android 신규개발 설계 명세

- 작성일: 2026-09-24
- 기준 저장소: `tjqmf14-source/saju`
- 기준 main SHA: `96b913e73a5fd68d3152eff43ef0b7e630dfb5e8`
- 작업 브랜치: `gpt/sajutaro-android-rebuild`
- 제품명: **사주타로**
- 우선 플랫폼: **Android**
- 웹/사이트 버전: **현재 범위 제외**

## 1. 목표

기존 “내사주 V3”의 화면을 수정하거나 CSS를 교체하는 프로젝트가 아니다. 기존 저장소는 검증된 계산 엔진·달력 데이터·타로/토정비결 데이터·테스트 자산을 재사용하기 위한 원천으로만 사용한다.

새 제품은 명리 지식이 없는 일반 사용자가 다음을 만족해야 한다.

1. 첫 실행에서 입력 방법을 즉시 이해한다.
2. 결과 문장을 한 번 읽고 의미를 이해한다.
3. 전문용어를 몰라도 사주·오늘 운세·연간 운세·토정비결·타로·궁합을 사용할 수 있다.
4. Galaxy 계열의 작은 화면에서도 글자를 확대하지 않고 읽을 수 있다.
5. 정적인 웹페이지가 아니라 Android 앱으로 느껴지는 내비게이션·상태관리·모션·터치 피드백을 제공한다.
6. 핵심 계산과 저장은 오프라인으로 동작한다.
7. 기존 계산 정확도를 새 UI 개발 과정에서 훼손하지 않는다.

## 2. 기존 프로젝트 판정

### KEEP

- `manseryeok 2.0.0` 기반 한국 음양력/절기 계산
- `src/calendar.js`
- `src/solar-terms.js`
- `src/saju-engine.js`
- `src/data.js`
- 계산 로직에 직접 연결된 회귀 테스트
- 검증 가능한 타로 카드 데이터
- 검증 가능한 토정비결 데이터
- 네트워크 차단 정책과 관련 테스트 개념
- Android 패키징/CI에서 재사용 가치가 있는 검증 절차

### DISCARD / 신규 설계 대상

- 현재 `index.html` 중심 화면 구조
- 기존 V17/V3 CSS 계층
- 기존 대시보드
- 기존 카드 레이아웃
- 기존 메뉴/앵커 내비게이션
- DOM 후처리 방식의 `plain-language-ui.js`
- 기존 해설을 화면에 직접 조립하는 구조
- 브라우저 `localStorage`를 앱의 주 데이터 저장소로 사용하는 방식
- WebView 전체 화면을 최종 Android UI로 사용하는 방식
- 기존 앱 이름/브랜드/아이콘

## 3. 아키텍처 결정

### 선택안: Native Android UI + 기존 계산 엔진 격리 재사용

신규 화면은 **Kotlin + Jetpack Compose**를 기준으로 설계한다.

기존 JavaScript 계산 엔진은 초기 단계에서 즉시 Kotlin으로 전면 재작성하지 않는다. 계산 정확도 회귀 위험이 크기 때문이다. 대신 UI와 분리된 로컬 계산 어댑터를 만든다.

```text
Jetpack Compose UI
        ↓
ViewModel / UseCase
        ↓
SajuEngineGateway
        ↓
Local JS calculation runtime
        ↓
기존 검증된 calendar / solar-terms / saju-engine
```

입력과 출력은 JSON 계약으로 고정한다.

### 계산 엔진 계약

입력 예:

```json
{
  "calendar": "solar",
  "birthDate": "1987-06-14",
  "birthTime": "11:45",
  "birthTimeKnown": true,
  "gender": "male",
  "location": "busan",
  "dayBoundary": "midnight",
  "precision": true
}
```

출력은 UI 문구가 아닌 구조화된 계산 데이터만 반환한다.

UI/콘텐츠 계층이 계산 데이터에 직접 의존하지 않고 `InterpretationModel`을 거쳐 생활 언어로 변환한다.

### WebView 사용 원칙

기존처럼 전체 앱 화면을 WebView로 렌더링하지 않는다.

계산 엔진을 그대로 재사용하기 위해 WebView가 필요하다면 **화면에 노출되지 않는 로컬 계산 런타임**으로만 제한한다. 외부 URL 로딩과 네트워크는 허용하지 않는다.

### 앱 ID

초기 리빌드 단계에서는 기존 `applicationId 'kr.naesaju.personal'`을 유지한다. 앱 이름은 “사주타로”로 변경한다.

이유: applicationId를 바꾸면 기존 설치본과 별개의 Android 앱이 되어 업데이트 경로가 끊긴다. 완전히 별도 Play Store 상품으로 분리하기로 결정하는 시점에만 package/applicationId 변경을 별도 의사결정으로 처리한다.

## 4. Android 모듈 구조

목표 구조:

```text
android/app/src/main/
  java/.../sajutaro/
    app/
      SajutaroApp.kt
      AppNavigation.kt
    design/
      Color.kt
      Type.kt
      Shape.kt
      Motion.kt
      SajutaroTheme.kt
    feature/
      onboarding/
      home/
      saju/
      fortune/
      tarot/
      compatibility/
      settings/
    domain/
      model/
      interpretation/
      usecase/
    data/
      profile/
      reading/
      settings/
      engine/
    bridge/
      SajuEngineGateway.kt
      LocalJsEngine.kt
  assets/
    engine/
    tarot/
  res/
    mipmap-*/
    drawable/
    values/
```

각 feature는 화면, 상태, ViewModel을 가능한 한 독립적으로 유지한다.

## 5. 내비게이션

하단 탭을 기능별로 과도하게 늘리지 않는다.

### Bottom Navigation 4개

1. **홈**
2. **사주**
3. **운세**
4. **타로**

### 운세 허브 내부

- 오늘
- 올해
- 토정비결

### 궁합

하단 탭을 차지하지 않는다. 홈의 빠른 실행과 사주 화면의 관계 영역에서 진입한다.

### 설정

프로필 아바타/설정 버튼에서 진입한다.

이 구조는 주요 탭 수를 제한하면서 핵심 기능을 모두 유지한다.

## 6. 사용자 여정

### 첫 사용자

```text
Splash
→ 브랜드 소개 1화면
→ 프로필 입력
→ 입력 확인
→ 계산
→ “나를 한 문장으로”
→ 사주 핵심 결과
→ 홈
```

### 재방문 사용자

```text
앱 실행
→ 홈
→ 오늘의 한마디
→ 오늘의 흐름
→ 필요한 기능 선택
```

생년월일을 매번 다시 입력하지 않는다.

## 7. 프로필 입력

필수:

- 이름/닉네임
- 양력/음력
- 생년월일
- 출생시간
- 출생시간 모름
- 성별

고급 입력은 첫 화면에서 감춘다.

필요 시 확장:

- 출생 지역
- 윤달
- 날짜 경계 기준
- 시간 정밀 보정

사용자가 “사주를 보기 위해 공부해야 하는” UI를 금지한다.

## 8. 홈 대시보드

홈은 메뉴 목록이 아니라 오늘의 개인화 대시보드다.

우선순위:

1. 인사 + 사용자 이름
2. 오늘의 한마디
3. 오늘의 흐름 4개: 일 / 돈 / 관계 / 컨디션
4. 지금 필요한 행동 한 가지
5. 올해 흐름 요약
6. 빠른 실행: 타로 / 토정비결 / 궁합
7. 최근 타로 또는 최근 본 결과

모든 카드를 동일 크기로 나열하지 않는다.

가장 중요한 카드 1개 → 중간 카드 → 보조 기능 순으로 시각적 위계를 만든다.

## 9. 사주 결과

전문 리포트 형태를 버린다.

1. **나를 한 문장으로**
2. **내가 잘하는 것**
3. **힘들어지는 상황**
4. **일**
5. **돈**
6. **관계**
7. **생활과 회복**
8. **지금의 조언**

각 항목은 기본적으로 카드 하나에 핵심 메시지 하나만 제공한다.

전문 계산 근거를 기본 화면에서 노출하지 않는다.

## 10. 콘텐츠 문장 규칙

기본 구조:

> 결론 → 이유 → 현실적인 행동 조언

예시:

> 혼자 생각을 정리할 시간이 있을 때 능력이 잘 나오는 편입니다.
>
> 여러 사람의 의견을 동시에 맞추는 상황에서는 집중력이 쉽게 흐트러질 수 있습니다.
>
> 중요한 결정을 할 때는 먼저 자신의 생각을 정리한 뒤 주변 의견을 확인해보세요.

### 금지

- 원국, 십신, 비견, 겁재, 식신, 상관, 정재, 편재, 정관, 편관, 정인, 편인, 일간, 월령, 신강, 신약, 용신, 희신, 기신, 천간, 지지, 격국 등 전문용어의 기본 노출
- 명리학 논문체
- 한 문장에 여러 결론
- 근거 없는 칭찬
- 모든 사용자에게 적용되는 상투적 조언
- 같은 의미의 반복
- 공포를 유발하는 예언
- 건강/재정/관계 결과의 단정

### 길이

- 제목: 1줄
- 핵심: 1~2문장
- 이유: 1~3문장
- 행동 조언: 1~2문장

## 11. 오늘의 운세

사용 시간 목표: 30초~1분.

구성:

- 오늘 한마디
- 일
- 돈
- 관계
- 컨디션
- 오늘 하면 좋은 것
- 오늘 피하면 좋은 것

점수 숫자를 핵심 UX로 사용하지 않는다.

## 12. 올해의 운세

- 올해 전체 흐름
- 상반기
- 하반기
- 일
- 돈
- 관계
- 생활

전문적인 세운 용어는 내부 계산에만 사용한다.

## 13. 토정비결

- 올해 총평
- 상반기
- 하반기
- 일
- 돈
- 관계
- 생활
- 1월~12월

월별 문장의 의미 중복을 콘텐츠 QA에서 검사한다.

## 14. 타로

### 기본 플로우

```text
질문 선택/입력
→ 1장 또는 3장
→ 셔플
→ 카드 펼침
→ 선택
→ 3D Flip
→ 결과
→ 현재 상황 / 카드 의미 / 행동 조언
→ 저장 또는 다시 보기
```

### 첫 버전 우선순위

- 1장
- 3장
- 정/역방향
- 질문 유형
- 결과 저장
- 최근 결과

복잡한 스프레드는 후순위다.

### 이미지 원칙

- 카드 전체 비율 유지
- `crop` 금지
- `contain` 원칙
- 텍스트 오버레이 금지
- 작은 화면에서도 카드 상하단 보존

## 15. 궁합

궁합 점수를 상품의 핵심으로 삼지 않는다.

구성:

- 잘 맞는 부분
- 다른 부분
- 갈등하기 쉬운 상황
- 서로 이해하면 좋은 점
- 현실적인 관계 조언

상대방의 감정이나 미래를 단정하지 않는다.

## 16. 브랜드 아이덴티티

### 핵심 콘셉트: “달빛 문”

사주와 타로를 “미래를 확정하는 도구”가 아니라 “나를 바라보는 창”으로 표현한다.

아이콘은 둥근 사각형 안에 **달빛이 들어오는 세로형 문/카드 실루엣**을 결합한다.

전통 문양을 직접적으로 사용하지 않는다.

### 컬러 방향

- Midnight Ink: 깊은 남청/먹색 — 브랜드 기반
- Moon Ivory: 따뜻한 아이보리 — 기본 배경
- Muted Violet: 신비감을 주는 제한적 포인트
- Soft Rose/Coral: 선택/강조에 제한 사용

금색과 강한 빨간색은 주색으로 사용하지 않는다.

### 화면 톤

- 일반 화면: 밝고 읽기 쉬운 아이보리/화이트 중심
- 타로 경험: Midnight 계열의 몰입형 화면
- 두 톤은 동일한 아이콘/타이포/라운딩/모션으로 같은 브랜드처럼 연결

## 17. 타이포그래피

작은 글자를 전제로 레이아웃을 만들지 않는다.

기본 제안:

- Display: 32sp 이상
- Screen title: 26~28sp
- Section title: 22~24sp
- Card title: 19~20sp
- Main body: **18sp**
- Supporting body: **16sp**
- Button: 17~18sp
- 아주 제한적인 metadata: 14~15sp

중요: 시스템 글꼴 배율이 올라가면 레이아웃이 함께 확장되어야 한다.

정보가 넘치면 글자를 줄이지 않고 내용을 줄인다.

## 18. 터치/접근성

- 주요 터치 영역 최소 48dp
- 색만으로 상태를 전달하지 않는다.
- 명암비를 검증한다.
- TalkBack 읽기 순서를 정의한다.
- 아이콘 버튼에 contentDescription을 제공한다.
- font scale 확대 테스트를 포함한다.
- Reduce Motion 설정을 존중한다.

## 19. Motion Design

### 홈

- 카드 staggered reveal
- 화면 전환 fade + 작은 translate
- 선택 상태 spring을 과하지 않게 사용

### 사주/해설

- 애니메이션보다 읽기가 우선
- 160~260ms 수준의 짧은 fade/expand
- 긴 반복 애니메이션 금지

### 타로

가장 강한 모션 사용:

- 셔플
- fan spread
- 선택 카드 elevation
- 3D flip
- 결과 reveal
- 선택적 haptic feedback

### 성능

- 60fps 목표
- 화면 밖 반복 애니메이션 중지
- 불필요한 blur/particle 금지
- Reduce Motion에서는 flip/반복효과를 단순화

## 20. 데이터 저장

브라우저 localStorage 대신 Android 데이터 계층으로 이동한다.

### Room 후보

- Profile
- SavedTarotReading
- Optional history

### DataStore 후보

- 사용자 설정
- 알림 on/off
- 선택된 프로필
- 접근성/표시 옵션

데이터 모델에 `schemaVersion`, 콘텐츠 결과에는 `contentVersion`을 둔다.

## 21. 마이그레이션

업데이트로 기존 사용자 데이터가 사라지지 않도록 한다.

구현 원칙:

- Room migration 테스트
- migration 실패 시 명시적 복구 화면
- 개발 중 destructive migration을 기본값으로 사용하지 않는다.
- 데이터 초기화는 사용자 명시 동작에서만 허용한다.

기존 WebView localStorage 데이터를 신규 Room으로 자동 이관할 가치가 있는지 별도 조사한다. 기존 저장 포맷이 안정적으로 읽힐 수 있다면 1회 migration을 제공한다.

## 22. 계산 정확도 정책

현재 README의 검증된 정책을 출발점으로 유지한다.

- 한국 음양력: manseryeok 기반
- Asia/Seoul
- 윤달
- 절기
- 진태양시 보정 옵션
- 출생 지역
- 자시 경계 정책

UI 리빌드가 계산 로직을 임의로 변경해서는 안 된다.

정확도 정책은 `docs/CALCULATION_POLICY.md`로 별도 고정한다.

## 23. Golden Test

다음 케이스를 고정 입력/출력 테스트로 만든다.

- 일반 양력 날짜
- 일반 음력 날짜
- 윤달
- 윤년
- 연말/연초
- 월 경계
- 23시/00시 경계
- 시간지지 경계
- 출생시간 미상
- 각 지원 지역의 보정 대표 케이스

신규 Gateway가 기존 계산 엔진과 동일 결과를 내는지 검증한다.

## 24. 상태/오류 UX

반드시 설계:

- 프로필 없음
- 출생시간 모름
- 잘못된 날짜
- 지원 범위 밖 날짜
- 계산 실패
- 저장 실패
- 데이터 없음
- DB migration 실패
- 이전 데이터 복구
- 타로 저장 기록 없음

오류 메시지는 “왜 실패했는지 + 사용자가 무엇을 하면 되는지”를 포함한다.

## 25. 개인정보/보안

- 출생정보 외부 전송 없음
- 광고 SDK 기본 제외
- Analytics 기본 제외
- 외부 AI API 의존 없음
- 불필요한 INTERNET 권한 없음
- 위치/연락처/카메라/전화/저장소 권한 요청 없음
- 타로/사주 데이터는 로컬 처리
- 디버그 기능을 Release에 남기지 않는다.

## 26. 알림

첫 버전의 핵심 요구가 아니므로 YAGNI 원칙을 적용한다.

로컬 알림은 기본 구현 범위에서 제외한다. 홈 재방문성이 충분히 검증된 뒤 “오늘의 운세” 로컬 알림을 후속 기능으로 검토한다.

## 27. 성능 예산

측정 항목:

- cold start
- warm start
- 화면 전환
- Compose recomposition 과다
- 타로 이미지 메모리
- 셔플/flip jank
- Room read/write
- APK 크기

새 의존성은 꼭 필요한 경우에만 추가한다.

## 28. 앱 생명주기

검증:

- 시스템 뒤로가기
- process/background 전환
- 화면 상태 복원
- 입력 중 앱 전환
- 키보드 adjustResize
- 앱 종료/재실행
- 선택한 프로필 복원
- 타로 선택 중 상태

## 29. Android 버전/릴리스

제품을 새로 만들지만 기존 설치 호환을 위해 applicationId는 당분간 유지한다.

버전은 구현 시작 시 현재 V3와 구분되는 신규 major로 올린다. 구체적인 versionName/versionCode는 implementation plan에서 첫 코드 변경 전에 확정한다.

구분:

- Debug APK
- QA APK
- Release APK/AAB

Release signing credential이 없으면 최종 서명 배포는 BLOCKED로 보고한다.

## 30. 테스트 전략

### 계산
- 기존 unit tests 유지
- Golden calculation tests
- JS Gateway parity tests

### Domain
- 해설 모델 생성
- 전문용어 금지
- 문장 길이
- 중복률
- 월별 중복
- 모순 규칙

### Data
- Room CRUD
- migration
- DataStore
- 복원

### UI
- Compose UI tests
- 320/360/390/412 상당 폭
- font scale
- TalkBack semantics
- overflow/clipping
- keyboard
- back navigation

### Motion
- 애니메이션 완료 상태
- 중복 탭
- 뒤로가기
- Reduce Motion
- 타로 이미지 crop 금지

### Package
- lint
- unit/instrumentation as available
- assembleDebug
- APK exists
- package/version
- manifest permission
- SHA-256

실패/skip/not-run/zero-test는 PASS로 바꾸지 않는다.

## 31. Git 전략

브랜치:

`gpt/sajutaro-android-rebuild`

단계별 의미 있는 커밋:

1. design: 신규 제품/아키텍처 명세
2. chore: native Android skeleton
3. test: engine gateway contract / golden fixtures
4. feat: onboarding and profile
5. design: Sajutaro design system
6. feat: home dashboard
7. feat: saju reader
8. feat: fortune hub
9. feat: tojeng
10. feat: tarot
11. feat: compatibility
12. feat: motion system
13. test: content/accessibility/performance gates
14. fix: QA findings

자동 QA가 PASS한 상태에서 먼저 커밋하고, 그 다음 최종 시각 검수를 수행한다. 시각 문제 발견 시 수정 → QA → PASS → 새 커밋 → 다시 시각 검수 순서를 따른다.

## 32. 단계

### Phase 0 — 조사/설계
현재 코드 재사용 경계, 새 구조, 데이터/QA 정책 확정

### Phase 1 — Native Foundation
Compose, navigation, design tokens, app shell

### Phase 2 — Engine Contract
기존 JS 계산 엔진과 native UI 사이 gateway + Golden Test

### Phase 3 — Profile
onboarding, profile, local persistence

### Phase 4 — Home
개인화 대시보드

### Phase 5 — Saju
일반인용 사주 리더

### Phase 6 — Fortune
오늘/올해/토정비결

### Phase 7 — Tarot
카드/셔플/flip/결과/저장

### Phase 8 — Compatibility
관계 중심 궁합

### Phase 9 — Hardening
콘텐츠 QA, accessibility, motion, performance, privacy

### Phase 10 — Package
APK/QA/Release 준비

## 33. Definition of Done

아래가 모두 충족되어야 “완성”이라고 표현할 수 있다.

- 기존 V3 화면에 대한 단순 스킨 변경이 아님
- Native Android 신규 UI
- “사주타로” 신규 브랜드/아이콘
- 큰 타이포그래피
- 전문용어 없는 기본 해설
- 프로필 저장
- 홈
- 사주
- 오늘/올해
- 토정비결
- 타로
- 궁합
- Motion Design
- 계산 Golden Test
- 콘텐츠 QA
- 데이터 migration 테스트
- 접근성
- Android lint/build
- APK 생성/검증
- 실패한 필수 테스트 0
- 필수 NOT RUN 0
- 실제 기기에서 검증하지 않은 항목은 별도 NOT RUN 표시
- QA 통과 커밋 후 시각 검수
- 최종 main 병합

## 34. 제외 범위

현재 구현하지 않는다.

- 데스크톱/웹사이트 리빌드
- 서버 회원가입
- 클라우드 동기화
- 광고
- 유료 API
- AI 서버 해설
- 결제
- 커뮤니티
- 과도한 알림
- 복잡한 타로 스프레드
- 전문가용 명리 데이터 화면

## 35. 현재 설계 결정 요약

1. 기존 화면은 버리고 계산 자산만 재사용한다.
2. Android UI는 Jetpack Compose로 신규 제작한다.
3. 기존 JS 계산 엔진은 로컬 Gateway 뒤에 격리한다.
4. 하단 메뉴는 홈/사주/운세/타로 4개로 제한한다.
5. 전문용어 기본 노출을 없앤다.
6. 본문 기본 목표는 18sp, 보조 본문 16sp 이상으로 잡는다.
7. 타로는 가장 강한 Motion, 사주 해설은 가장 절제된 Motion을 사용한다.
8. Room/DataStore를 Android 데이터의 기준으로 삼는다.
9. applicationId는 기존 사용자 업데이트 경로 보존을 위해 일단 유지한다.
10. 웹사이트는 Android 완성 후 별도 Phase로 미룬다.

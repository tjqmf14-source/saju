# Sajutaro Native Foundation and Engine Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible WebView-based Android shell with a native Jetpack Compose foundation and establish a tested local gateway contract for the existing JavaScript saju engine without changing calculation behavior.

**Architecture:** The visible app becomes a Kotlin/Jetpack Compose application. The legacy JavaScript calculation engine remains a local, offline calculation asset behind a narrow JSON gateway; it is never used to render the visible UI. This plan covers Phase 1–2 only: native foundation, engine contract, build/CI gates, and calculation policy fixtures.

**Tech Stack:** Android Gradle Plugin 9.4.0, Gradle 9.6.0, JDK 17, built-in Kotlin support, Kotlin Compose compiler plugin 2.4.20, Jetpack Compose BOM 2026.09.00, Material 3, Node 24 for legacy calculation tests.

**Spec:** `docs/superpowers/specs/2026-09-24-sajutaro-android-rebuild-design.md`

## Global Constraints

- Product name is **사주타로**.
- Android is the only implementation target in this phase; the website is legacy material, not the product UI.
- Existing `applicationId 'kr.naesaju.personal'` remains unchanged.
- New Android version is `versionName '4.0.0'` and `versionCode 400`.
- No `android.permission.INTERNET`, location, contacts, camera, phone, or storage permission.
- Main body typography target remains 18sp; supporting body 16sp; primary touch targets at least 48dp.
- Existing saju calculation behavior must remain unchanged; native UI consumes structured results through a gateway.
- No paid API, analytics SDK, advertising SDK, or external AI dependency.
- Existing legacy web UI files remain in the repository during this plan but are not packaged as the visible Android UI.
- A failed, skipped, cancelled, not-run, zero-test, stale-SHA, or empty-artifact check is not PASS.
- Automated QA must pass before the verified implementation commit is treated as a checkpoint for later visual inspection.

## Review Focus

1. **Missing or malformed local engine asset:** the Android app must fail locally with a clear gateway error, never attempt network recovery.
2. **Process/background recreation:** the native shell must restore the selected top-level destination without falling back to a WebView page.
3. **Large font scale / 320px-equivalent width:** the shell must retain readable 18sp body copy and 48dp touch targets without clipping.
4. **External URL attempt from calculation runtime:** the hidden engine runtime must block non-local navigation and requests.
5. **Calculation parity:** representative solar/lunar/boundary inputs must produce the same structured engine data before and after the native wrapper change.

---

### Task 1: Lock the native Android build contract

**Files:**
- Create: `tests/native-android-foundation.test.js`
- Modify: `android/build.gradle`
- Modify: `android/gradle/wrapper/gradle-wrapper.properties`
- Modify: `android/app/build.gradle`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: existing Android project rooted at `android/`.
- Produces: AGP 9.4/Gradle 9.6 Compose-capable build; version 4.0.0/400; CI job `build-android-native`.

- [ ] **Step 1: Write the failing Node contract test**

Create `tests/native-android-foundation.test.js` with safe file reads and assertions that:
- top-level Gradle declares `com.android.application 9.4.0` and `org.jetbrains.kotlin.plugin.compose 2.4.20`;
- wrapper points to `gradle-9.6.0-bin.zip`;
- app module uses Compose, version 4.0.0/400, Compose BOM 2026.09.00, Material3, activity-compose 1.13.0;
- app module no longer contains `syncWebAssets` or `generated/assets/site`;
- CI contains a `build-android-native` job and creates `Sajutaro-4.0.0-debug.apk`.

- [ ] **Step 2: Run RED verification**

Run: `npm test -- tests/native-android-foundation.test.js`

Expected: FAIL because the current project is AGP 8.6.1, version 3.0.0, and WebView-dist packaging is still present.

- [ ] **Step 3: Implement the build migration**

Set:
- AGP `9.4.0`;
- Compose compiler plugin `2.4.20`;
- Gradle `9.6.0`;
- `buildFeatures { compose true }`;
- Compose BOM `2026.09.00`;
- Material3 and activity-compose `1.13.0`;
- versionName `4.0.0`, versionCode `400`;
- remove the Vite dist sync task and generated website assets source set;
- keep Java 17;
- configure CI to run `./gradlew lintDebug testDebugUnitTest assembleDebug --stacktrace` for `gpt/sajutaro-android-rebuild` and PRs;
- verify the manifest contains no INTERNET permission;
- upload `Sajutaro-4.0.0-debug.apk` and SHA256.

- [ ] **Step 4: Run GREEN verification**

Run: `npm test -- tests/native-android-foundation.test.js`

Expected: PASS.

Then run: `npm test`

Expected: existing web tests may still expose old Android-wrapper expectations. Any incompatible wrapper-only test must be replaced by the new native contract rather than weakened.

- [ ] **Step 5: Commit**

Commit message: `chore(android): establish native Compose build foundation`

---

### Task 2: Replace the visible WebView shell with Compose

**Files:**
- Modify/Delete: `android/app/src/main/java/kr/naesaju/personal/MainActivity.java`
- Create: `android/app/src/main/java/kr/naesaju/personal/MainActivity.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/app/SajutaroApp.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/app/AppDestination.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/design/SajutaroTheme.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/design/SajutaroType.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/design/SajutaroColors.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/feature/home/HomeScreen.kt`
- Modify: `android/app/src/main/res/values/strings.xml`
- Modify: `android/app/src/main/res/values/styles.xml`
- Modify: `tests/native-android-foundation.test.js`

**Interfaces:**
- Consumes: Compose build from Task 1.
- Produces: `MainActivity -> SajutaroApp(initialDestination)`; `AppDestination` with HOME/SAJU/FORTUNE/TAROT; native Home scaffold.

- [ ] **Step 1: Extend the failing contract test**

Assert:
- `MainActivity.kt` contains `setContent` and `SajutaroApp`;
- old `MainActivity.java` is absent;
- `SajutaroApp.kt` exposes exactly four primary destinations: 홈, 사주, 운세, 타로;
- `HomeScreen.kt` contains the first native copy blocks: “오늘의 한마디”, “오늘의 흐름”, “지금 필요한 조언”;
- type scale declares main body 18sp and supporting body 16sp;
- app resource name is “사주타로”.

- [ ] **Step 2: Run RED verification**

Run: `npm test -- tests/native-android-foundation.test.js`

Expected: FAIL because Compose source files do not yet exist.

- [ ] **Step 3: Implement minimal native shell**

Implement:
- `ComponentActivity`;
- edge-to-edge Compose content;
- a four-destination state model;
- Material3 `Scaffold` with bottom navigation;
- a minimal native Home screen using the “달빛 문” brand direction;
- 18sp body and 16sp supporting text;
- 48dp-or-larger navigation targets;
- no WebView in the visible hierarchy.

Do not implement onboarding, Room, fortune content, tarot behavior, or compatibility in this task.

- [ ] **Step 4: Run GREEN verification**

Run:
- `npm test -- tests/native-android-foundation.test.js`
- `cd android && ./gradlew lintDebug testDebugUnitTest assembleDebug --stacktrace`

Expected: all commands PASS, APK exists.

- [ ] **Step 5: Commit**

Commit message: `feat(android): replace WebView shell with Sajutaro Compose app`

---

### Task 3: Define a structured JavaScript engine gateway

**Files:**
- Create: `src/android-engine-entry.js`
- Create: `tests/android-engine-gateway.test.js`
- Create: `vite.android-engine.config.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `calculateSaju(rawInput)`, `calculateTodayFlow(chart, now)`, `calculateYearFlow(chart, year)`, `calculateMonthFlows(chart, year)`.
- Produces: `globalThis.SajutaroEngine.calculate(jsonString): string`; build command `npm run build:android-engine`; generated local bundle `android/app/build/generated/engine-assets/engine/engine.js`.

- [ ] **Step 1: Write gateway tests first**

Tests must prove:
- solar input is converted into the legacy `calculateSaju` numeric input shape;
- lunar/leap values are preserved;
- malformed JSON returns a structured error;
- output JSON contains `schemaVersion: 1`, `chart`, and no HTML;
- gateway source contains no network APIs.

- [ ] **Step 2: Run RED verification**

Run: `node --test tests/android-engine-gateway.test.js`

Expected: FAIL because `src/android-engine-entry.js` does not exist.

- [ ] **Step 3: Implement minimal gateway and engine-only Vite build**

Implement `calculate(jsonString)` as a synchronous facade around existing calculation functions. Keep UI copy out of this contract.

Configure Vite library build so the Android engine bundle is independent of `index.html` and legacy web CSS.

Add:
- `build:android-engine`
- `check:android-engine`

- [ ] **Step 4: Run GREEN verification**

Run:
- `node --test tests/android-engine-gateway.test.js`
- `npm run build:android-engine`

Expected: PASS and generated `engine/engine.js`.

- [ ] **Step 5: Commit**

Commit message: `feat(engine): add structured offline Android calculation gateway`

---

### Task 4: Embed the engine in an invisible local runtime

**Files:**
- Create: `android/app/src/main/java/kr/naesaju/personal/bridge/SajuEngineGateway.kt`
- Create: `android/app/src/main/java/kr/naesaju/personal/bridge/LocalJsEngine.kt`
- Create: `android/app/src/main/assets/engine/host.html`
- Modify: `android/app/build.gradle`
- Modify: `tests/native-android-foundation.test.js`

**Interfaces:**
- Consumes: generated `engine/engine.js`.
- Produces: `SajuEngineGateway.calculate(requestJson: String, callback: (Result<String>) -> Unit)`; no visible WebView.

- [ ] **Step 1: Add failing bridge contract assertions**

Assert:
- `SajuEngineGateway` exposes only local calculation;
- `LocalJsEngine` loads `file:///android_asset/engine/host.html` or an equivalent local-only asset URL;
- external URL/network navigation is rejected;
- WebView is not attached to the Activity's content hierarchy;
- no `addJavascriptInterface` is used for arbitrary bidirectional exposure.

- [ ] **Step 2: Run RED verification**

Run: `npm test -- tests/native-android-foundation.test.js`

Expected: FAIL because bridge classes do not exist.

- [ ] **Step 3: Implement local runtime**

Create one application-scoped engine WebView on the main thread. Load only the packaged local host and call `evaluateJavascript` with JSON-escaped input. Reject requests until the engine page reports ready. Destroy it when the owning engine component is closed.

Wire the generated engine bundle into the APK without restoring full Vite site packaging.

- [ ] **Step 4: Run GREEN verification**

Run:
- `npm test -- tests/native-android-foundation.test.js`
- `npm run build:android-engine`
- `cd android && ./gradlew lintDebug testDebugUnitTest assembleDebug --stacktrace`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat(engine): embed local-only calculation runtime`

---

### Task 5: Freeze calculation policy and golden fixtures

**Files:**
- Create: `docs/CALCULATION_POLICY.md`
- Create: `tests/fixtures/android-engine-golden.json`
- Create: `tests/android-engine-golden.test.js`

**Interfaces:**
- Consumes: gateway from Task 3 and existing calculation engine.
- Produces: deterministic fixtures for representative solar/lunar/boundary cases.

- [ ] **Step 1: Write golden tests**

Include explicit cases for:
- ordinary solar date;
- ordinary lunar date;
- leap month;
- leap year;
- year boundary;
- 23:00 / 00:00 date-boundary policies;
- at least one Busan precision case.

Each case stores only stable structured calculation fields needed for parity, not UI wording.

- [ ] **Step 2: Run RED verification**

Run: `node --test tests/android-engine-golden.test.js`

Expected: initial FAIL until fixtures match actual existing-engine output.

- [ ] **Step 3: Generate and review fixtures from the existing engine**

Do not alter calculation output to make a preferred fixture pass. The current verified engine is the baseline.

Document:
- calendar source;
- Asia/Seoul;
- precision/location policy;
- supported years;
- day boundary options;
- known areas where different 명리 conventions can differ.

- [ ] **Step 4: Run GREEN verification**

Run:
- `node --test tests/android-engine-golden.test.js`
- `npm test`

Expected: PASS with calculation behavior unchanged.

- [ ] **Step 5: Commit**

Commit message: `test(engine): lock Android gateway calculation parity`

---

### Task 6: Harden CI and produce the first native checkpoint APK

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `android/README.md`

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: CI evidence and `Sajutaro-4.0.0-debug.apk` artifact with SHA-256.

- [ ] **Step 1: Add/verify CI package assertions**

The workflow must:
1. install Node 24;
2. run `npm install`;
3. run `npm test`;
4. run `npm run check:network`;
5. run `npm run build:android-engine`;
6. setup JDK 17;
7. run `./gradlew lintDebug testDebugUnitTest assembleDebug --stacktrace`;
8. verify APK exists;
9. verify versionName 4.0.0/versionCode 400;
10. verify no INTERNET permission;
11. write SHA256;
12. upload non-empty artifact `Sajutaro-V4-Native-Debug`.

- [ ] **Step 2: Run local/CI-equivalent verification where available**

Run:
- `npm test`
- `npm run check:network`
- `npm run build:android-engine`
- `cd android && ./gradlew lintDebug testDebugUnitTest assembleDebug --stacktrace`

Expected: all PASS.

- [ ] **Step 3: Update docs**

README must clearly say:
- V4 Android is native Compose;
- website remains legacy/reference in this phase;
- calculation engine stays local;
- debug APK is not a signed Play Store release.

- [ ] **Step 4: Commit after deterministic QA PASS**

Commit message: `ci(android): gate Sajutaro native checkpoint APK`

This commit is the checkpoint to inspect visually afterward.

- [ ] **Step 5: Inspect CI run and artifact**

Require:
- exact HEAD SHA;
- all required jobs completed successfully;
- artifact non-empty;
- SHA256 generated.

Do not label pending/skipped/cancelled jobs PASS.

---

## Self-review result

- Spec coverage in this plan is intentionally limited to **Phase 1–2**. Profile persistence, Home personalization, full saju reader, fortune hub, tarot behavior, compatibility, Room/DataStore, and final motion are separate implementation plans after the native foundation is proven buildable.
- Shared interfaces are explicit: Task 1 produces Compose build; Task 2 consumes it. Task 3 produces engine bundle/contract; Task 4 consumes it. Task 5 locks parity of Task 3. Task 6 consumes all prior tasks.
- No task is allowed to alter calculation semantics.
- The plan includes tests for all five Review Focus risks that belong to Phase 1–2; process restoration and font-scale UI behavior receive their full instrumentation tests in the next UI plan once screen state becomes functional.

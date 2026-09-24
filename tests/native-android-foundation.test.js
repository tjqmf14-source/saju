import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function safeRead(path) {
  try {
    return await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  } catch {
    return '';
  }
}

const [
  rootGradle,
  wrapper,
  appGradle,
  workflow,
  mainActivityKt,
  mainActivityJava,
  sajutaroApp,
  typeScale,
  homeScreen,
  strings
] = await Promise.all([
  safeRead('android/build.gradle'),
  safeRead('android/gradle/wrapper/gradle-wrapper.properties'),
  safeRead('android/app/build.gradle'),
  safeRead('.github/workflows/ci.yml'),
  safeRead('android/app/src/main/java/kr/naesaju/personal/MainActivity.kt'),
  safeRead('android/app/src/main/java/kr/naesaju/personal/MainActivity.java'),
  safeRead('android/app/src/main/java/kr/naesaju/personal/app/SajutaroApp.kt'),
  safeRead('android/app/src/main/java/kr/naesaju/personal/design/SajutaroType.kt'),
  safeRead('android/app/src/main/java/kr/naesaju/personal/feature/home/HomeScreen.kt'),
  safeRead('android/app/src/main/res/values/strings.xml')
]);

test('native Android build uses the Sajutaro V4 Compose toolchain', () => {
  assert.match(rootGradle, /com\.android\.application' version '9\.4\.0'/);
  assert.match(rootGradle, /org\.jetbrains\.kotlin\.plugin\.compose' version '2\.4\.20'/);
  assert.match(wrapper, /gradle-9\.6\.0-bin\.zip/);
  assert.match(appGradle, /versionCode 400/);
  assert.match(appGradle, /versionName '4\.0\.0'/);
  assert.match(appGradle, /buildFeatures\s*\{[\s\S]*compose true/);
  assert.match(appGradle, /androidx\.compose:compose-bom:2026\.09\.00/);
  assert.match(appGradle, /androidx\.compose\.material3:material3/);
  assert.match(appGradle, /androidx\.activity:activity-compose:1\.13\.0/);
  assert.doesNotMatch(appGradle, /syncWebAssets|generated\/assets\/site/);
});

test('native Android CI gates the V4 APK instead of the legacy V3 wrapper', () => {
  assert.match(workflow, /build-android-native:/);
  assert.match(workflow, /gpt\/sajutaro-android-rebuild/);
  assert.match(workflow, /lintDebug testDebugUnitTest assembleDebug/);
  assert.match(workflow, /Sajutaro-4\.0\.0-debug\.apk/);
  assert.match(workflow, /Sajutaro-V4-Native-Debug/);
});

test('visible app shell is Compose and the legacy visible WebView activity is removed', () => {
  assert.equal(mainActivityJava, '');
  assert.match(mainActivityKt, /class MainActivity\s*:\s*ComponentActivity/);
  assert.match(mainActivityKt, /setContent\s*\{/);
  assert.match(mainActivityKt, /SajutaroApp\(/);
  assert.doesNotMatch(mainActivityKt, /WebView/);
  assert.match(sajutaroApp, /홈/);
  assert.match(sajutaroApp, /사주/);
  assert.match(sajutaroApp, /운세/);
  assert.match(sajutaroApp, /타로/);
});

test('Sajutaro typography and native home enforce the readable baseline', () => {
  assert.match(typeScale, /bodyLarge[\s\S]*18\.sp/);
  assert.match(typeScale, /bodyMedium[\s\S]*16\.sp/);
  assert.match(homeScreen, /오늘의 한마디/);
  assert.match(homeScreen, /오늘의 흐름/);
  assert.match(homeScreen, /지금 필요한 조언/);
  assert.match(strings, /<string name="app_name">사주타로<\/string>/);
});

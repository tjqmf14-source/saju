import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [gradle, manifest, activity, packageJson, workflow, strings] = await Promise.all([
  read('android/app/build.gradle'),
  read('android/app/src/main/AndroidManifest.xml'),
  read('android/app/src/main/java/kr/naesaju/personal/MainActivity.kt'),
  read('package.json'),
  read('.github/workflows/ci.yml'),
  read('android/app/src/main/res/values/strings.xml')
]);

test('Android V4 is a native Compose app instead of a packaged Vite site', () => {
  assert.match(gradle, /versionCode 400/);
  assert.match(gradle, /versionName '4\.0\.0'/);
  assert.match(gradle, /compose true/);
  assert.doesNotMatch(gradle, /syncWebAssets|generated\/assets\/site/);
  assert.match(activity, /ComponentActivity/);
  assert.match(activity, /setContent/);
  assert.doesNotMatch(activity, /WebView/);
  assert.match(strings, /<string name="app_name">사주타로<\/string>/);
});

test('Android V4 remains offline-first with a minimal permission surface', () => {
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|READ_CONTACTS|CAMERA|READ_PHONE_STATE|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
});

test('native build does not depend on Capacitor', () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.dependencies?.['@capacitor/core'], undefined);
  assert.equal(pkg.dependencies?.['@capacitor/android'], undefined);
  assert.equal(pkg.devDependencies?.['@capacitor/cli'], undefined);
});

test('CI builds and verifies the native Sajutaro V4 package', () => {
  assert.match(workflow, /build-android-native:/);
  assert.match(workflow, /gpt\/sajutaro-android-rebuild/);
  assert.match(workflow, /\.\/gradlew lintDebug testDebugUnitTest assembleDebug/);
  assert.match(workflow, /versionName '4\.0\.0'/);
  assert.match(workflow, /versionCode 400/);
  assert.match(workflow, /Sajutaro-4\.0\.0-debug\.apk/);
  assert.match(workflow, /Sajutaro-V4-Native-Debug/);
  assert.doesNotMatch(workflow, /cap add android|cap sync android/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [gradle, manifest, activity, packageJson, ui, workflow] = await Promise.all([
  read('android/app/build.gradle'),
  read('android/app/src/main/AndroidManifest.xml'),
  read('android/app/src/main/java/kr/naesaju/personal/MainActivity.java'),
  read('package.json'),
  read('src/premium-ui.js'),
  read('.github/workflows/android-apk.yml')
]);

test('Android app is versioned and packages the latest Vite dist', () => {
  assert.match(gradle, /versionCode 230/);
  assert.match(gradle, /versionName '2\.3\.0'/);
  assert.match(gradle, /generated\/assets\/site/);
  assert.match(gradle, /syncWebAssets/);
});

test('Android wrapper remains offline-only and blocks cleartext/external loading', () => {
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(activity, /appassets\.androidplatform\.net/);
  assert.match(activity, /emptyResponse\(403, "Forbidden"\)/);
  assert.match(activity, /setMixedContentMode\(WebSettings\.MIXED_CONTENT_NEVER_ALLOW\)/);
  assert.match(activity, /setAllowFileAccess\(false\)/);
  assert.match(activity, /setAllowContentAccess\(false\)/);
  assert.match(activity, /setWebContentsDebuggingEnabled\(false\)/);
});

test('Android native bridge only exposes local share and clipboard actions', () => {
  assert.match(activity, /addJavascriptInterface\(new NativeBridge\(\), "NaesajuNative"\)/);
  assert.match(activity, /@JavascriptInterface\s+public void copyText/);
  assert.match(activity, /@JavascriptInterface\s+public void shareText/);
  assert.match(activity, /Intent\.ACTION_SEND/);
  assert.doesNotMatch(activity, /Intent\.ACTION_VIEW/);
  assert.match(ui, /globalThis\.NaesajuNative/);
  assert.match(ui, /bridge\.shareText\('내사주 리포트',text\)/);
});

test('mobile build does not depend on Capacitor and CI builds the existing Android project', () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.dependencies?.['@capacitor/core'], undefined);
  assert.equal(pkg.dependencies?.['@capacitor/android'], undefined);
  assert.equal(pkg.devDependencies?.['@capacitor/cli'], undefined);
  assert.equal(pkg.scripts['mobile:build'], 'npm run check && cd android && gradlew.bat assembleDebug');
  assert.match(workflow, /\.\/gradlew lintDebug assembleDebug/);
  assert.doesNotMatch(workflow, /cap add android|cap sync android/);
});

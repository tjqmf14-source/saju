import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=async(path)=>readFile(new URL('../'+path,import.meta.url),'utf8');
const [gradle,manifest,activity,packageJson,ui,workflow]=await Promise.all([
  read('android/app/build.gradle'),
  read('android/app/src/main/AndroidManifest.xml'),
  read('android/app/src/main/java/kr/naesaju/personal/MainActivity.java'),
  read('package.json'),
  read('src/product-v20.js'),
  read('.github/workflows/android-apk.yml')
]);

test('Android app is V3 and packages the latest Vite dist',()=>{
  assert.match(gradle,/versionCode 300/);
  assert.match(gradle,/versionName '3\.0\.0'/);
  assert.match(gradle,/generated\/assets\/site/);
  assert.match(gradle,/syncWebAssets/);
  assert.equal(JSON.parse(packageJson).version,'3.0.0');
});

test('Android wrapper remains offline-only and blocks cleartext/external loading',()=>{
  assert.doesNotMatch(manifest,/android\.permission\.INTERNET/);
  assert.match(manifest,/android:usesCleartextTraffic="false"/);
  assert.match(manifest,/android:allowBackup="false"/);
  assert.match(activity,/appassets\.androidplatform\.net/);
  assert.match(activity,/emptyResponse\(403, "Forbidden"\)/);
  assert.match(activity,/setMixedContentMode\(WebSettings\.MIXED_CONTENT_NEVER_ALLOW\)/);
  assert.match(activity,/setAllowFileAccess\(false\)/);
  assert.match(activity,/setAllowContentAccess\(false\)/);
});

test('Android native bridge remains local-only',()=>{
  assert.match(activity,/addJavascriptInterface\(new NativeBridge\(\), "NaesajuNative"\)/);
  assert.match(activity,/@JavascriptInterface\s+public void copyText/);
  assert.match(activity,/@JavascriptInterface\s+public void shareText/);
  assert.match(ui,/globalThis\.NaesajuNative/);
  assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|WebSocket/);
});

test('mobile build remains native Gradle and verifies V3 artifact',()=>{
  const parsed=JSON.parse(packageJson);
  assert.equal(parsed.dependencies?.['@capacitor/core'],undefined);
  assert.equal(parsed.dependencies?.['@capacitor/android'],undefined);
  assert.match(workflow,/\.\/gradlew lintDebug assembleDebug/);
  assert.match(workflow,/versionName '3\.0\.0'/);
  assert.match(workflow,/versionCode 300/);
  assert.match(workflow,/Naesaju-3\.0\.0-debug\.apk/);
});

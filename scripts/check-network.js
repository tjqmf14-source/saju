import fs from 'node:fs';
import path from 'node:path';

const roots = ['src','index.html'];
const forbidden = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /navigator\.sendBeacon/,
  /sessionStorage/,
  /document\.cookie/
];

function filesAt(target){
  const stat=fs.statSync(target);
  if(stat.isFile()) return [target];
  return fs.readdirSync(target,{withFileTypes:true}).flatMap((entry)=>{
    const next=path.join(target,entry.name);
    return entry.isDirectory()?filesAt(next):[next];
  }).filter((file)=>/\.(js|html)$/.test(file));
}

const violations=[];
for(const root of roots){
  for(const file of filesAt(root)){
    const text=fs.readFileSync(file,'utf8');
    for(const pattern of forbidden){
      if(pattern.test(text)) violations.push(`${file}: ${pattern}`);
    }
  }
}

if(violations.length){
  console.error('오프라인/개인정보 정책 위반 가능 코드가 발견되었습니다.');
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('OK: 앱 소스에 네트워크 전송/쿠키 기반 추적 API가 없습니다. 선택한 프로필은 기기 로컬 저장만 허용합니다.');

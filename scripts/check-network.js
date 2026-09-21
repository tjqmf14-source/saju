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
    if(/localStorage/.test(text) && file!==path.join('src','commercial-upgrades.js')) violations.push(`${file}: localStorage outside approved local profile module`);
    if(file===path.join('src','commercial-upgrades.js') && /localStorage/.test(text) && !/naesaju\./.test(text)) violations.push(`${file}: localStorage key must use naesaju namespace`);
  }
}

if(violations.length){
  console.error('오프라인/개인정보 정책 위반 가능 코드가 발견되었습니다.');
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('OK: 외부 네트워크 전송 API가 없고, 영구 저장은 승인된 naesaju 로컬 프로필/재방문 데이터에만 제한됩니다.');

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DEST=path.join(ROOT,'public','tarot-rws');
const BASE='https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards';
const files=[
  ...Array.from({length:22},(_,i)=>`m${String(i).padStart(2,'0')}.jpg`),
  ...['c','p','s','w'].flatMap((prefix)=>Array.from({length:14},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}.jpg`))
];

if(files.length!==78) throw new Error(`RWS asset list must contain 78 files, got ${files.length}`);

function download(url,destination,redirects=0){
  return new Promise((resolve,reject)=>{
    const request=https.get(url,{headers:{'User-Agent':'saju-offline-v2-rws-sync'}},(response)=>{
      if(response.statusCode>=300&&response.statusCode<400&&response.headers.location&&redirects<5){
        response.resume();
        return resolve(download(new URL(response.headers.location,url).href,destination,redirects+1));
      }
      if(response.statusCode!==200){
        response.resume();
        return reject(new Error(`HTTP ${response.statusCode} while downloading ${url}`));
      }
      const chunks=[];
      response.on('data',(chunk)=>chunks.push(chunk));
      response.on('end',async()=>{
        try{await fs.writeFile(destination,Buffer.concat(chunks));resolve();}catch(error){reject(error);}
      });
    });
    request.on('error',reject);
    request.setTimeout(20000,()=>request.destroy(new Error(`Timeout while downloading ${url}`)));
  });
}

await fs.mkdir(DEST,{recursive:true});
let downloaded=0;
const queue=[];
for(const file of files){
  const target=path.join(DEST,file);
  try{
    const stat=await fs.stat(target);
    if(stat.size>10_000) continue;
  }catch{}
  queue.push(file);
}

const workers=Array.from({length:Math.min(6,queue.length)},async()=>{
  while(queue.length){
    const file=queue.shift();
    await download(`${BASE}/${file}`,path.join(DEST,file));
    downloaded+=1;
  }
});
await Promise.all(workers);

const existing=await fs.readdir(DEST);
const ready=files.filter((file)=>existing.includes(file));
if(ready.length!==78) throw new Error(`RWS asset sync incomplete: ${ready.length}/78`);
console.log(`RWS assets ready: 78/78${downloaded?` (${downloaded} downloaded)`:''}`);

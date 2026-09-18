import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const chunkDir=resolve(root,'assets/oracle-atlas');
const output=resolve(root,'public/oracle/b-visual-atlas.webp');
const EXPECTED_CHUNKS=7;
const EXPECTED_BYTES=79548;
const EXPECTED_SHA256='9ab3f1366bf1ed44b937d8abc7fcdedbf03bcc8272711ab77ea664faf11d5bb2';

const chunks=[];
for(let index=0;index<EXPECTED_CHUNKS;index+=1){
  const name=`chunk-${String(index).padStart(2,'0')}.txt`;
  const raw=await readFile(resolve(chunkDir,name),'utf8');
  const chunk=raw.replace(/\s+/g,'');
  if(!chunk) throw new Error(`Oracle atlas chunk is empty: ${name}`);
  if(!/^[A-Za-z0-9+/=]+$/.test(chunk)) throw new Error(`Oracle atlas chunk is not valid base64 text: ${name}`);
  chunks.push(chunk);
}

const encoded=chunks.join('');
if(encoded.length%4!==0) throw new Error(`Oracle atlas base64 length is invalid: ${encoded.length}`);

const atlas=Buffer.from(encoded,'base64');
if(atlas.length!==EXPECTED_BYTES) throw new Error(`Oracle atlas byte length mismatch: expected ${EXPECTED_BYTES}, got ${atlas.length}`);
if(atlas.toString('ascii',0,4)!=='RIFF' || atlas.toString('ascii',8,12)!=='WEBP'){
  throw new Error('Oracle atlas failed RIFF/WEBP signature validation');
}
const riffSize=atlas.readUInt32LE(4)+8;
if(riffSize!==atlas.length) throw new Error(`Oracle atlas RIFF size mismatch: header ${riffSize}, bytes ${atlas.length}`);

const sha256=createHash('sha256').update(atlas).digest('hex');
if(sha256!==EXPECTED_SHA256) throw new Error(`Oracle atlas checksum mismatch: ${sha256}`);

await mkdir(dirname(output),{recursive:true});
let current=null;
try{ current=await readFile(output); }catch{}
if(!current || !current.equals(atlas)) await writeFile(output,atlas);

console.log(`Oracle atlas ready: ${atlas.length} bytes · sha256 ${sha256}`);

import fs from 'node:fs'; import path from 'node:path';
const DIR='/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon';
const OUT=DIR+'/images';
const manifest=JSON.parse(fs.readFileSync(DIR+'/images-manifest.json','utf8'));
fs.mkdirSync(OUT,{recursive:true});
let done=0, failed=0, skipped=0, bytes=0;
const CONC=8;
let i=0;
async function worker(){
  while(i<manifest.length){
    const item=manifest[i++];
    const dir=path.join(OUT,item.prop_id);
    const ext=(item.url.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i)||[,'jpg'])[1];
    const file=path.join(dir,`${String(item.idx).padStart(2,'0')}.${ext}`);
    if(fs.existsSync(file)&&fs.statSync(file).size>0){skipped++;continue;}
    fs.mkdirSync(dir,{recursive:true});
    try{
      const r=await fetch(item.url,{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36','Referer':'https://www.99acres.com/'}});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const buf=Buffer.from(await r.arrayBuffer());
      if(buf.length<100) throw new Error('too small');
      fs.writeFileSync(file,buf); bytes+=buf.length; done++;
    }catch(e){ failed++; fs.appendFileSync(DIR+'/image-failures.log', `${item.url}\t${e.message}\n`); }
    if((done+failed+skipped)%400===0) console.log(`${done+failed+skipped}/${manifest.length} ok=${done} fail=${failed} skip=${skipped} ${(bytes/1048576).toFixed(0)}MB`);
    await new Promise(r=>setTimeout(r,60));
  }
}
await Promise.all(Array.from({length:CONC},worker));
console.log(`FINAL ok=${done} failed=${failed} skipped=${skipped} size=${(bytes/1048576).toFixed(1)}MB`);

import fs from 'node:fs'; import path from 'node:path';
const DIR='/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon';
const OUT=DIR+'/videos';
const H={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36','Referer':'https://www.99acres.com/'};
const vids=JSON.parse(fs.readFileSync(DIR+'/videos-manifest.json','utf8')).filter(v=>v.hls);
fs.mkdirSync(OUT,{recursive:true});

const get=async(u,bin=false)=>{const r=await fetch(u,{headers:H}); if(!r.ok) throw new Error('HTTP '+r.status); return bin?Buffer.from(await r.arrayBuffer()):r.text();};

let ok=0, fail=0, skip=0, bytes=0, n=0;
const CONC=4; let i=0;
async function worker(){
  while(i<vids.length){
    const v=vids[i++]; n++;
    const dir=path.join(OUT,v.prop_id);
    const file=path.join(dir,`${v.video_id}.ts`);
    if(fs.existsSync(file)&&fs.statSync(file).size>10000){skip++;continue;}
    try{
      const base=v.hls.replace(/\/[^/]*$/,'/');
      const master=await get(v.hls);
      // pick highest resolution variant
      const variants=[...master.matchAll(/RESOLUTION=(\d+)x(\d+)[^\n]*\n([^\n#]+)/g)]
        .map(m=>({px:+m[1]*+m[2], file:m[3].trim()})).sort((a,b)=>b.px-a.px);
      const pl = variants.length ? await get(base+variants[0].file) : master;
      const segs=[...pl.matchAll(/^([^#\n][^\n]*\.ts)\s*$/gm)].map(m=>m[1].trim());
      if(!segs.length) throw new Error('no segments');
      fs.mkdirSync(dir,{recursive:true});
      const parts=[];
      for(const s of segs) parts.push(await get(base+s,true));
      const buf=Buffer.concat(parts);
      fs.writeFileSync(file,buf); bytes+=buf.length; ok++;
      fs.appendFileSync(DIR+'/videos-downloaded.tsv',`${v.prop_id}\t${v.video_id}\t${variants[0]?.file||'?'}\t${segs.length}\t${buf.length}\n`);
    }catch(e){ fail++; fs.appendFileSync(DIR+'/video-failures.log',`${v.prop_id}\t${v.hls}\t${e.message}\n`); }
    if(n%20===0) console.log(`${n}/${vids.length} ok=${ok} fail=${fail} skip=${skip} ${(bytes/1073741824).toFixed(2)}GB`);
  }
}
await Promise.all(Array.from({length:CONC},worker));
console.log(`FINAL ok=${ok} failed=${fail} skipped=${skip} size=${(bytes/1073741824).toFixed(2)}GB`);

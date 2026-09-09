import fs from 'node:fs';
const DIR='/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon';

const files = fs.readdirSync(DIR+'/raw-json').filter(f=>f.endsWith('.json'))
  .sort((a,b)=>+a.match(/\d+/)[0] - +b.match(/\d+/)[0]);

let facets=null;
const byId=new Map();
for(const f of files){
  const p=JSON.parse(fs.readFileSync(DIR+'/raw-json/'+f,'utf8'));
  if(!facets && p.facets) facets=p.facets;
  for(const prop of p.properties) if(!byId.has(prop.PROP_ID)) byId.set(prop.PROP_ID, prop);
}
console.log('unique properties:', byId.size);

// code -> label maps from facets
const map = (key) => Object.fromEntries((facets?.[key]||[]).filter(x=>x.label).map(x=>[String(x.id), x.label]));
const FURNISH=map('FURNISH'), TRANSACT=map('TRANSACT_TYPE'), FEATURES={...map('FEATURES'),...map('PROPERTY_FEATURES')};
const FACING={1:'North',2:'South',3:'East',4:'West',5:'North-East',6:'North-West',7:'South-East',8:'South-West'};
const OWNTYPE={1:'Freehold',2:'Leasehold',3:'Co-operative Society',4:'Power of Attorney'};
fs.writeFileSync(DIR+'/facets.json', JSON.stringify(facets,null,2));

const decode = (csv, m) => String(csv||'').split(',').filter(Boolean).map(c=>m[c.trim()]||('code:'+c.trim())).join(' | ');
const num = v => { const n=parseFloat(String(v??'').replace(/[^0-9.]/g,'')); return Number.isFinite(n)?n:''; };

const rows=[...byId.values()].map(p=>{
  const F=p.FORMATTED||{}, L=p.location||{}, M=p.MAP_DETAILS||{};
  const imgs=[...new Set([...(p.PROPERTY_IMAGES||[]), p.PHOTO_URL].filter(Boolean))];
  return {
    prop_id: p.PROP_ID,
    spid: p.SPID,
    heading: p.PROP_HEADING,
    property_type: F.PROP_TYPE_LABEL || p.PROPERTY_TYPE,
    transaction: TRANSACT[p.TRANSACT_TYPE] || p.TRANSACT_TYPE,
    city: p.CITY,
    locality: L.LOCALITY_NAME || p.LOCALITY_WO_CITY || p.LOCALITY,
    locality_full: p.LOCALITY,
    society: p.SOCIETY_NAME || L.SOCIETY_NAME || '',
    address: L.ADDRESS || '',
    latitude: M.LATITUDE || '',
    longitude: M.LONGITUDE || '',
    price_display: p.FORMATTED_PRICE || p.PRICE,
    price_inr: num(F.AVG_PRICE),
    price_in_words: F.PRICE_IN_WORDS || '',
    price_per_sqft: num(F.PRICE_SQFT || p.PRICE_SQFT),
    area_display: p.AREA,
    super_area: num(p.SUPER_AREA),
    area_sqft: num(p.SUPER_SQFT || p.MIN_AREA_SQFT),
    area_unit: p.SUPERAREA_UNIT__U || p.AREA_UNIT__U || '',
    bedrooms: p.BEDROOM_NUM || '',
    bathrooms: p.BATHROOM_NUM || '',
    balconies: p.BALCONY_NUM || '',
    total_floors: p.TOTAL_FLOOR || '',
    furnishing: F.FURNISH_LABEL || FURNISH[p.FURNISH] || '',
    facing: FACING[p.FACING] || '',
    age: p.AGE || '',
    ownership: OWNTYPE[p.OWNTYPE] || '',
    gated: p.GATED || '',
    corner_property: p.CORNER_PROPERTY || '',
    reserved_parking: p.RESERVED_PARKING || '',
    verified: p.VERIFIED || '',
    rera: F.RERA_TYPE || '',
    poster_rera_registered: p.IS_POSTER_RERA_REGISTERED || '',
    listing_by: p.CLASS_HEADING || p.CLASS_LABEL || p.CLASS || '',
    contact_name: p.CONTACT_NAME || '',
    contact_company: p.CONTACT_COMPANY_NAME || '',
    brokerage: p.BROKERAGE || '',
    amenities: decode(p.AMENITIES, FEATURES),
    features: decode(p.FEATURES, FEATURES),
    overlooking: p.OVERLOOKING || '',
    availability: p.AVAILABILITY || '',
    posting_date: p.POSTING_DATE ? new Date(+p.POSTING_DATE).toISOString().slice(0,10) : '',
    update_date: p.UPDATE_DATE ? new Date(+p.UPDATE_DATE).toISOString().slice(0,10) : '',
    description: (p.DESCRIPTION||'').replace(/\s+/g,' ').trim(),
    url: p.PD_URL ? 'https://www.99acres.com'+p.PD_URL : '',
    image_count: imgs.length,
    images: imgs.join(' | '),
    video_count: (p.PROPERTY_VIDEOS||[]).length,
    video_hls: (p.PROPERTY_VIDEOS||[]).map(v=>v.VARIANT_MAP?.ABR).filter(Boolean).join(' | '),
    video_youtube: (p.PROPERTY_VIDEOS||[]).map(v=>v.VARIANT_MAP?.O).filter(Boolean).join(' | '),
    video_ids: (p.PROPERTY_VIDEOS||[]).map(v=>v.VIDEO_ID).filter(Boolean).join(' | '),
  };
});

fs.writeFileSync(DIR+'/farmhouses-gurgaon.json', JSON.stringify(rows,null,2));

const cols=Object.keys(rows[0]);
const esc=v=>{const s=String(v??''); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
fs.writeFileSync(DIR+'/farmhouses-gurgaon.csv',
  [cols.join(','), ...rows.map(r=>cols.map(c=>esc(r[c])).join(','))].join('\n'));

// image manifest for downloader
const manifest=rows.flatMap(r=>r.images.split(' | ').filter(Boolean).map((u,i)=>({prop_id:r.prop_id,idx:i,url:u})));
fs.writeFileSync(DIR+'/images-manifest.json', JSON.stringify(manifest));
console.log('rows:',rows.length,'| columns:',cols.length,'| images:',manifest.length);
const priced=rows.filter(r=>r.price_inr);
console.log('with price:',priced.length,'| with geo:',rows.filter(r=>r.latitude).length);

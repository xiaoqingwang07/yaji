const fs=require('fs');
const path=require('path');
const meta=path.join(__dirname,'_recapture.mjs_meta.json');
const T=JSON.parse(fs.readFileSync(meta,'utf8'));
const out=path.join(__dirname,'_recapture.mjs');
const L=[];
const a=(x)=>L.push(x);

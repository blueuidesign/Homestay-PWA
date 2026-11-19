const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2];const boards=process.argv.slice(3);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:3600,height:1400},deviceScaleFactor:1});
const errs=[];pg.on('pageerror',e=>errs.push(e.message.slice(0,150)));
const idx=[];
for(const bd of boards){await pg.goto('http://localhost:8765/'+bd);await pg.waitForTimeout(3500);
 const els=await pg.locator('[data-screen-label]').all();
 for(const el of els){const lab=await el.getAttribute('data-screen-label');const code=lab.split(' ')[0];
  let fn=code; let k=1; while(idx.find(x=>x.fn===fn)){fn=code+'_'+(++k);}
  try{await el.screenshot({path:out+'/'+fn+'.png'});idx.push({fn,code,lab,board:bd});}catch(e){console.log('fail',lab,e.message.slice(0,80));}}
 console.log(bd,els.length);}
fs.writeFileSync(out+'/index.json',JSON.stringify(idx,null,1));console.log('errors',errs.slice(0,5));await b.close();})();

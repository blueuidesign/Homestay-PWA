const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const boards=process.argv.slice(3);const b=await chromium.launch();const pg=await b.newPage({viewport:{width:3600,height:1400}});
let css=new Set(), body=[];
for(const bd of boards){await pg.goto('http://localhost:8765/'+bd);await pg.waitForTimeout(3500);
 const r=await pg.evaluate(()=>{const st=[...document.querySelectorAll('style')].map(s=>s.textContent);
   const secs=[...document.querySelectorAll('section')].map(s=>s.outerHTML);return {st,secs};});
 r.st.forEach(s=>css.add(s)); body.push('<!-- '+bd+' -->\n'+r.secs.join('\n'));}
for(const f of ['tokens/colors.css','tokens/spacing.css','tokens/typography.css','components/components.css']) css.add(fs.readFileSync('pwa/project/ds/halonghomestay/'+f,'utf8'));
const html='<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><title>Home247 · Lịch phòng Hạ Long · bản PWA</title><meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n'+[...css].join('\n')+'\n</style></head><body>\n'+body.join('\n')+'\n</body></html>\n';
fs.writeFileSync(process.argv[2],html);console.log(html.length);await b.close();})();

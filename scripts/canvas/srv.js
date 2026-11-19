const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=process.argv[2], SUP=process.argv[3], BLOB=process.argv[4];
const blobMap=JSON.parse(fs.readFileSync(BLOB));
http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0].split('#')[0]);
 let f; if(u.endsWith('/support.js')) f=SUP; else if(u.startsWith('/_blob/')) f=blobMap[u.slice(7)]; else f=path.join(ROOT,u);
 if(!f||!fs.existsSync(f)){r.writeHead(404);return r.end();}
 const ext=path.extname(f); r.writeHead(200,{'content-type':{'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'}[ext]||'application/octet-stream'});
 fs.createReadStream(f).pipe(r);}).listen(8765,()=>console.log('up'));

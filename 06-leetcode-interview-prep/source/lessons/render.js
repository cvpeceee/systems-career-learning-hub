// Render concept-lesson MP4s: draw each frame with web/player.js in headless Chrome, pipe JPEGs to ffmpeg with the Piper audio.
const puppeteer=require('/workspace/ip/node_modules/puppeteer-core');const fs=require('fs');const {spawn}=require('child_process');
const FPS=12, OUT='/workspace/ip/lessons/out', VID='/workspace/ip/lessons/video';fs.mkdirSync(VID,{recursive:true});
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const pg=await b.newPage();
 await pg.setContent('<canvas id=c width=854 height=480></canvas><script>'+fs.readFileSync('/workspace/ip/web/player.js','utf8')+'</script>');
 const ids=process.argv.slice(2).length?process.argv.slice(2):fs.readdirSync(OUT).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5));
 for(const id of ids){const les=JSON.parse(fs.readFileSync(`${OUT}/${id}.json`));const total=les.scenes.reduce((a,s)=>a+s.dur,0);const N=Math.ceil(total*FPS);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i',`${OUT}/${id}.wav`,'-i',`${OUT}/${id}.vtt`,
   '-map','0:v','-map','1:a','-map','2:s','-c:v','libx264','-preset','medium','-crf','30','-pix_fmt','yuv420p','-tune','animation','-c:a','aac','-b:a','48k','-ac','1','-c:s','mov_text','-metadata:s:s:0','language=eng','-shortest','-movflags','+faststart',`${VID}/${id}.mp4`],{stdio:['pipe','inherit','inherit']});
  await pg.evaluate(j=>{window.L=JSON.parse(j);window.ctx=document.getElementById('c').getContext('2d');},JSON.stringify(les));
  for(let f=0;f<N;f+=48){const urls=await pg.evaluate((f,N,FPS)=>{const r=[];for(let k=f;k<Math.min(N,f+48);k++){LessonPlayer.draw(ctx,L,k/FPS);r.push(ctx.canvas.toDataURL('image/jpeg',0.85).split(',')[1]);}return r;},f,N,FPS);
   for(const u of urls){if(!ff.stdin.write(Buffer.from(u,'base64')))await new Promise(r=>ff.stdin.once('drain',r));}}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log(id,N,'frames',total.toFixed(1)+'s');}
 await b.close();})();

/* player.js - draws concept-lesson scenes on a <canvas>. The SAME code renders the MP4 frames
   (via headless Chrome) and the in-page animated lesson, so both always match. */
(function(){
const W=854,H=480;
const C={bg:'#0f172a',panel:'#1e293b',ink:'#e2e8f0',mut:'#94a3b8',acc:'#38bdf8',hl:'#f59e0b',ok:'#22c55e',bad:'#ef4444',vio:'#a78bfa',cap:'rgba(0,0,0,.72)'};
function rr(x,y,w,h,r,fill,stroke,ctx){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function txt(ctx,s,x,y,size,color,align,bold){ctx.font=(bold?'bold ':'')+size+'px DejaVu Sans, Arial, sans-serif';ctx.fillStyle=color||C.ink;ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillText(String(s),x,y);}
function wrap(ctx,s,maxw,size){ctx.font=size+'px DejaVu Sans, Arial, sans-serif';const words=String(s).split(' ');const lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxw&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
function box(ctx,x,y,w,h,label,state){const fill=state==='hl'?C.hl:state==='ok'?C.ok:state==='bad'?C.bad:state==='dim'?'#334155':C.panel;rr(x,y,w,h,8,fill,state==='hl'?'#fde68a':'#475569',ctx);txt(ctx,label,x+w/2,y+h/2,Math.min(22,h*0.45),state==='hl'||state==='ok'?'#0f172a':C.ink,'center',true);}
function arrow(ctx,x1,y1,x2,y2,color,head=9){ctx.strokeStyle=color||C.mut;ctx.fillStyle=color||C.mut;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-head*Math.cos(a-0.4),y2-head*Math.sin(a-0.4));ctx.lineTo(x2-head*Math.cos(a+0.4),y2-head*Math.sin(a+0.4));ctx.closePath();ctx.fill();}
function note(ctx,s){if(!s)return;const L=wrap(ctx,s,W-120,19);L.forEach((l,i)=>txt(ctx,l,W/2,352+i*24,19,C.acc,'center',true));}
function treePos(arr,WW){WW=WW||W;const pos={};const xs=[];let idx=0;const q=[];if(!arr.length||arr[0]===null)return pos;
  // assign positions using level order with nulls (LeetCode format)
  const nodes=[{v:arr[0],d:0,lo:60,hi:W-60}];pos[0]={v:arr[0],x:WW/2,y:95,p:-1};let i=1;const qq=[0];
  const meta={0:{lo:40,hi:WW-40,d:0}};
  while(qq.length&&i<arr.length){const p=qq.shift();const m=meta[p];const mid=(m.lo+m.hi)/2;
    for(const side of [0,1]){if(i>=arr.length)break;const v=arr[i];if(v!==null){const lo=side?mid:m.lo,hi=side?m.hi:mid;meta[i]={lo,hi,d:m.d+1};pos[i]={v,x:(lo+hi)/2,y:95+(m.d+1)*68,p};qq.push(i);}i++;}}
  return pos;}
const K={};
K.title=(ctx,s,st,p)=>{const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0f172a');g.addColorStop(1,'#1e3a5f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const L=wrap(ctx,s.title,W-120,38);L.forEach((l,i)=>txt(ctx,l,W/2,150+i*46,38,'#f8fafc','center',true));
  if(s.sub)wrap(ctx,s.sub,W-160,21).forEach((l,i)=>txt(ctx,l,W/2,170+L.length*46+i*28,21,C.acc,'center'));
  const r=18+8*Math.sin(p*Math.PI*4);ctx.beginPath();ctx.arc(W/2,70,r,0,7);ctx.fillStyle=C.hl;ctx.fill();};
K.bullets=(ctx,s,st,p,si)=>{const n=si+1;s.items.slice(0,n).forEach((it,i)=>{const L=wrap(ctx,it,W-170,21);const y=95+i*58;ctx.beginPath();ctx.arc(80,y,8,0,7);ctx.fillStyle=i===n-1?C.hl:C.acc;ctx.fill();L.forEach((l,j)=>txt(ctx,l,100,y+j*24,21,i===n-1?'#fff':C.ink));});};
K.analogy=(ctx,s,st,p,si)=>{rr(60,80,W-120,250,18,'#172554','#3b82f6',ctx);txt(ctx,'In plain words',90,108,18,C.acc,'left',true);
  wrap(ctx,s.text,W-190,23).forEach((l,i)=>txt(ctx,l,90,150+i*31,23,'#f8fafc'));
  if(s.icons){s.icons.forEach((ic,i)=>{const x=110+i*((W-220)/Math.max(1,s.icons.length-1));const on=i<=si;ctx.font='bold 16px DejaVu Sans';const bw=Math.max(100,ctx.measureText(ic).width+24);box(ctx,Math.max(64,Math.min(W-64-bw,x-bw/2)),280,bw,36,ic,on?'hl':'dim');});}};
K.array=(ctx,s,st)=>{const a=st.a||[];const n=a.length;const bw=Math.min(70,(W-80)/Math.max(n,1));const x0=(W-bw*n)/2;const y=170;
  a.forEach((v,i)=>{const state=(st.hl||[]).includes(i)?'hl':(st.ok||[]).includes(i)?'ok':(st.dim||[]).includes(i)?'dim':'';box(ctx,x0+i*bw+3,y,bw-6,56,v,state);txt(ctx,i,x0+i*bw+bw/2,y+72,13,C.mut,'center');});
  const ptr=st.ptr||{};const used={};Object.entries(ptr).forEach(([k,i])=>{if(i==null)return;const lvl=used[i]=(used[i]||0)+1;const x=x0+i*bw+bw/2;const yy=y-16-(lvl-1)*30;arrow(ctx,x,yy-14,x,y-4,C.vio);txt(ctx,k,x,yy-24,16,C.vio,'center',true);});
  if(st.side)Object.entries(st.side).forEach(([k,v],i)=>txt(ctx,k+': '+v,70,290+i*26,18,C.ink));note(ctx,st.note);};
K.hash=(ctx,s,st)=>{const B=s.buckets;const bh=Math.min(44,250/B);const x0=330;
  if(st.key!==undefined){box(ctx,60,150,150,50,st.key,'hl');arrow(ctx,215,175,320,(st.b!=null?70+st.b*bh+bh/2:175),C.hl);if(st.calc)txt(ctx,st.calc,135,225,16,C.mut,'center');}
  for(let i=0;i<B;i++){const y=70+i*bh;box(ctx,x0,y+2,60,bh-4,i,st.b===i?'hl':'');const items=(st.table||[])[i]||[];items.forEach((it,j)=>{box(ctx,x0+90+j*120,y+3,110,bh-6,it,'');if(j===0)arrow(ctx,x0+62,y+bh/2,x0+88,y+bh/2);else arrow(ctx,x0+90+j*120-10,y+bh/2,x0+90+j*120-2,y+bh/2);});}
  note(ctx,st.note);};
K.stack=(ctx,s,st)=>{const it=st.items||[];const x=W/2-90;rr(x-10,70,200,280,10,null,'#475569',ctx);
  it.forEach((v,i)=>box(ctx,x,330-(i+1)*44,180,40,v,i===it.length-1?'hl':''));txt(ctx,'top',x+230,330-it.length*44+20,16,C.hl,'left',true);if(st.out)txt(ctx,st.out,120,200,22,C.ok,'center',true);note(ctx,st.note);};
K.queue=(ctx,s,st)=>{const it=st.items||[];txt(ctx,'front',90,130,16,C.ok,'center',true);txt(ctx,'back',W-90,130,16,C.hl,'center',true);
  it.forEach((v,i)=>box(ctx,90+i*90,160,80,56,v,i===0?'ok':i===it.length-1?'hl':''));note(ctx,st.note);};
K.list=(ctx,s,st)=>{const nodes=st.nodes||[];const n=nodes.length;const gap=Math.min(150,(W-80)/Math.max(n,1));const x0=(W-gap*n)/2+10;const y=180;
  nodes.forEach((v,i)=>{box(ctx,x0+i*gap,y,gap-50,50,v,(st.hl||[]).includes(i)?'hl':'');});
  const nx=st.next||nodes.map((_,i)=>i+1<n?i+1:-1);
  nx.forEach((j,i)=>{const xs=x0+i*gap+(gap-50);const bx=x0+i*gap+(gap-50)/2;if(j===-1){const right=(i===n-1)&&(n===1||nx[i-1]===i);txt(ctx,'∅',right?xs+20:x0+i*gap-16,y+25,20,C.mut,'center');return;}
    if(j===i+1)arrow(ctx,xs+2,y+25,x0+j*gap-4,y+25,C.acc);else if(j===i-1){const tx=x0+j*gap+(gap-50)/2;ctx.strokeStyle=C.ok;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(bx,y+50);ctx.quadraticCurveTo((bx+tx)/2,y+95,tx+8,y+54);ctx.stroke();arrow(ctx,tx+14,y+62,tx+6,y+52,C.ok);}});
  Object.entries(st.labels||{}).forEach(([k,i],q)=>{if(i==null||i<0)return;const x=x0+i*gap+(gap-50)/2;arrow(ctx,x,y-36,x,y-4,C.vio);txt(ctx,k,x,y-48-(q%2)*0,16,C.vio,'center',true);});note(ctx,st.note);};
K.tree=(ctx,s,st)=>{const pos=treePos(s.tree,st.frames?W-230:W);const byV={};Object.values(pos).forEach(n=>byV[n.v]=n);
  Object.values(pos).forEach(n=>{if(n.p>=0){const P=pos[n.p];ctx.strokeStyle='#475569';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(n.x,n.y);ctx.stroke();}});
  Object.values(pos).forEach(n=>{const state=(st.hl||[]).includes(n.v)?'hl':(st.ok||[]).includes(n.v)?'ok':(st.bad||[]).includes(n.v)?'bad':'';ctx.beginPath();ctx.arc(n.x,n.y,22,0,7);ctx.fillStyle=state==='hl'?C.hl:state==='ok'?C.ok:state==='bad'?C.bad:C.panel;ctx.fill();ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.stroke();txt(ctx,n.v,n.x,n.y,18,state?'#0f172a':C.ink,'center',true);});
  if(st.frames){st.frames.forEach((f,i)=>box(ctx,W-215,300-i*36,200,32,f,i===st.frames.length-1?'hl':''));txt(ctx,'call stack ↑ top',W-115,346,14,C.mut,'center');}
  if(st.side)Object.entries(st.side).forEach(([k,v],i)=>txt(ctx,k+': '+v,30,300+i*24,17,C.ink));note(ctx,st.note);};
K.callstack=(ctx,s,st)=>{const fr=st.frames||[];txt(ctx,'Call stack (top = running now)',W/2,84,16,C.mut,'center');
  fr.forEach((f,i)=>box(ctx,W/2-170,330-i*44,340,38,f,i===fr.length-1?'hl':''));if(st.ret)txt(ctx,'returned: '+st.ret,W/2,112,19,C.ok,'center',true);if(!st.ret)note(ctx,st.note);};
K.heap=(ctx,s,st)=>{const a=st.a||[];const pos={};a.forEach((v,i)=>{const d=Math.floor(Math.log2(i+1));const k=i-(2**d-1);const cnt=2**d;pos[i]={x:(k+0.5)*(W/cnt),y:80+d*62};});
  a.forEach((v,i)=>{if(i>0){const P=pos[(i-1)>>1];ctx.strokeStyle='#475569';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(pos[i].x,pos[i].y);ctx.stroke();}});
  a.forEach((v,i)=>{const h=(st.hl||[]).includes(i);ctx.beginPath();ctx.arc(pos[i].x,pos[i].y,20,0,7);ctx.fillStyle=h?C.hl:C.panel;ctx.fill();ctx.strokeStyle='#94a3b8';ctx.stroke();txt(ctx,v,pos[i].x,pos[i].y,16,h?'#0f172a':C.ink,'center',true);});
  const bw=46,x0=(W-bw*a.length)/2;a.forEach((v,i)=>{box(ctx,x0+i*bw+2,300,bw-4,34,v,(st.hl||[]).includes(i)?'hl':'');txt(ctx,i,x0+i*bw+bw/2,342,12,C.mut,'center');});note(ctx,st.note);};
K.graph=(ctx,s,st)=>{const N=s.nodes;(s.edges||[]).forEach(([a,b])=>{const A=N[a],B=N[b];const on=(st.he||[]).some(e=>(e[0]===a&&e[1]===b)||(!s.directed&&e[0]===b&&e[1]===a));
    if(s.directed){const ang=Math.atan2(B[2]-A[2],B[1]-A[1]);arrow(ctx,A[1]+24*Math.cos(ang),A[2]+24*Math.sin(ang),B[1]-26*Math.cos(ang),B[2]-26*Math.sin(ang),on?C.hl:'#64748b');}
    else{ctx.strokeStyle=on?C.hl:'#64748b';ctx.lineWidth=on?4:2;ctx.beginPath();ctx.moveTo(A[1],A[2]);ctx.lineTo(B[1],B[2]);ctx.stroke();}});
  N.forEach((n,i)=>{const state=(st.hl||[]).includes(i)?'hl':(st.ok||[]).includes(i)?'ok':'';ctx.beginPath();ctx.arc(n[1],n[2],22,0,7);ctx.fillStyle=state==='hl'?C.hl:state==='ok'?C.ok:C.panel;ctx.fill();ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.stroke();txt(ctx,n[0],n[1],n[2],17,state?'#0f172a':C.ink,'center',true);});
  if(st.side)Object.entries(st.side).forEach(([k,v],i)=>txt(ctx,k+': '+v,24,330+i*24,17,C.ink));if(!st.side)note(ctx,st.note);else if(st.note)txt(ctx,st.note,W-24,330,17,C.acc,'right',true);};
K.grid=(ctx,s,st)=>{const g=st.g||[];const R=g.length,Cc=(g[0]||[]).length;const cs=Math.min(56,230/Math.max(R,1),(W-120)/Math.max(Cc,1));const x0=(W-cs*Cc)/2,y0=110;
  if(s.colLabels)s.colLabels.forEach((l,j)=>txt(ctx,l,x0+j*cs+cs/2,y0-14,14,C.mut,'center'));if(s.rowLabels)s.rowLabels.forEach((l,i)=>txt(ctx,l,x0-20,y0+i*cs+cs/2,14,C.mut,'center'));
  g.forEach((row,i)=>row.forEach((v,j)=>{const h=(st.hl||[]).some(c=>c[0]===i&&c[1]===j);const o=(st.ok||[]).some(c=>c[0]===i&&c[1]===j);box(ctx,x0+j*cs+2,y0+i*cs+2,cs-4,cs-4,v,h?'hl':o?'ok':'');}));note(ctx,st.note);};
K.chart=(ctx,s,st,p,si)=>{const x0=90,y0=330,w=W-230,h=250;ctx.strokeStyle='#64748b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y0-h);ctx.lineTo(x0,y0);ctx.lineTo(x0+w,y0);ctx.stroke();
  txt(ctx,'input size n →',x0+w,y0+20,15,C.mut,'right');txt(ctx,'work',x0-10,y0-h-12,15,C.mut,'left');
  const F={'O(1)':n=>1,'O(log n)':n=>Math.log2(n+1),'O(n)':n=>n,'O(n log n)':n=>n*Math.log2(n+1),'O(n²)':n=>n*n};const cols=[C.ok,'#2dd4bf',C.acc,C.vio,C.bad];
  const top=F['O(n log n)'](40);const keys=Object.keys(F).slice(0,Math.max(1,si));let lastY=1e9;
  ctx.save();ctx.beginPath();ctx.rect(x0,y0-h-5,w+5,h+5);ctx.clip();
  keys.forEach((k,ki)=>{ctx.strokeStyle=cols[ki];ctx.lineWidth=3;ctx.beginPath();for(let n=1;n<=40;n++){const X=x0+n/40*w,Y=y0-F[k](n)/top*h;n===1?ctx.moveTo(X,Y):ctx.lineTo(X,Y);}ctx.stroke();});ctx.restore();
  const ys=keys.map((k,ki)=>[k,ki,Math.max(y0-h,y0-F[k](40)/top*h)]);ys.sort((a,b)=>b[2]-a[2]);let prev=1e9;ys.forEach(([k,ki,y])=>{y=Math.min(y,prev-22);prev=y;txt(ctx,k,x0+w+12,y,16,cols[ki],'left',true);});};
K.ring=(ctx,s,st)=>{const cx=W/2-120,cy=210,r=130;ctx.strokeStyle='#64748b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
  (st.points||[]).forEach(([lab,ang,col])=>{const a=ang/360*2*Math.PI-Math.PI/2;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);ctx.beginPath();ctx.arc(x,y,14,0,7);ctx.fillStyle=col||C.acc;ctx.fill();txt(ctx,lab,x+(Math.cos(a)>0?22:-22),y,15,C.ink,Math.cos(a)>0?'left':'right',true);});
  (st.keys||[]).forEach(([lab,ang])=>{const a=ang/360*2*Math.PI-Math.PI/2;const x=cx+(r-34)*Math.cos(a),y=cy+(r-34)*Math.sin(a);rr(x-18,y-12,36,24,6,C.hl,null,ctx);txt(ctx,lab,x,y,13,'#0f172a','center',true);});
  if(st.side)Object.entries(st.side).forEach(([k,v],i)=>txt(ctx,k+': '+v,W-300,120+i*28,18,C.ink));note(ctx,st.note);};
K.flow=(ctx,s,st,p)=>{const N=s.nodes;(s.edges||[]).forEach(([a,b])=>{const A=N[a],B=N[b];arrow(ctx,A[1]+60,A[2],B[1]-62,B[2],'#64748b');});
  N.forEach((n,i)=>box(ctx,n[1]-60,n[2]-24,120,48,n[0],(st.hl||[]).includes(i)?'hl':(st.bad||[]).includes(i)?'bad':''));
  if(st.dot!=null){const [a,b]=st.dot;const A=N[a],B=N[b];const x=A[1]+(B[1]-A[1])*p,y=A[2]+(B[2]-A[2])*p;ctx.beginPath();ctx.arc(x,y,9,0,7);ctx.fillStyle=C.hl;ctx.fill();}note(ctx,st.note);};
function frameAt(lesson,t){let acc=0;for(let k=0;k<lesson.scenes.length;k++){const sc=lesson.scenes[k];const d=sc.dur;if(t<acc+d||k===lesson.scenes.length-1){return {k,sc,local:Math.max(0,t-acc),acc};}acc+=d;}}
function captionAt(sc,local){let a=0;for(const s of sc.sents){if(local<a+s.d)return s.text;a+=s.d;}return sc.sents.length?sc.sents[sc.sents.length-1].text:'';}
function draw(ctx,lesson,t){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);const f=frameAt(lesson,t);const sc=f.sc;const v=sc.v;
  const states=v.states||[{}];const nst=v.kind==='bullets'?v.items.length:v.kind==='chart'?5:v.kind==='analogy'?Math.max(1,(v.icons||[]).length):states.length;
  let pos=Math.min(0.9999,f.local/sc.dur)*nst;let si=Math.floor(pos);let p=pos-si;
  if(v.kind==='chart'||v.kind==='bullets'||v.kind==='analogy'){let a=0,k=0;for(;k<sc.sents.length-1;k++){if(f.local<a+sc.sents[k].d)break;a+=sc.sents[k].d;}
    si=v.kind==='chart'?k:Math.max(0,Math.min(nst-1,k-(sc.sents.length-nst)));p=0;}
  if(v.kind!=='title'){txt(ctx,lesson.title,20,24,15,C.mut,'left',true);if(v.title)txt(ctx,v.title,W/2,50,22,'#f8fafc','center',true);}
  (K[v.kind]||K.title)(ctx,v,states[Math.min(si,states.length-1)]||{},p,si);
  const cap=captionAt(sc,f.local);if(cap){const L=wrap(ctx,cap,W-60,19);const hh=L.length*24+14;rr(14,H-hh-10,W-28,hh,8,C.cap,null,ctx);L.forEach((l,i)=>txt(ctx,l,W/2,H-hh-10+19+i*24,19,'#fff','center'));}
  const total=lesson.scenes.reduce((a,s)=>a+s.dur,0);ctx.fillStyle='#334155';ctx.fillRect(0,H-4,W,4);ctx.fillStyle=C.acc;ctx.fillRect(0,H-4,W*Math.min(1,t/total),4);}
window.LessonPlayer={W,H,draw,frameAt,captionAt,total:l=>l.scenes.reduce((a,s)=>a+s.dur,0)};
})();

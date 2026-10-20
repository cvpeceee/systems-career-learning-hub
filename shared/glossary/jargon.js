/* Jargon helper: first-use term chips (tap to expand), "Words to know" box per lesson, global Glossary.
   Non-invasive: uses the CSS Custom Highlight API, so app/React text nodes are never rewritten.
   Config: window.JARGON_ROOTS = CSS selector list of "lesson" containers (default below). */
(function(){
  if(window.__jargonLoaded) return; window.__jargonLoaded=1;
  var G=(window.SHARED_GLOSSARY||[]).slice(), BY={};
  G.forEach(function(g){BY[g.t.toLowerCase()]=g;});
  var ROOTS=window.JARGON_ROOTS||'.lesson-article,.sim-card,.drill,#app,.view.active,#detail,main';
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');}
  var acr=[],words=[];
  G.slice().sort(function(a,b){return b.t.length-a.t.length;}).forEach(function(g){
    var e=esc(g.t); (/^[a-z]/.test(g.t)?words:acr).push(e);
  });
  var RXA=new RegExp('(^|[^A-Za-z0-9_])('+acr.join('|')+')(s)?(?![A-Za-z0-9_])','g');
  var RXW=words.length?new RegExp('(^|[^A-Za-z0-9_])('+words.join('|')+')(s|es)?(?![A-Za-z0-9_])','gi'):null;
  var SKIP={SCRIPT:1,STYLE:1,CODE:1,PRE:1,TEXTAREA:1,INPUT:1,SELECT:1,BUTTON:1,SVG:1,svg:1,KBD:1,NOSCRIPT:1};
  var css=document.createElement('style');
  css.textContent='::highlight(jg){background-color:rgba(250,204,21,.22);text-decoration:underline dotted #f59e0b 2px;text-underline-offset:3px;cursor:help}'+
  '.jg-pop{position:absolute;z-index:99999;max-width:min(360px,92vw);background:#0f172a;color:#e2e8f0;border:1px solid #f59e0b;border-radius:10px;padding:10px 12px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}'+
  '.jg-pop b{color:#fbbf24}.jg-pop .an{margin-top:6px;color:#a5f3fc}.jg-pop .x{float:right;cursor:pointer;color:#94a3b8;margin-left:8px}'+
  '.jg-words{margin:0 0 14px;border:1px solid rgba(245,158,11,.55);border-radius:10px;background:rgba(245,158,11,.07);padding:8px 12px;font:14px/1.45 system-ui,sans-serif;color:inherit}'+
  '.jg-words summary{cursor:pointer;font-weight:700;color:#f59e0b}.jg-words ul{margin:6px 0 2px;padding-left:18px}.jg-words li{margin:3px 0}.jg-words .an{opacity:.8;font-style:italic}'+
  '.jg-chip{display:inline-block;border:1px solid #f59e0b;color:#f59e0b;border-radius:999px;padding:0 8px;margin:0 4px 0 0;font-weight:700;font-size:12px;cursor:pointer;background:transparent}'+
  '#jg-btn{position:fixed;left:10px;bottom:10px;z-index:99998;background:#f59e0b;color:#111;border:0;border-radius:999px;padding:8px 14px;font:700 14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}'+
  '#jg-modal{position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.75);display:none}#jg-modal .box{position:absolute;inset:5% 5%;max-width:760px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:14px;display:flex;flex-direction:column;font:14px/1.45 system-ui,sans-serif}'+
  '#jg-modal input{padding:8px;border-radius:8px;border:1px solid #475569;background:#020617;color:#e2e8f0;margin:8px 0}#jg-modal .list{overflow:auto;flex:1}#jg-modal .it{padding:6px 0;border-bottom:1px solid #1e293b}#jg-modal .it b{color:#fbbf24}#jg-modal .an{color:#a5f3fc}';
  document.head.appendChild(css);
  var hl=(window.CSS&&CSS.highlights&&window.Highlight)?new Highlight():null; if(hl) CSS.highlights.set('jg',hl);
  var RANGES=[];   // {range, g}
  function lookup(t){return BY[t.toLowerCase()]||BY[t.toLowerCase().replace(/e?s$/,'')]||BY[t.replace(/s$/,'').toLowerCase()];}
  function textNodes(root){var out=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      for(var p=n.parentNode;p&&p!==root.parentNode;p=p.parentNode){ if(SKIP[p.nodeName]||(p.classList&&(p.classList.contains('jg-words')||p.classList.contains('jg-pop')))) return 2; }
      return n.nodeValue.trim()?1:2;}});
    while(w.nextNode()) out.push(w.currentNode); return out;}
  function scan(root){
    var seen={},found=[];
    textNodes(root).forEach(function(n){
      var s=n.nodeValue;
      [RXA,RXW].forEach(function(rx){ if(!rx) return; rx.lastIndex=0; var m;
        while((m=rx.exec(s))){ var term=m[2], g=lookup(term); if(!g) continue; var k=g.t.toLowerCase(); if(seen[k]) continue; seen[k]=1;
          var st=m.index+m[1].length, r=document.createRange(); r.setStart(n,st); r.setEnd(n,st+term.length+(m[3]||'').length);
          RANGES.push({range:r,g:g}); if(hl) hl.add(r); found.push(g); }
      });
    });
    return found;
  }
  function wordsBox(root,found){
    var old=root.querySelector(':scope > .jg-words'); if(old) old.remove();
    if(found.length<1) return;
    var d=document.createElement('details'); d.className='jg-words'; d.open=window.innerWidth>700||found.length<=4;
    d.innerHTML='<summary>📖 Words to know in this section ('+found.length+') — tap a highlighted word anywhere for its meaning</summary><ul>'+
      found.slice(0,40).map(function(g){return '<li><b>'+g.t+'</b>: '+g.m+' <span class="an">Like: '+g.a+'</span></li>';}).join('')+'</ul>';
    root.insertBefore(d,root.firstChild);
  }
  var pop=null;
  function closePop(){ if(pop){pop.remove();pop=null;} }
  function showPop(g,x,y){ closePop(); pop=document.createElement('div'); pop.className='jg-pop';
    pop.innerHTML='<span class="x">✕</span><b>'+g.t+'</b> — '+g.m+'<div class="an">💡 Like: '+g.a+'</div>';
    document.body.appendChild(pop); var w=pop.offsetWidth; pop.style.left=Math.max(6,Math.min(x-w/2,window.scrollX+document.documentElement.clientWidth-w-6))+'px'; pop.style.top=(y+14)+'px';
    pop.querySelector('.x').onclick=closePop; }
  document.addEventListener('click',function(e){
    if(pop&&pop.contains(e.target)) return;
    var t=e.target.closest&&e.target.closest('.jg-chip'); if(t){var g=lookup(t.dataset.t); if(g) showPop(g,e.pageX,e.pageY); return;}
    var cr=document.caretRangeFromPoint?document.caretRangeFromPoint(e.clientX,e.clientY):null;
    if(cr){ for(var i=0;i<RANGES.length;i++){ var r=RANGES[i].range; try{ if(r.startContainer===cr.startContainer&&cr.startOffset>=r.startOffset&&cr.startOffset<=r.endOffset){ showPop(RANGES[i].g,e.pageX,e.pageY); return; } }catch(_){} } }
    closePop();
  },true);
  var busy=false,timer=null,sigs=new WeakMap();
  function run(){ if(busy) return; busy=true; obs.disconnect();
    try{ RANGES=RANGES.filter(function(o){return o.range.startContainer.isConnected;}); if(hl){hl.clear(); RANGES.forEach(function(o){hl.add(o.range);});}
      var roots=[].slice.call(document.querySelectorAll(ROOTS)).filter(function(r){return r.offsetParent!==null||r===document.body;});
      roots=roots.filter(function(r){return !roots.some(function(o){return o!==r&&o.contains(r)&&!/^(MAIN|BODY)$/.test(o.nodeName)&&o.id!=='app';});});
      roots.forEach(function(r){ var sig=(r.innerText||'').length+':'+(r.innerText||'').slice(0,80); if(sigs.get(r)===sig&&r.querySelector(':scope > .jg-words')) return;
        RANGES=RANGES.filter(function(o){return !r.contains(o.range.startContainer);}); if(hl){hl.clear(); RANGES.forEach(function(o){hl.add(o.range);});}
        var f=scan(r); wordsBox(r,f); sigs.set(r,(r.innerText||'').length+':'+(r.innerText||'').slice(0,80)); });
    }finally{ busy=false; obs.observe(document.body,{childList:true,subtree:true,characterData:true}); }
  }
  var obs=new MutationObserver(function(){ clearTimeout(timer); timer=setTimeout(run,200); });
  function glossaryUI(){
    var b=document.createElement('button'); b.id='jg-btn'; b.textContent='📖 Glossary'; document.body.appendChild(b);
    var m=document.createElement('div'); m.id='jg-modal'; m.innerHTML='<div class="box"><div><b style="font-size:18px">Glossary</b> <span style="opacity:.7">('+G.length+' terms, same definitions in every course)</span><span class="x" style="float:right;cursor:pointer;font-size:20px">✕</span></div><input placeholder="Search a term, e.g. DMA, mutex, UVC"><div class="list"></div></div>';
    document.body.appendChild(m); var list=m.querySelector('.list'), inp=m.querySelector('input');
    function draw(q){ q=(q||'').toLowerCase(); list.innerHTML=G.filter(function(g){return !q||g.t.toLowerCase().indexOf(q)>=0||g.m.toLowerCase().indexOf(q)>=0;}).sort(function(a,b){return a.t.localeCompare(b.t);})
      .map(function(g){return '<div class="it"><b>'+g.t+'</b> — '+g.m+'<div class="an">💡 Like: '+g.a+'</div></div>';}).join(''); }
    b.onclick=function(){m.style.display='block'; draw(inp.value); inp.focus();};
    m.querySelector('.x').onclick=function(){m.style.display='none';}; m.onclick=function(e){if(e.target===m) m.style.display='none';}; inp.oninput=function(){draw(inp.value);};
  }
  function start(){ glossaryUI(); run(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.__jargonRun=run;
})();

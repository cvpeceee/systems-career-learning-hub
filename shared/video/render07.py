"""Narrated lesson videos: Piper TTS per sentence -> exact timings -> PIL frames (same timings) -> ffmpeg.
Captions and animation steps are driven by the SAME sentence timeline, so they cannot drift."""
import os, sys, json, wave, hashlib, subprocess, textwrap, importlib
from PIL import Image, ImageDraw, ImageFont
IP='/workspace/ip'; PIPER=IP+'/venv/bin/piper'; VOICE=IP+'/voices/en_US-lessac-medium.onnx'
W,H,FPS=854,480,10; GAP=0.40; SCENE_GAP=0.8; LS='1.08'
HERE=os.path.dirname(os.path.abspath(__file__)); CACHE='/workspace/.vcache'; os.makedirs(CACHE,exist_ok=True)
OUTDIR=os.environ.get('OUTDIR','/tmp/vout'); os.makedirs(OUTDIR,exist_ok=True)
FD='/usr/share/fonts/truetype/dejavu/'
def F(n,b=False,m=False): return ImageFont.truetype(FD+('DejaVuSansMono-Bold.ttf' if m and b else 'DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),n)
fT,fH,fB,fS,fM,fC,fX=F(30,True),F(20,True),F(16),F(13),F(13,m=True),F(17,True),F(12)
BG=(11,18,32);PAN=(22,34,59);INK=(226,232,240);MUT=(148,163,184);ACC=(56,189,248);HL=(245,158,11);OK=(34,197,94);VIO=(167,139,250)
def say(t,ls=None):
    ls=ls or LS; h=hashlib.md5((ls+t).encode()).hexdigest()[:16]; p=f'{CACHE}/{h}.wav'
    if not os.path.exists(p): subprocess.run([PIPER,'-m',VOICE,'--length_scale',ls,'-f',p],input=t.encode(),check=True,capture_output=True)
    return p
def mix(a,b,p): return tuple(int(a[i]+(b[i]-a[i])*p) for i in range(3))
def wrap(d,txt,font,maxw):
    out=[]
    for para in txt.split('\n'):
        line=''
        for w in para.split(' '):
            t=(line+' '+w).strip()
            if d.textlength(t,font=font)<=maxw: line=t
            else: out.append(line); line=w
        out.append(line)
    return out
def header(d,v,title):
    d.rectangle([0,0,W,34],fill=(15,23,42)); d.text((12,8),v['short'],font=fS,fill=ACC); d.text((W-12,8),title,font=fS,fill=MUT,anchor='ra')
def caption(d,txt):
    lines=wrap(d,txt,fC,W-60)[:3]; h=len(lines)*22+12; y0=H-h-6
    d.rounded_rectangle([20,y0,W-20,H-6],10,fill=(2,6,23)); 
    for i,l in enumerate(lines): d.text((W//2,y0+6+i*22),l,font=fC,fill=(255,255,255),anchor='ma')

def icon(d,name,cx,cy,s,col,a=1.0):
    c=mix(BG,col,a); w=max(2,int(s/14)); f=mix(BG,(30,41,59),a)
    if name=='laptop': d.rounded_rectangle([cx-s*.42,cy-s*.32,cx+s*.42,cy+s*.18],5,fill=f,outline=c,width=w); d.rectangle([cx-s*.34,cy-s*.25,cx+s*.34,cy+s*.11],fill=mix(BG,(14,116,144),a)); d.polygon([(cx-s*.52,cy+s*.22),(cx+s*.52,cy+s*.22),(cx+s*.42,cy+s*.32),(cx-s*.42,cy+s*.32)],fill=c)
    elif name=='bar': d.rounded_rectangle([cx-s*.5,cy-s*.14,cx+s*.5,cy+s*.14],int(s*.14),fill=f,outline=c,width=w); [d.ellipse([cx+o-s*.07,cy-s*.07,cx+o+s*.07,cy+s*.07],fill=c) for o in (-s*.3,0,s*.3)]; d.ellipse([cx-s*.03,cy-s*.03,cx+s*.03,cy+s*.03],fill=mix(BG,(2,6,23),a))
    elif name=='chip': d.rectangle([cx-s*.3,cy-s*.3,cx+s*.3,cy+s*.3],fill=f,outline=c,width=w); [d.line([cx+o,cy-s*.42,cx+o,cy-s*.3],fill=c,width=w) or d.line([cx+o,cy+s*.3,cx+o,cy+s*.42],fill=c,width=w) or d.line([cx-s*.42,cy+o,cx-s*.3,cy+o],fill=c,width=w) or d.line([cx+s*.3,cy+o,cx+s*.42,cy+o],fill=c,width=w) for o in (-s*.18,0,s*.18)]
    elif name=='cable': d.line([cx-s*.45,cy,cx-s*.15,cy-s*.15,cx+s*.15,cy+s*.15,cx+s*.45,cy],fill=c,width=w*2); d.rectangle([cx-s*.5,cy-s*.08,cx-s*.38,cy+s*.08],fill=c); d.rectangle([cx+s*.38,cy-s*.08,cx+s*.5,cy+s*.08],fill=c)
    elif name=='person': d.ellipse([cx-s*.14,cy-s*.42,cx+s*.14,cy-s*.14],fill=c); d.pieslice([cx-s*.3,cy-s*.08,cx+s*.3,cy+s*.5],180,360,fill=c)
    elif name=='screen': d.rectangle([cx-s*.45,cy-s*.32,cx+s*.45,cy+s*.22],fill=f,outline=c,width=w); d.line([cx,cy+s*.22,cx,cy+s*.36],fill=c,width=w); d.line([cx-s*.2,cy+s*.38,cx+s*.2,cy+s*.38],fill=c,width=w)
    elif name=='mic': d.rounded_rectangle([cx-s*.12,cy-s*.42,cx+s*.12,cy+s*.05],int(s*.12),fill=c); d.arc([cx-s*.22,cy-s*.2,cx+s*.22,cy+s*.18],0,180,fill=c,width=w); d.line([cx,cy+s*.18,cx,cy+s*.36],fill=c,width=w)
    elif name=='speaker': d.polygon([(cx-s*.35,cy-s*.12),(cx-s*.15,cy-s*.12),(cx+s*.05,cy-s*.32),(cx+s*.05,cy+s*.32),(cx-s*.15,cy+s*.12),(cx-s*.35,cy+s*.12)],fill=c); [d.arc([cx-s*r,cy-s*r,cx+s*r,cy+s*r],-40,40,fill=c,width=w) for r in (.2,.32)]
    elif name=='lock': d.arc([cx-s*.2,cy-s*.42,cx+s*.2,cy],180,360,fill=c,width=w*2); d.rounded_rectangle([cx-s*.3,cy-s*.15,cx+s*.3,cy+s*.35],5,fill=c)
    elif name=='gear': d.ellipse([cx-s*.3,cy-s*.3,cx+s*.3,cy+s*.3],outline=c,width=w*2); [d.line([cx+s*.3*dx,cy+s*.3*dy,cx+s*.42*dx,cy+s*.42*dy],fill=c,width=w*2) for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(.7,.7),(-.7,.7),(.7,-.7),(-.7,-.7))]; d.ellipse([cx-s*.1,cy-s*.1,cx+s*.1,cy+s*.1],fill=c)
    elif name=='bug': d.ellipse([cx-s*.2,cy-s*.25,cx+s*.2,cy+s*.3],fill=c); d.ellipse([cx-s*.12,cy-s*.42,cx+s*.12,cy-s*.2],fill=c); [d.line([cx-s*.38,cy+o,cx+s*.38,cy+o],fill=c,width=w) for o in (-s*.08,s*.08,s*.22)]
    elif name=='chart': d.line([cx-s*.4,cy-s*.4,cx-s*.4,cy+s*.35,cx+s*.4,cy+s*.35],fill=c,width=w); d.line([cx-s*.35,cy+s*.2,cx-s*.1,cy-s*.05,cx+s*.08,cy+s*.08,cx+s*.35,cy-s*.3],fill=c,width=w*2)
    elif name=='cloud': [d.ellipse([cx+x-s*r,cy+y-s*r,cx+x+s*r,cy+y+s*r],fill=c) for x,y,r in ((-s*.2,s*.05,.18),(s*.05,-s*.08,.25),(s*.25,s*.07,.17))]; d.rectangle([cx-s*.2,cy+s*.05,cx+s*.25,cy+s*.24],fill=c)
    elif name=='doc': d.polygon([(cx-s*.3,cy-s*.4),(cx+s*.15,cy-s*.4),(cx+s*.3,cy-s*.25),(cx+s*.3,cy+s*.4),(cx-s*.3,cy+s*.4)],fill=f,outline=c); [d.line([cx-s*.2,cy+o,cx+s*.2,cy+o],fill=c,width=w) for o in (-s*.15,0,s*.15)]
    elif name=='clock': d.ellipse([cx-s*.38,cy-s*.38,cx+s*.38,cy+s*.38],fill=f,outline=c,width=w); d.line([cx,cy,cx,cy-s*.25],fill=c,width=w); d.line([cx,cy,cx+s*.18,cy+s*.05],fill=c,width=w)
    elif name=='bolt': d.polygon([(cx+s*.05,cy-s*.45),(cx-s*.25,cy+s*.05),(cx-s*.02,cy+s*.05),(cx-s*.08,cy+s*.45),(cx+s*.25,cy-s*.08),(cx+s*.02,cy-s*.08)],fill=c)
    elif name=='box': d.rectangle([cx-s*.35,cy-s*.25,cx+s*.35,cy+s*.35],fill=f,outline=c,width=w); d.line([cx-s*.35,cy-s*.05,cx+s*.35,cy-s*.05],fill=c,width=w)
    elif name=='wave': d.line([(cx-s*.45+i*s*.09,cy+(s*.2 if i%2 else -s*.2)) for i in range(11)],fill=c,width=w*2)
    elif name=='eye': d.ellipse([cx-s*.42,cy-s*.22,cx+s*.42,cy+s*.22],outline=c,width=w); d.ellipse([cx-s*.14,cy-s*.14,cx+s*.14,cy+s*.14],fill=c)
    elif name=='board': d.rectangle([cx-s*.42,cy-s*.3,cx+s*.42,cy+s*.3],fill=mix(BG,(20,83,45),a),outline=c,width=w); d.rectangle([cx-s*.12,cy-s*.12,cx+s*.12,cy+s*.12],fill=c); [d.ellipse([cx+x-s*.04,cy+y-s*.04,cx+x+s*.04,cy+y+s*.04],fill=c) for x,y in ((-s*.32,-s*.2),(s*.32,-s*.2),(-s*.32,s*.2),(s*.32,s*.2))]
    elif name=='phone': d.rounded_rectangle([cx-s*.2,cy-s*.4,cx+s*.2,cy+s*.4],6,fill=f,outline=c,width=w); d.line([cx-s*.06,cy+s*.32,cx+s*.06,cy+s*.32],fill=c,width=w)
    else: d.ellipse([cx-s*.3,cy-s*.3,cx+s*.3,cy+s*.3],outline=c,width=w)
def icons_scene(d,sc,step,p,top,bottom):
    items=sc['items']; n=len(items); per=min(n,5); rows=(n+per-1)//per; cw=(W-40)/per; rh=(bottom-top-40)/rows; sz=min(70,rh*.5)
    d.text((24,top),sc['title'],font=fH,fill=ACC if sc['k']!='hook' else HL)
    pos=[]
    for i,(ic,lab,*sub) in enumerate(items):
        r=i//per; cidx=i%per if r%2==0 or not sc.get('snake') else per-1-i%per
        cx=20+cw*cidx+cw/2; cy=top+40+rh*r+sz*.6; pos.append((cx,cy))
    for i in range(n-1):
        if sc.get('chain') and i+1<=step:
            (x1,y1),(x2,y2)=pos[i],pos[i+1]; a=p if i+1==step else 1
            sg=1 if x2>=x1 else -1
            if abs(y1-y2)<1: d.line([x1+sz*.6*sg,y1,x2-sz*.6*sg,y2],fill=mix(BG,HL,a),width=3); d.polygon([(x2-sz*.6*sg,y2),(x2-sz*.6*sg-9*sg,y2-5),(x2-sz*.6*sg-9*sg,y2+5)],fill=mix(BG,HL,a))
            else: d.line([x1,y1+sz*.62+40,x2,y2-sz*.62],fill=mix(BG,HL,a),width=3)
    for i,(ic,lab,*sub) in enumerate(items):
        on=i<=step; cur=i==step; a=(p if cur else 1) if on else .18; cx,cy=pos[i]
        if cur: d.ellipse([cx-sz*.62,cy-sz*.62,cx+sz*.62,cy+sz*.62],outline=mix(BG,HL,p),width=3)
        icon(d,ic,cx,cy,sz,ACC if not cur else HL,a)
        for j,l in enumerate(wrap(d,lab,F(14,True),cw-8)[:2]): d.text((cx,cy+sz*.68+j*17),l,font=F(14,True),fill=mix(BG,INK,a),anchor='ma')
        if sub and on: 
            for j,l in enumerate(wrap(d,sub[0],fX,cw-8)[:2]): d.text((cx,cy+sz*.68+36+j*14),l,font=fX,fill=mix(BG,MUT,a),anchor='ma')
def ask_scene(d,sc,step,p,top,bottom,pause):
    d.text((W//2,top+6),'Your turn: pause and think',font=fH,fill=VIO,anchor='ma')
    d.rounded_rectangle([60,top+44,W-60,top+170],12,fill=(46,16,101),outline=VIO,width=2)
    for j,l in enumerate(wrap(d,sc['q'],F(19,True),W-160)[:4]): d.text((W//2,top+62+j*26),l,font=F(19,True),fill=INK,anchor='ma')
    if pause is not None:
        cx,cy=W//2,top+240; d.ellipse([cx-40,cy-40,cx+40,cy+40],outline=(51,65,85),width=6)
        d.arc([cx-40,cy-40,cx+40,cy+40],-90,-90+360*(1-pause[0]/pause[1]),fill=VIO,width=6); d.text((cx,cy),str(max(1,int(pause[1]-pause[0]+.999))),font=F(26,True),fill=INK,anchor='mm')
    elif step>=1:
        d.rounded_rectangle([60,top+190,W-60,bottom],12,fill=mix(BG,(20,83,45),p),outline=mix(BG,OK,p))
        for j,l in enumerate(wrap(d,sc['a'],fB,W-150)[:5]): d.text((80,top+202+j*21),l,font=fB,fill=mix(BG,INK,p))
def term_card(d,key,p):
    from glossary import BY
    g=BY[key]; e=1-(1-p)**3; y0=int(96+(1-e)*60); x0,x1=70,W-70
    d.rounded_rectangle([x0+4,y0+6,x1+4,y0+214],14,fill=(2,6,23))
    d.rounded_rectangle([x0,y0,x1,y0+208],14,fill=mix(BG,(28,25,23),e),outline=mix(BG,HL,e),width=3)
    d.rounded_rectangle([x0+16,y0-14,x0+150,y0+12],8,fill=mix(BG,HL,e)); d.text((x0+83,y0-1),'NEW WORD',font=F(13,True),fill=(28,25,23),anchor='mm')
    d.text((x0+20,y0+22),g['t'],font=F(24,True),fill=mix(BG,HL,e))
    y=y0+58
    for l in wrap(d,g['mean'],fB,x1-x0-40)[:3]: d.text((x0+20,y),l,font=fB,fill=mix(BG,INK,e)); y+=20
    y+=6; d.text((x0+20,y),'Like:',font=F(15,True),fill=mix(BG,OK,e))
    for l in wrap(d,g['ana'],fB,x1-x0-90)[:3]: d.text((x0+68,y),l,font=fB,fill=mix(BG,(187,247,208),e)); y+=20

def draw(v,sc,step,p,cap,card=None,pause=None):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im); k=sc['k']; header(d,v,sc.get('title',''))
    top=46; bottom=H-90
    if k in('hook','icons'): icons_scene(d,sc,step,p,top,bottom)
    elif k=='ask': ask_scene(d,sc,step,p,top,bottom,pause)
    elif k=='title':
        d.text((W//2,150),v['title'],font=fT,fill=INK,anchor='mm') if d.textlength(v['title'],font=fT)<W-40 else [d.text((W//2,130+i*36),l,font=fT,fill=INK,anchor='mm') for i,l in enumerate(wrap(d,v['title'],fT,W-60))]
        d.text((W//2,225),sc.get('sub','Poly Firmware Academy'),font=fH,fill=ACC,anchor='mm')
        for i,l in enumerate(sc.get('items',[])[:step+1]): d.text((W//2,270+i*26),l,font=fB,fill=mix(BG,MUT,p if i==step else 1),anchor='mm')
    elif k in('analogy','bullets','recap'):
        col={'analogy':(23,37,84),'bullets':PAN,'recap':(20,83,45)}[k]
        d.text((24,top),sc['title'],font=fH,fill=ACC if k!='recap' else OK); y=top+34
        for i,it in enumerate(sc['items'][:step+1]):
            a=p if i==step else 1; ls=wrap(d,it,fB,W-110); hh=len(ls)*21+14
            if y+hh>bottom: break
            d.rounded_rectangle([24,y,W-24,y+hh],8,fill=mix(BG,col,a),outline=mix(BG,HL if i==step else (51,65,85),a))
            d.text((38,y+7),'✓' if k=='recap' else '•',font=fB,fill=mix(BG,OK if k=='recap' else HL,a))
            for j,l in enumerate(ls): d.text((58,y+7+j*21),l,font=fB,fill=mix(BG,INK,a))
            y+=hh+8
    elif k=='terms':
        d.text((24,top),(sc.get('title') or 'Words to know'),font=fH,fill=HL); y=top+34
        for i,(t,df) in enumerate(sc['items'][:step+1]):
            a=p if i==step else 1; ls=wrap(d,df,fB,W-80); hh=24+len(ls)*20+8
            if y+hh>bottom: break
            d.rounded_rectangle([24,y,W-24,y+hh],8,fill=mix(BG,(28,25,23),a),outline=mix(BG,HL if i==step else (68,64,60),a))
            d.text((36,y+5),t,font=F(17,True),fill=mix(BG,HL,a))
            for j,l in enumerate(ls): d.text((36,y+27+j*20),l,font=fB,fill=mix(BG,INK,a))
            y+=hh+6
    elif k=='seq':
        lanes=sc['lanes']; msgs=sc['msgs']; n=len(lanes); lw=(W-20)/n
        d.text((24,top),sc['title'],font=fH,fill=ACC)
        for i,nm in enumerate(lanes):
            x=10+lw*i+lw/2; d.rounded_rectangle([x-lw/2+6,top+30,x+lw/2-6,top+58],7,fill=PAN,outline=ACC); d.text((x,top+44),nm,font=fS,fill=INK,anchor='mm')
            d.line([x,top+58,x,bottom],fill=(51,65,85),width=1)
        rows=bottom-(top+66); per=30; first=max(0,step-int((rows-12)/per)+1)
        for j in range(first,min(step+1,len(msgs))):
            f,t,txt=msgs[j]; y=top+84+(j-first)*per; x1=10+lw*f+lw/2; x2=10+lw*t+lw/2; cur=j==step; c=HL if cur else (180,140,60)
            if f==t:
                d.line([x1,y-6,x1+34,y-6,x1+34,y+6,x1,y+6],fill=c,width=2); d.text((x1+40,y),txt,font=fS,fill=INK if cur else MUT,anchor='lm')
            else:
                d.line([x1,y,x2,y],fill=c,width=3 if cur else 2); s=1 if x2>x1 else -1; d.polygon([(x2,y),(x2-9*s,y-5),(x2-9*s,y+5)],fill=c)
                d.text(((x1+x2)/2,y-4),txt,font=fS,fill=INK if cur else MUT,anchor='mb')
                if cur and p<1: xx=x1+(x2-x1)*p; d.ellipse([xx-7,y-7,xx+7,y+7],fill=OK)
    elif k=='flow':
        items=sc['items']; subs=sc.get('subs',['']*len(items)); n=len(items)
        d.text((24,top),sc['title'],font=fH,fill=ACC); bh=min(40,(bottom-top-36)/n-6); y=top+34
        for i,it in enumerate(items):
            on=i<=step; cur=i==step; a=(p if cur else 1) if on else .25
            d.rounded_rectangle([60,y,W-60,y+bh],8,fill=mix(BG,PAN,a),outline=mix(BG,HL if cur else ACC,a),width=3 if cur else 1)
            d.text((76,y+bh/2),f'{i+1}. {it}',font=F(15,True) if bh>=30 else fS,fill=mix(BG,INK,a),anchor='lm')
            if on and subs[i]: d.text((W-74,y+bh/2),subs[i],font=fS,fill=mix(BG,HL if cur else MUT,a),anchor='rm')
            if i<n-1: d.line([W//2,y+bh,W//2,y+bh+6],fill=(71,85,105),width=2)
            y+=bh+6
    elif k=='code':
        d.text((24,top),sc['title'],font=fH,fill=ACC); lines=sc['code'].expandtabs(4).split('\n'); hl=sc['hl'][min(step,len(sc['hl'])-1)]
        d.rounded_rectangle([20,top+30,W-20,bottom],8,fill=(2,6,23),outline=(38,52,79)); lh=17; maxl=int((bottom-top-44)/lh)
        c0=0
        if hl and max(hl)>=maxl: c0=min(max(hl)-maxl+3,len(lines)-maxl)
        for i,l in enumerate(lines[c0:c0+maxl]):
            idx=c0+i; y=top+38+i*lh
            if idx in hl: d.rectangle([22,y-1,W-22,y+lh-2],fill=mix((2,6,23),(66,52,16),p))
            d.text((30,y),l[:100],font=fM,fill=(253,230,138) if idx in hl else (203,213,225))
    if card: term_card(d,card[0],card[1])
    caption(d,cap); return im.tobytes()
def build(v):
    vid=v['id']; frames=[]; audio=b''; rate=22050; sw=2; t=0.0; cues=[]
    for sc in v['scenes']:
        n_items={'seq':len(sc.get('msgs',[])),'flow':len(sc.get('items',[])),'code':len(sc.get('hl',[]))}.get(sc['k'],len(sc.get('items',[])))
        base=[x if isinstance(x,str) else x['s'] for x in sc['say'] if isinstance(x,str) or ('card' not in x and 'pause' not in x)]; base_n=len(base)
        intro = sc['k'] not in ('title','code','ask') and base_n==n_items+1
        if sc['k']=='code' and base_n!=n_items: print('WARN code hl/say mismatch',vid,sc['title'],base_n,n_items)
        if sc['k'] not in ('title','code','ask') and base_n not in (n_items,n_items+1) and not any(x.startswith('+') for x in base): print('WARN count',vid,sc['title'],base_n,n_items)
        st=-1
        step=-2 if intro else -1; card=None
        for i,s in enumerate(sc['say']):
            e=s if isinstance(s,dict) else dict(s=s)
            if 'pause' in e:
                n=e['pause']; audio+=b'\x00'*(int(n*rate)*sw); frames.append((sc,st,False,'(pause)',n,None,('pause',n))); t+=n; continue
            s=e['s']; adv=not s.startswith('+') and 'card' not in e; s=s.lstrip('+ ').strip()
            if adv or step<0: step+=1
            if intro and i==0: step=-1
            if 'card' in e: card=e['card']
            elif adv: card=None
            nmax={'seq':len(sc.get('msgs',[])),'flow':len(sc.get('items',[])),'code':len(sc.get('hl',[1])),'title':max(1,len(sc.get('items',[])))}.get(sc['k'],len(sc.get('items',[1])))
            st=min(step,max(0,nmax-1)) if step>=0 else -1
            p_=say(e.get('sp',s),e.get('ls'))
            with wave.open(p_) as w: rate=rate or w.getframerate(); data=w.readframes(w.getnframes())
            gap=e.get('gap',{'hook':0.25,'ask':0.3}.get(sc['k'],GAP))
            dd=len(data)/(rate*sw); pause=gap+(SCENE_GAP if i==len(sc['say'])-1 else 0)
            audio+=data+b'\x00'*(int(pause*rate)*sw); cues.append((t,t+dd,s)); frames.append((sc,st,adv or i==0 or e.get('newcard',False),s,dd+pause,card,e.get('newcard',False))); t+=dd+pause
    wav=f'{OUTDIR}/{vid}.wav'
    with wave.open(wav,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(audio)
    def ts(x): return f'{int(x//3600):02d}:{int(x%3600//60):02d}:{x%60:06.3f}'
    open(f'{OUTDIR}/{vid}.vtt','w').write('WEBVTT\n\n'+'\n\n'.join(f'{ts(a)} --> {ts(b)}\n{s}' for a,b,s in cues)+'\n')
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',wav,
        '-c:v','libx264','-preset','medium','-crf','30','-tune','stillimage','-pix_fmt','yuv420p','-c:a','aac','-b:a','48k','-ac','1','-shortest','-movflags','+faststart',f'{OUTDIR}/{vid}.mp4'],stdin=subprocess.PIPE)
    tot=0; acc=0.0
    for sc,st,anim,s,dur,card,extra in frames:
        acc+=dur; n=round(acc*FPS)-tot; tot+=n; last=None
        for f in range(n):
            if isinstance(extra,tuple):
                last=draw(v,sc,0,1,'Pause the video and answer out loud. Then press play.',None,(f/FPS,extra[1])); ff.stdin.write(last); continue
            p=min(1,(f/FPS)/0.8) if anim else 1
            cp=min(1,(f/FPS)/0.5) if extra is True else 1
            if p<1 or cp<1 or last is None: last=draw(v,sc,st,p,s,(card,cp) if card else None)
            ff.stdin.write(last)
    ff.stdin.close(); ff.wait(); os.remove(wav)
    print(vid,f'{t:.1f}s',flush=True); return t
if __name__=='__main__':
    sys.path.insert(0,HERE); sys.path.insert(0,os.path.dirname(HERE)); mods=sys.argv[2:]
    from engage import enhance
    only=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
    for m in mods:
        for v in importlib.import_module(m).V:
            if only and v['id'] not in only: continue
            build(enhance(v))

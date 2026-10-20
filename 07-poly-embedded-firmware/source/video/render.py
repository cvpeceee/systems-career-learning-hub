"""Narrated lesson videos: Piper TTS per sentence -> exact timings -> PIL frames (same timings) -> ffmpeg.
Captions and animation steps are driven by the SAME sentence timeline, so they cannot drift."""
import os, sys, json, wave, hashlib, subprocess, textwrap, importlib
from PIL import Image, ImageDraw, ImageFont
IP='/workspace/ip'; PIPER=IP+'/venv/bin/piper'; VOICE=IP+'/voices/en_US-lessac-medium.onnx'
W,H,FPS=854,480,10; GAP=0.40; SCENE_GAP=0.8; LS='1.08'
HERE=os.path.dirname(os.path.abspath(__file__)); CACHE=HERE+'/cache'; os.makedirs(CACHE,exist_ok=True)
OUTDIR=sys.argv[1]; os.makedirs(OUTDIR,exist_ok=True)
FD='/usr/share/fonts/truetype/dejavu/'
def F(n,b=False,m=False): return ImageFont.truetype(FD+('DejaVuSansMono-Bold.ttf' if m and b else 'DejaVuSansMono.ttf' if m else 'DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),n)
fT,fH,fB,fS,fM,fC,fX=F(30,True),F(20,True),F(16),F(13),F(13,m=True),F(17,True),F(12)
BG=(11,18,32);PAN=(22,34,59);INK=(226,232,240);MUT=(148,163,184);ACC=(56,189,248);HL=(245,158,11);OK=(34,197,94);VIO=(167,139,250)
def say(t):
    h=hashlib.md5((LS+t).encode()).hexdigest()[:16]; p=f'{CACHE}/{h}.wav'
    if not os.path.exists(p): subprocess.run([PIPER,'-m',VOICE,'--length_scale',LS,'-f',p],input=t.encode(),check=True,capture_output=True)
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
def draw(v,sc,step,p,cap):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im); k=sc['k']; header(d,v,sc.get('title',''))
    top=46; bottom=H-90
    if k=='title':
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
    caption(d,cap); return im.tobytes()
def build(v):
    vid=v['id']; frames=[]; audio=b''; rate=None; sw=2; t=0.0; cues=[]
    for sc in v['scenes']:
        n_items={'seq':len(sc.get('msgs',[])),'flow':len(sc.get('items',[])),'code':len(sc.get('hl',[]))}.get(sc['k'],len(sc.get('items',[])))
        intro = sc['k'] not in ('title','code') and len(sc['say'])==n_items+1
        if sc['k']=='code' and len(sc['say'])!=n_items: print('WARN code hl/say mismatch',vid,sc['title'],len(sc['say']),n_items)
        if sc['k'] not in ('title','code') and len(sc['say']) not in (n_items,n_items+1) and not any(x.startswith('+') for x in sc['say']): print('WARN count',vid,sc['title'],len(sc['say']),n_items)
        step=-2 if intro else -1
        for i,s in enumerate(sc['say']):
            adv=not s.startswith('+'); s=s.lstrip('+ ').strip()
            if adv or step<0: step+=1
            if intro and i==0: step=-1
            nmax={'seq':len(sc.get('msgs',[])),'flow':len(sc.get('items',[])),'code':len(sc.get('hl',[1])),'title':max(1,len(sc.get('items',[])))}.get(sc['k'],len(sc.get('items',[1])))
            st=min(step,max(0,nmax-1)) if step>=0 else -1
            p_=say(s)
            with wave.open(p_) as w: rate=rate or w.getframerate(); data=w.readframes(w.getnframes())
            dd=len(data)/(rate*sw); pause=GAP+(SCENE_GAP if i==len(sc['say'])-1 else 0)
            audio+=data+b'\x00'*(int(pause*rate)*sw); cues.append((t,t+dd,s)); frames.append((sc,st,adv or i==0,s,dd+pause)); t+=dd+pause
    wav=f'{OUTDIR}/{vid}.wav'
    with wave.open(wav,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(audio)
    def ts(x): return f'{int(x//3600):02d}:{int(x%3600//60):02d}:{x%60:06.3f}'
    open(f'{OUTDIR}/{vid}.vtt','w').write('WEBVTT\n\n'+'\n\n'.join(f'{ts(a)} --> {ts(b)}\n{s}' for a,b,s in cues)+'\n')
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',wav,
        '-c:v','libx264','-preset','medium','-crf','30','-tune','stillimage','-pix_fmt','yuv420p','-c:a','aac','-b:a','48k','-ac','1','-shortest','-movflags','+faststart',f'{OUTDIR}/{vid}.mp4'],stdin=subprocess.PIPE)
    tot=0; acc=0.0
    for sc,st,anim,s,dur in frames:
        acc+=dur; n=round(acc*FPS)-tot; tot+=n; last=None
        for f in range(n):
            p=min(1,(f/FPS)/0.8) if anim else 1
            if p<1 or last is None: last=draw(v,sc,st,p,s)
            ff.stdin.write(last)
    ff.stdin.close(); ff.wait(); os.remove(wav)
    print(vid,f'{t:.1f}s',flush=True); return t
if __name__=='__main__':
    sys.path.insert(0,HERE); mods=sys.argv[2:]
    for m in mods:
        for v in importlib.import_module(m).V: build(v)

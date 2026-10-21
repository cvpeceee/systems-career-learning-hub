"""Upgrade an existing lesson video: hook + 'words to know' term cards + pause-and-think (intro, synced renderer),
original animated body with term-card pop-ups at each term's first spoken mention, then recap + answer (outro).
Intro/outro use the sentence-timeline renderer copied from 07 (render07.py): caption and animation share one clock."""
import os,sys,re,json,subprocess,shutil
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.dirname(os.path.dirname(H))
sys.path.insert(0,H); os.environ.setdefault('OUTDIR','/workspace/.vwork')
import render07 as RD
from meta import M
from PIL import Image,ImageDraw
G=json.load(open(R+'/shared/glossary/glossary.json')); GL={g['t'].lower():g for g in G}
SPOKEN={'big-o':'Big-O'}
def ts2s(x): h,m,s=x.split(':'); return int(h)*3600+int(m)*60+float(s)
def s2ts(x): return f'{int(x//3600):02d}:{int(x%3600//60):02d}:{x%60:06.3f}'
def cues(vtt):
    out=[]; b=open(vtt).read().split('\n\n')
    for blk in b:
        ls=[l for l in blk.strip().split('\n') if l]; i=next((k for k,l in enumerate(ls) if '-->' in l),None)
        if i is None: continue
        a,bb=[ts2s(x.strip().split(' ')[0]) for x in ls[i].split('-->')]; out.append((a,bb,' '.join(ls[i+1:])))
    return out
def norm(t): return re.sub(r'\b((?:[A-Z] ){1,5}[A-Z])\b',lambda m:m.group(1).replace(' ',''),t)
def first_terms(cs):
    seen={}; 
    for a,b,t in cs:
        t=norm(t)
        for g in G:
            k=g['t']
            if k.lower() in seen: continue
            rx=r'(?<![A-Za-z0-9])'+re.escape(k)+r'(s|es)?(?![A-Za-z0-9])'
            if re.search(rx,t,0 if not k[0].islower() else re.I): seen[k.lower()]=(a,g)
    return sorted(seen.values(),key=lambda x:x[0])
def say_term(g): return re.sub(r'\b([A-Z]{2,5})\b',lambda m:' '.join(m.group(1)) if m.group(1) not in('RAID','NAND','CAN','RAM','ROM','DRAM','SQL','JSON','YAML','NUMA','SLAM','QEMU','CUDA','ASIC','MISRA') else m.group(1),g['t'])
def card(g,path):
    W=380; im=Image.new('RGBA',(W,10)); d=ImageDraw.Draw(im)
    ml=RD.wrap(d,g['m'],RD.fS,W-24)[:4]; al=RD.wrap(d,'Like: '+g['a'],RD.fS,W-24)[:2]; h=34+len(ml)*17+len(al)*17+10
    im=Image.new('RGBA',(W,h),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,W-1,h-1],10,fill=(28,25,23,235),outline=(245,158,11,255),width=2)
    d.text((12,7),'NEW TERM · '+g['t'],font=RD.F(15,True),fill=(251,191,36)); y=30
    for l in ml: d.text((12,y),l,font=RD.fS,fill=(241,245,249)); y+=17
    for l in al: d.text((12,y),l,font=RD.fS,fill=(165,243,252)); y+=17
    im.save(path)
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
def run(mp4,title_short):
    vid=os.path.basename(mp4)[:-4]; vtt=mp4[:-4]+'.vtt'; W=os.environ['OUTDIR']+'/'+vid; os.makedirs(W,exist_ok=True)
    orig=W+'/orig.mp4'; ov=W+'/orig.vtt'
    if not os.path.exists(orig): shutil.copy(mp4,orig); shutil.copy(vtt,ov)
    cs=cues(ov); ft=first_terms(cs); hook,q,ans,recap=M[vid]
    title=cs[0][2].split('.')[0][:70] if cs else vid
    RD.OUTDIR=W
    intro=dict(id='intro',short=title_short,title=title,scenes=[
      dict(k='analogy',title='A real moment first',items=[hook],say=['Before anything else, picture this.',hook]),
      dict(k='bullets',title='Pause and think',items=['🤔 '+q,'New words get a NEW WORD card, spoken aloud, the moment they appear.'],say=['Pause and think.',q,'Hold your answer; we will check it at the end. And whenever a new word comes up, we stop for a moment and explain it.']),
    ])
    outro=dict(id='outro',short=title_short,title=title,scenes=[
      dict(k='bullets',title='Pause-and-think: the answer',items=['🤔 '+q,'✅ '+ans],say=['Back to the question.',q,ans]),
      dict(k='recap',title='Recap',items=recap,say=['Quick recap.']+[r+'.' for r in recap]),
    ])
    RD.build(intro); RD.build(outro)
    # spoken NEW WORD interstitials, inserted right after the sentence where each term is first said
    groups={}
    for a0,g in ft[:14]:
        ce=next(b0 for a1,b0,t in cs if a1==a0); groups.setdefault(ce,[]).append(g)
    D=dur(orig); cuts=sorted(c for c in groups if c<D-0.5)
    segs=[]; prev=0.0; parts=[W+'/intro.mp4']; offs=[]
    for i,c in enumerate(cuts):
        p=f'{W}/seg{i}.mp4'; subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',f'{prev:.3f}','-to',f'{c:.3f}','-i',orig,'-c:v','libx264','-preset','veryfast','-crf','26','-c:a','aac','-ar','22050','-ac','1',p],check=True)
        parts.append(p); offs.append(('body',prev,c))
        gs=groups[c]; nid=f'nw{i}'
        RD.build(dict(id=nid,short=title_short,title=title,scenes=[dict(k='terms',title='NEW WORD',items=[(g['t'],g['m']+'  Like: '+g['a']) for g in gs],
            say=[f"New word: {g.get('say') or say_term(g)}. {g['m']} Picture it like this: {g['a']}" for g in gs])]))
        parts.append(f'{W}/{nid}.mp4'); offs.append(('nw',nid,None)); prev=c
    p=f'{W}/seg{len(cuts)}.mp4'; subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',f'{prev:.3f}','-i',orig,'-c:v','libx264','-preset','veryfast','-crf','26','-c:a','aac','-ar','22050','-ac','1',p],check=True)
    parts.append(p); offs.append(('body',prev,D)); parts.append(W+'/outro.mp4')
    inp=[]; fc=''; cat=''
    for i,p in enumerate(parts):
        inp+=['-i',p]; fc+=f'[{i}:v]scale=854:480,fps=12,format=yuv420p,setsar=1[v{i}];[{i}:a]aresample=22050[a{i}];'; cat+=f'[v{i}][a{i}]'
    fc+=f'{cat}concat=n={len(parts)}:v=1:a=1[v][au]'; out=W+'/final.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error']+inp+['-filter_complex',fc,'-map','[v]','-map','[au]','-c:v','libx264','-preset','medium','-crf','28','-tune','stillimage','-c:a','aac','-b:a','48k','-ac','1','-movflags','+faststart',out],check=True)
    t=dur(W+'/intro.mp4'); c=cues(W+'/intro.vtt'); n_nw=0; nw_t=0
    for kind,x,y in offs:
        if kind=='body':
            c+=[(a1-x+t,b1-x+t,tx) for a1,b1,tx in cs if a1>=x-0.01 and a1<y-0.01]; t+=dur(f'{W}/seg{len([o for o in offs[:offs.index((kind,x,y))] if o[0]=="body"])}.mp4')
        else:
            c+=[(a1+t,b1+t,tx) for a1,b1,tx in cues(f'{W}/{x}.vtt')]; d0=dur(f'{W}/{x}.mp4'); t+=d0; n_nw+=1; nw_t+=d0
    c+=[(a1+t,b1+t,tx) for a1,b1,tx in cues(W+'/outro.vtt')]
    open(W+'/final.vtt','w').write('WEBVTT\n\n'+'\n\n'.join(f'{s2ts(a1)} --> {s2ts(b1)}\n{tx}' for a1,b1,tx in c)+'\n')
    shutil.copy(out,mp4); shutil.copy(W+'/final.vtt',vtt)
    return dict(id=vid,total=round(dur(mp4),1),orig=round(D,1),new_word_cards=sum(len(v) for k,v in groups.items() if k<D-0.5),terms=[g['t'] for a0,g in ft[:14]])
if __name__=='__main__':
    res=[]
    for p in sys.argv[2:]:
        r=run(os.path.abspath(p),sys.argv[1]); print(json.dumps(r),flush=True); res.append(r)

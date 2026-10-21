"""Check every glossary term heard in each video's captions is defined at first use: the cue itself is its NEW WORD card,
or a NEW WORD card for it is in the run of cards right after the sentence that introduced the word."""
import sys,glob,os,re
sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glossary import G,BY,find
bad=0; rows=[]
for f in sorted(glob.glob(sys.argv[1]+'/*.vtt')):
    cues=[c.split('\n',1)[1] for c in open(f).read().split('\n\n')[1:] if '\n' in c]
    iscard=[next((g['k'] for g in G if c.startswith(g['t']+': ') and ' Like: ' in c),None) for c in cues]
    seen=set(); n=0
    for i,c in enumerate(cues):
        if iscard[i]: seen.add(iscard[i]); continue
        for _,k in find(c,'_sx'):
            if k in seen: continue
            seen.add(k); n+=1
            j=i+1; run=[]
            while j<len(cues) and iscard[j]: run.append(iscard[j]); j+=1
            if k not in run: bad+=1; print('UNDEFINED',os.path.basename(f),k,'|',c[:80])
    rows.append((os.path.basename(f),n))
for r in rows: print(*r)
print('undefined:',bad); sys.exit(1 if bad else 0)

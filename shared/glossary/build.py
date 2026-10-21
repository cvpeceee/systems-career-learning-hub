"""Build glossary.json from terms*.tsv, then overlay 07's glossary (07 definitions win so every course matches)."""
import json,sys,os,re
H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H+'/../../07-poly-embedded-firmware/source')
import glossary as G07
out={};order=[]
for f in sorted(x for x in os.listdir(H) if x.startswith('terms') and x.endswith('.tsv')):
  for l in open(H+'/'+f):
    p=l.rstrip('\n').split('\t')
    if len(p)==3 and p[0].lower() not in out: out[p[0].lower()]=dict(t=p[0],m=p[1],a=p[2]); order.append(p[0].lower())
n=0
for g in G07.G:
  t=re.sub(r'\s*\(.*\)$','',g['t']); k=t.lower(); e=dict(t=t,m=g['mean'],a=g['ana'],say=g['say'],src='07')
  if k not in out: order.append(k)
  out[k]=e; n+=1
L=[out[k] for k in order]
json.dump(L,open(H+'/glossary.json','w'),indent=0)
open(H+'/glossary-data.js','w').write('window.SHARED_GLOSSARY='+json.dumps(L,separators=(',',':'))+';\n')
print(len(L),'terms;',n,'from 07')

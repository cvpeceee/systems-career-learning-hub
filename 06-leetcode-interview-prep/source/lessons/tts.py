"""Narrate every sentence with Piper (offline neural TTS, voice en_US-lessac-medium), build per-lesson
audio WAV + timing JSON + WebVTT captions."""
import json, os, subprocess, hashlib, wave, sys
ROOT='/workspace/ip'; PIPER=ROOT+'/venv/bin/piper'; VOICE=ROOT+'/voices/en_US-lessac-medium.onnx'
CACHE=ROOT+'/lessons/cache'; OUT=ROOT+'/lessons/out'; os.makedirs(CACHE,exist_ok=True); os.makedirs(OUT,exist_ok=True)
GAP=0.45; SCENE_GAP=0.9; LS='1.12'
ns={}; exec(open(ROOT+'/lessons/lessons.py').read(),ns); L=ns['L']
def say(text):
    h=hashlib.md5((LS+text).encode()).hexdigest()[:16]; p=f'{CACHE}/{h}.wav'
    if not os.path.exists(p):
        subprocess.run([PIPER,'-m',VOICE,'--length_scale',LS,'-f',p],input=text.encode(),check=True,capture_output=True)
    return p
def dur(p):
    with wave.open(p) as w: return w.getnframes()/w.getframerate()
ids=sys.argv[1:]
for les in L:
    if ids and les['id'] not in ids: continue
    frames=b''; rate=None; t=0.0; cues=[]
    for sc in les['scenes']:
        sc['sents']=[]; start=t
        for k,s in enumerate(sc['say']):
            p=say(s)
            with wave.open(p) as w:
                rate=rate or w.getframerate(); sw=w.getsampwidth(); data=w.readframes(w.getnframes())
            d=len(data)/(rate*sw); pause=GAP+(SCENE_GAP if k==len(sc['say'])-1 else 0)
            frames+=data+b'\x00'*(int(pause*rate)*sw)
            cues.append((t,t+d,s)); sc['sents'].append(dict(text=s,d=d+pause)); t+=d+pause
        sc['dur']=t-start
    with wave.open(f"{OUT}/{les['id']}.wav",'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(frames)
    def ts(x): h=int(x//3600); m=int(x%3600//60); s=x%60; return f'{h:02d}:{m:02d}:{s:06.3f}'
    open(f"{OUT}/{les['id']}.vtt",'w').write('WEBVTT\n\n'+'\n\n'.join(f'{ts(a)} --> {ts(b)}\n{s}' for a,b,s in cues)+'\n')
    json.dump(dict(id=les['id'],title=les['title'],used=les['used'],scenes=[dict(v=s['v'],sents=s['sents'],dur=s['dur']) for s in les['scenes']]),open(f"{OUT}/{les['id']}.json",'w'))
    print(les['id'],'%.1fs'%t)

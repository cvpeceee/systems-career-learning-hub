import json, os, shutil, glob
R='/workspace/ip'; S=R+'/site'; os.makedirs(S+'/videos',exist_ok=True)
probs=[json.load(open(f)) for f in sorted(glob.glob(R+'/out/*/bundle.json'))]
for p in probs:   # tuples -> lists for JSON
    p['meta']['lc']=[list(x) for x in p['meta']['lc']]; p['meta']['similar']=[list(x) for x in p['meta']['similar']]
ns={}; exec(open(R+'/design/designs.py').read(),ns); designs=ns['D']
lessons=[json.load(open(f)) for f in sorted(glob.glob(R+'/lessons/out/*.json'))]
videos={}
for l in lessons:
    mp4=R+'/lessons/video/%s.mp4'%l['id']
    if os.path.exists(mp4):
        shutil.copy(mp4,S+'/videos/'); shutil.copy(R+'/lessons/out/%s.vtt'%l['id'],S+'/videos/'); videos[l['id']]='videos/%s.mp4'%l['id']
lessonFor={}
for l in lessons:
    for u in l['used']: lessonFor.setdefault(u,[]).append(l['id'])
sources=('Questions are adapted from (1) cvpeceee/systems-career-learning-hub: the 36-chapter main tutorial (interview rooms, gym problems, staff-level design drills, role playbooks for NVIDIA, Anthropic, Google, Roblox, Qualcomm, Microsoft Robotics), the Tesla FSD/Optimus track and the Skills Academy sims; '
 'and (2) cvpeceee/interview-mastery-courses: 8 company courses (Amazon, Anthropic, Apple, Google, Meta, Microsoft, NVIDIA, OpenAI) and 3 systems courses (Systems & AI Infrastructure, Specialized Systems Roles, Storage Systems), '
 'which list the high-frequency patterns (arrays/hash maps, trees, graphs BFS/DFS/topological sort/shortest path, DP, intervals, sliding window, LRU cache, rate limiter, concurrency) and design prompts (rate limiter, top-K, storage, inference serving, safe OTA, telemetry/monitoring). '
 'LeetCode numbers are listed only for well-known problems.')
data=dict(problems=probs,designs=designs,lessons=lessons,videos=videos,lessonFor=lessonFor,sources=sources)
open(S+'/data.js','w').write('window.DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
for f in ('index.html','app.js','player.js'): shutil.copy(R+'/web/'+f,S)
print(len(probs),'problems',len(designs),'designs',len(lessons),'lessons', os.path.getsize(S+'/data.js')//1024,'KB data')

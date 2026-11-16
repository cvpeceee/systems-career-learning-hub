"""Caption/audio sync check: every caption cue must start where speech starts (a silence ends) within 0.25 s,
and the last cue must end before the file does. Also writes videos/durations.json."""
import glob, json, os, re, subprocess, sys
LESSON = {'a01': 'role', 'a02': 'nexttoken', 'a03': 'embed', 'a04': 'apis', 'a05': 'tools', 'a06': 'loop', 'a07': 'rag1',
          'a08': 'mcp1', 'a09': 'langgraph', 'a10': 'evals', 'a11': 'inject', 'a12': 'reliab'}
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import va, vb
TITLES = {v['id']: v['title'] for v in va.V + vb.V}
D = sys.argv[1]; out = []; bad = 0
def secs(t): h, m, s = t.split(':'); return int(h) * 3600 + int(m) * 60 + float(s)
for mp4 in sorted(glob.glob(D + '/a*.mp4')):
    vid = os.path.basename(mp4)[:-4]
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]))
    cues = [tuple(map(secs, m)) for m in re.findall(r'(\d\d:\d\d:\d\d\.\d+) --> (\d\d:\d\d:\d\d\.\d+)', open(mp4[:-4] + '.vtt').read())]
    log = subprocess.run(['ffmpeg', '-i', mp4, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ends = [0.0] + [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    offs = [min(abs(c[0] - e) for e in ends) for c in cues]
    late = [o for o in offs if o > 0.25]
    ok = not late and cues[-1][1] <= dur + 0.05 and all(a[1] <= b[0] + 1e-6 for a, b in zip(cues, cues[1:]))
    bad += not ok
    print(f'{vid:34s} {dur:6.1f}s cues={len(cues):3d} max_offset={max(offs):.2f}s median={sorted(offs)[len(offs)//2]:.2f}s {"OK" if ok else "CHECK"}')
    out.append(dict(id=vid, title=TITLES[vid], dur=f'{int(dur // 60)}:{int(dur % 60):02d}', lesson=LESSON[vid[:3]]))
json.dump(out, open(D + '/durations.json', 'w'), indent=1)
print('videos', len(out), 'needing a look:', bad)

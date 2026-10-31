// The only music UI: one slanted SOUND ON / SOUND OFF button (bottom-left) plus, while playing, a
// slim "now playing" tab that slides out from it and a 2px progress line under it.
// Plays the local file in TRACK.src with a plain <audio> element: loops, fades in to 0.6 over 600ms,
// fades out over 300ms. Never autoplays (browsers require a click); the choice is remembered but
// never starts anything. Pauses while the tab is hidden. `M` toggles. Phone lock screens show the
// song through the Media Session API. If the file is missing or fails to load, the UI hides itself.
import { useCallback, useEffect, useRef, useState } from 'react';

// edit the text shown to visitors here
const TRACK = { src: '/audio/bgm.mp3', title: 'LIFE WILL CHANGE', subtitle: 'PERSONA 5 OST (INSTRUMENTAL)' };

const KEY = 'ks-sound';
const store = {
  get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
  set: (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } },
};

function fade(audio, to, ms) {
  return new Promise((resolve) => {
    const from = audio.volume;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

export default function SoundButton() {
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(false);
  const audio = useRef(null);
  const tab = useRef(null);
  const line = useRef(null);
  const resume = useRef(false);
  const fading = useRef(0); // bumped on every start/stop so an older fade never fights a newer one

  const hide = useCallback((why) => {
    console.info(`[sound] ${why} Add your own track at client/public${TRACK.src} to enable the SOUND button.`);
    setAvailable(false);
    setOn(false);
  }, []);

  // only show the button if the file really is there
  useEffect(() => {
    let live = true;
    fetch(TRACK.src, { method: 'HEAD' })
      .then((r) => {
        const ok = r.ok && /audio|mpeg|octet-stream/.test(r.headers.get('content-type') || '');
        if (!live) return;
        if (ok) setAvailable(true);
        else hide(`${TRACK.src} not found.`);
      })
      .catch(() => live && hide(`${TRACK.src} could not be reached.`));
    return () => { live = false; };
  }, [hide]);

  const start = useCallback(async () => {
    const a = audio.current;
    if (!a) return;
    const id = ++fading.current;
    a.preload = 'auto';
    a.volume = 0;
    try {
      await a.play();
      setOn(true);
      store.set('on');
      await fade(a, id === fading.current ? 0.6 : a.volume, 600);
    } catch {
      setOn(false); // play() rejected (autoplay policy, decode error): stay quiet
    }
  }, []);

  const stop = useCallback(async () => {
    const a = audio.current;
    if (!a) return;
    const id = ++fading.current;
    setOn(false);
    store.set('off');
    await fade(a, 0, 300);
    if (id === fading.current) a.pause();
  }, []);

  const toggle = useCallback(() => (on ? stop() : start()), [on, start, stop]);

  // M toggles sound (ignored while typing)
  useEffect(() => {
    if (!available) return;
    const onKey = (e) => {
      if (e.key.toLowerCase() !== 'm' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      toggle();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [available, toggle]);

  // pause while the tab is hidden, resume only if it was on
  useEffect(() => {
    const onVis = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) { resume.current = !a.paused; a.pause(); }
      else if (resume.current) { resume.current = false; a.play().catch(() => {}); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // lock-screen / media-key metadata and handlers
  const handlers = useRef({});
  useEffect(() => { handlers.current = { start, stop }; }, [start, stop]);
  useEffect(() => {
    if (!available || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.metadata = new MediaMetadata({ title: TRACK.title, artist: TRACK.subtitle, album: 'Karan Sapalia — Portfolio' });
      ms.setActionHandler('play', () => handlers.current.start());
      ms.setActionHandler('pause', () => handlers.current.stop());
    } catch { /* unsupported action */ }
    return () => {
      try { ms.setActionHandler('play', null); ms.setActionHandler('pause', null); } catch { /* ignore */ }
    };
  }, [available]);
  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }, [on]);

  // progress line: read-only, about 4 updates a second, transform only
  useEffect(() => {
    const a = audio.current;
    if (!available || !a) return;
    let last = 0;
    const onTime = () => {
      const now = performance.now();
      if (now - last < 240) return;
      last = now;
      const k = a.duration > 0 ? a.currentTime / a.duration : 0;
      if (line.current) line.current.style.transform = `scaleX(${Math.min(1, k)})`;
    };
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  }, [available]);

  // lines wider than the tab scroll slowly back and forth (measured when the tab opens)
  useEffect(() => {
    if (!on || !tab.current) return;
    const t = setTimeout(() => {
      tab.current?.querySelectorAll('.sound-line').forEach((el) => {
        const inner = el.firstElementChild;
        const over = inner.scrollWidth - el.clientWidth;
        el.style.setProperty('--ov', `${Math.max(0, over)}px`);
        el.classList.toggle('is-scroll', over > 2);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [on]);

  if (!available) return null;

  return (
    <div className={`sound ${on ? 'is-on' : ''}`}>
      <audio ref={audio} src={TRACK.src} loop preload="none"
        onError={() => hide(`${TRACK.src} failed to load.`)} />
      <button type="button" className="sound-btn" onClick={toggle} aria-pressed={on}
        aria-label={on ? `Sound off (M). Now playing ${TRACK.title}` : 'Sound on (M)'} data-cursor-label="Sound">
        <span>
          <span className={`eq ${on ? 'is-on' : ''}`} aria-hidden="true"><i /><i /><i /></span>
          {on ? 'Sound off' : 'Sound on'}
        </span>
      </button>
      <div className="sound-tab" ref={tab} aria-hidden="true">
        <div className="sound-tab-in">
          <p className="sound-line sound-line--title"><span>♪ {TRACK.title}</span></p>
          <p className="sound-line sound-line--sub"><span>{TRACK.subtitle}</span></p>
        </div>
      </div>
      <span className="sound-progress" aria-hidden="true"><i ref={line} /></span>
    </div>
  );
}

// JRPG-style dialogue box: red name tab (optionally with an avatar), text that types out once on
// enter, bouncing "next" marker. Screen readers get the full text; reduced motion shows it instantly.
import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/scroll.jsx';

export default function DialogueBox({ name = 'KARAN', text, speed = 18, avatar = null }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));
  const done = shown >= text.length;

  useEffect(() => {
    if (reducedMotion()) return;
    let timer;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      let i = 0;
      timer = setInterval(() => {
        i += 2;
        setShown(i);
        if (i >= text.length) clearInterval(timer);
      }, speed);
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [text, speed]);

  return (
    <div className="dialogue" ref={ref}>
      <span className="dialogue-name" aria-hidden="true">
        {avatar}
        <span>{name}</span>
      </span>
      <div className="dialogue-box">
        <p className="dialogue-text">
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {text.slice(0, shown)}
            {!done && <span className="caret" />}
          </span>
        </p>
        {done && <span className="dialogue-next" aria-hidden="true" />}
      </div>
    </div>
  );
}

// Persistent HUD: MaskEmblem badge (back to top), current-section tag, scroll % (mobile),
// a daily tag ("10/31 SAT · NIGHT") and the MENU button.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MaskEmblem from './MaskEmblem.jsx';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
function daily(d = new Date()) {
  const h = d.getHours();
  const part = h >= 5 && h < 17 ? 'Daytime' : h >= 17 && h < 20 ? 'Evening' : 'Night';
  return { date: `${d.getMonth() + 1}/${d.getDate()}`, day: DAYS[d.getDay()], part };
}

export default function Hud({ section, onMenu, onTop, menuOpen, menuBtnRef }) {
  const [now, setNow] = useState(daily);
  useEffect(() => {
    const t = setInterval(() => setNow(daily()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="hud">
      <button type="button" className="hud-logo" aria-label="Back to top" data-cursor-label="Top" onClick={onTop}>
        <MaskEmblem simple className="hud-emblem" />
      </button>
      <div className="hud-tag" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={section} initial={{ y: '-120%' }} animate={{ y: 0 }} exit={{ y: '120%' }} transition={{ duration: 0.15 }}>
            {section}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="hud-pct" data-scroll-pct aria-hidden="true">000%</span>
      <div className="hud-spacer" />
      <p className="hud-day" aria-label={`${now.day} ${now.date}, ${now.part}`}>
        <span className="hud-day-date num">{now.date}</span>
        <span className="hud-day-week">{now.day}</span>
        <span className="hud-day-part">{now.part}</span>
      </p>
      <button type="button" className="hud-btn" ref={menuBtnRef} onClick={onMenu} aria-expanded={menuOpen} aria-haspopup="dialog" data-cursor-label="Menu">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h17l-2 3H2zM5 10.5h17l-2 3H3zM3 16h17l-2 3H1z" /></svg>
        <span>Menu</span>
      </button>
    </header>
  );
}

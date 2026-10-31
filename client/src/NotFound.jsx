// 404: "NO TREASURE HERE." Outlined 404, the ring calling card (rings spin) and a way back.
import { useEffect } from 'react';
import CallingCard from './components/CallingCard.jsx';
import { SlantButton } from './components/ui.jsx';

export default function NotFound() {
  // keep the 404 out of search results
  useEffect(() => {
    const m = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.append(m);
    return () => m.remove();
  }, []);

  return (
    <main className="nf" id="main">
      <div className="nf-copy">
        <p className="nf-num num" aria-hidden="true">404</p>
        <h1 className="nf-h">No treasure here.</h1>
        <p className="nf-sub">This page was never on the map. The real loot is back at base.</p>
        <SlantButton href="/" data-cursor-label="Home">Back to base</SlantButton>
      </div>
      <CallingCard className="nf-card" tilt={4} spin />
    </main>
  );
}

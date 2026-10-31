import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ScrollProvider } from './lib/scroll.jsx';
import { WipeProvider } from './components/Wipe.jsx';
import { TransitionProvider } from './components/menu/TransitionLayer.jsx';
import Cursor from './components/Cursor.jsx';
import { DuotoneDefs } from './components/Portrait.jsx';
import Home from './Home.jsx';
import NotFound from './NotFound.jsx';

const TITLE = 'KARAN SAPALIA — TAKE YOUR HEART';
const AWAY = 'COME BACK, THIEF.';
const ICON = '/favicon.svg';
const ICON_AWAY = '/favicon-away.svg';

export default function App() {
  // dynamic tab title + favicon: the mask flips to black-on-red while the tab is hidden
  useEffect(() => {
    const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    const onVis = () => {
      document.title = document.hidden ? AWAY : TITLE;
      if (icon) icon.href = document.hidden ? ICON_AWAY : ICON;
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <BrowserRouter>
      <ScrollProvider>
        <WipeProvider>
          <DuotoneDefs />
          <TransitionProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TransitionProvider>
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </WipeProvider>
      </ScrollProvider>
    </BrowserRouter>
  );
}

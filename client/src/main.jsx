import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/menu.css';
import './styles/card.css';
import './styles/frame.css';
import './styles/heist.css';
import './styles/screens.css';
import './styles/portrait.css';
import './styles/rail.css';
import './styles/projects.css';
import './styles/sections.css';
import './styles/music.css';
import './styles/transitions.css';
import App from './App.jsx';

// The title sequence is the entrance, so every visit starts at the top.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

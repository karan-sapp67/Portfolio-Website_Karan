// ABOUT: a Persona-style conversation (portrait avatar on the name plate, one short line at a time,
// choices at the end) beside a strip of slanted stat tiles.
import { about } from '@shared/seedData.js';
import { useScroll } from '../lib/scroll.jsx';
import { useWipe } from '../components/Wipe.jsx';
import DialogueBox from '../components/DialogueBox.jsx';
import Portrait from '../components/Portrait.jsx';
import Decor from '../components/Decor.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

import { SectionHead } from '../components/ui.jsx';

export default function About() {
  const { scrollTo } = useScroll();
  const wipe = useWipe();
  const jump = (id) => () => wipe(() => scrollTo(`#${id}`, { immediate: true }));
  return (
    <section id="about" className="screen screen--about" aria-labelledby="about-h">
      <ScreenFrame num="02" name="About" desc="I am thou, thou art I" />
      <Decor items={[{ type: 'bubble', pos: 'tr', rot: 8 }, { type: 'star', pos: 'bl', size: 48, rot: -12 }]} />
      <div className="screen-inner">
        <SectionHead title="About" id="about-h" meta="Who is this?" />
        <div className="about-grid">
          <DialogueBox pages={about.dialogue} avatar={<Portrait variant="avatar" />}
            choices={[{ label: 'See the missions', onSelect: jump('projects') }, { label: 'Send a calling card', onSelect: jump('contact') }]} />
          <dl className="stat-strip">
            {about.stats.map((s) => (
              <div key={s.label} className="stat-tile">
                <dt className="label">{s.label}</dt>
                <dd className="num" data-count={s.value}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

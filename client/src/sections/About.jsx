// ABOUT: one dialogue box (portrait avatar in the name tab) beside a strip of slanted stat tiles.
import { about } from '@shared/seedData.js';
import DialogueBox from '../components/DialogueBox.jsx';
import Portrait from '../components/Portrait.jsx';
import Decor from '../components/Decor.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

import { SectionHead } from '../components/ui.jsx';

export default function About() {
  return (
    <section id="about" className="screen screen--about" aria-labelledby="about-h">
      <ScreenFrame num="02" name="About" desc="I am thou, thou art I" />
      <Decor items={[{ type: 'bubble', pos: 'tr', rot: 8 }, { type: 'star', pos: 'bl', size: 48, rot: -12 }]} />
      <div className="screen-inner">
        <SectionHead title="About" id="about-h" meta="Who is this?" />
        <div className="about-grid">
          <DialogueBox text={`I AM THOU, THOU ART I. ${about.intro} THOU ART I.`} avatar={<Portrait variant="avatar" />} />
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

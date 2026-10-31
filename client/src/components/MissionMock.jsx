// Angular device frame (browser or phone) holding either the project's screenshot or an
// original generated mock UI built from flat blocks. Never renders an empty panel.

const bars = [62, 38, 80, 54, 92, 46, 70, 30]; // deterministic chart heights

const MOCKS = {
  dashboard: (
    <div className="mk mk-dashboard">
      <div className="mk-side">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i === 1 ? 'is-on' : ''} />)}</div>
      <div className="mk-main">
        <div className="mk-stats"><b className="is-red" /><b /><b /></div>
        <div className="mk-chart">{bars.map((h, i) => <i key={i} style={{ height: `${h}%` }} className={i === 4 ? 'is-red' : ''} />)}</div>
        <div className="mk-rows">{[0, 1, 2].map((i) => <i key={i} />)}</div>
      </div>
    </div>
  ),
  monitor: (
    <div className="mk mk-monitor">
      <div className="mk-head" />
      <div className="mk-meter"><i style={{ width: '72%' }} /></div>
      <div className="mk-meter"><i style={{ width: '45%' }} /></div>
      <div className="mk-list">
        {['ok', 'warn', 'ok', 'ok'].map((s, i) => <div key={i} className={`mk-item mk-item--${s}`}><i /><b /></div>)}
      </div>
      <div className="mk-nav"><i className="is-on" /><i /><i /><i /></div>
    </div>
  ),
  store: (
    <div className="mk mk-store">
      <div className="mk-head" />
      <div className="mk-search" />
      <div className="mk-grid">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="mk-product"><i /><b className={i === 2 ? 'is-red' : ''} /></div>)}</div>
    </div>
  ),
  gallery: (
    <div className="mk mk-gallery">
      <div className="mk-hero"><span /></div>
      <div className="mk-name"><i /><b /></div>
      <div className="mk-thumbs"><i /><i className="is-red" /><i /></div>
    </div>
  ),
  classified: (
    <div className="mk mk-classified">
      {[90, 70, 84, 40, 76, 60, 88].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
      <span className="mk-stamp">Classified</span>
    </div>
  ),
  // webcam frame with hand landmarks and the predicted word
  gesture: (
    <div className="mk mk-gesture">
      <svg viewBox="0 0 160 100" className="mk-cam" aria-hidden="true">
        <rect width="160" height="100" fill="#141414" />
        <g stroke="#E60012" strokeWidth="1.6" fill="none">
          <path d="M70 84 L66 60 L58 40 M66 60 L70 36 M66 60 L80 34 L82 22 M66 60 L90 40 L96 30 M70 84 L96 58 L106 48" />
        </g>
        <g fill="#F5F5F0">
          {[[70, 84], [66, 60], [58, 40], [70, 36], [80, 34], [82, 22], [90, 40], [96, 30], [96, 58], [106, 48]].map(([x, y], i) => <rect key={i} x={x - 2} y={y - 2} width="4" height="4" />)}
        </g>
        <rect x="46" y="14" width="74" height="78" fill="none" stroke="#F5F5F0" strokeWidth="1" strokeDasharray="4 3" />
      </svg>
      <div className="mk-say"><b /><i /></div>
    </div>
  ),
  // multi-step survey: stepper, fields, next button
  form: (
    <div className="mk mk-form">
      <div className="mk-steps">{[0, 1, 2, 3].map((i) => <i key={i} className={i < 2 ? 'is-on' : ''} />)}</div>
      {[78, 56, 90].map((w, i) => <div key={i} className="mk-field"><b style={{ width: `${w * 0.5}%` }} /><i /></div>)}
      <div className="mk-choice"><i className="is-on" /><i /><i /></div>
      <span className="mk-next" />
    </div>
  ),
  // B2B orders: brand tabs + order rows + totals
  orders: (
    <div className="mk mk-orders">
      <div className="mk-tabs"><i className="is-on" /><i /><i /></div>
      <div className="mk-table">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="mk-tr"><i /><b /><i className={i === 1 ? 'is-red' : ''} /></div>)}</div>
      <div className="mk-total"><b /><i className="is-red" /></div>
    </div>
  ),
  // prompt-to-interface: a chat prompt on the left, the generated screen on the right
  prompt: (
    <div className="mk mk-prompt">
      <div className="mk-chat"><b /><i /><i /><b className="is-red" /></div>
      <div className="mk-gen"><i className="is-red" /><div><b /><b /></div><span /></div>
    </div>
  ),
  // vendor quotes compared side by side, best one highlighted
  quotes: (
    <div className="mk mk-quotes">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`mk-quote ${i === 1 ? 'is-best' : ''}`}>
          <b /><i /><i /><i /><span />
        </div>
      ))}
    </div>
  ),
};

export default function MissionMock({ project, index }) {
  const { device = 'browser', mock = 'dashboard', image, title } = project;
  return (
    <div className={`device device--${device}`}>
      {device === 'browser' ? (
        <div className="device-bar" aria-hidden="true"><i /><i /><i /><span /></div>
      ) : (
        <div className="device-notch" aria-hidden="true" />
      )}
      <div className="device-screen">
        <div className="device-parallax">
          {image ? (
            <img src={image} alt={`${title} screenshot`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          ) : (
            <div role="img" aria-label={`Illustrated preview of ${title}`}>{MOCKS[mock] || MOCKS.dashboard}</div>
          )}
        </div>
      </div>
    </div>
  );
}

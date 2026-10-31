// Shared game-UI building blocks: SlantButton, RansomTitle, SectionHead, TornEdge.

/** Slanted button. Renders <a> when `href` is set, otherwise <button>. */
export function SlantButton({ href, children, className = '', ...rest }) {
  const cls = `slant-btn ${className}`.trim();
  const inner = (
    <span>
      <i className="ptr" aria-hidden="true" />
      {children}
    </span>
  );
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a {...rest} className={cls} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" {...rest} className={cls}>
      {inner}
    </button>
  );
}

// deterministic tilt per letter index, always within -3..3deg
const tilt = (i) => [-3, 2, -1, 3, -2, 1, -2.5, 2.5, 0][i % 9];

/** Section heading built from letter blocks on an angled red slab. */
export function RansomTitle({ text, as: Tag = 'h2', id, className = '' }) {
  let n = 0;
  return (
    <Tag id={id} className={`ransom ${className}`} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="ransom-word" aria-hidden="true">
          {[...word].map((ch) => {
            const i = n++;
            return (
              <span key={i} className={`ransom-l ${i % 2 ? 'ransom-l--wb' : 'ransom-l--bw'}`} style={{ '--r': `${tilt(i)}deg` }}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

export function SectionHead({ title, id, num, meta }) {
  return (
    <header className="sec-head">
      <RansomTitle text={title} id={id} />
      {(num || meta) && (
        <p className="sec-meta">
          {num && <span className="num">{num}</span>}
          {meta && <span className="label">{meta}</span>}
        </p>
      )}
    </header>
  );
}

// fixed jagged path so the edge is identical on every render
const TORN = 'M0 0 H1200 V14 L1176 20 L1150 11 L1122 19 L1090 9 L1062 17 L1030 12 L996 21 L968 10 L936 18 L902 8 L874 16 L840 11 L806 20 L778 9 L744 17 L712 12 L680 21 L648 10 L616 18 L584 8 L552 15 L520 11 L488 20 L456 9 L424 17 L392 12 L360 22 L328 10 L296 18 L264 8 L232 16 L200 11 L168 20 L136 9 L104 17 L72 12 L40 21 L0 12 Z';

/** Jagged torn-paper divider. `color` fills the torn strip (usually the previous section's bg). */
export function TornEdge({ color = 'var(--black)', flip = false }) {
  return (
    <svg className={`torn-edge ${flip ? 'torn-edge--flip' : ''}`} viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={TORN} fill={color} />
    </svg>
  );
}

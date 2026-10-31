// Section-corner stickers: max 4 per screen, placed in the margins, hidden below 900px so they
// can never sit on top of content.
import StickerArt from './StickerArt.jsx';

/** items: [{ type, pos: 'tl' | 'tr' | 'bl' | 'br', size?, rot? }] */
export default function Decor({ items }) {
  return (
    <div className="decor" aria-hidden="true">
      {items.slice(0, 4).map((s) => (
        <div key={s.type + s.pos} className={`sticker decor-${s.pos}`} style={{ width: s.size || 56, rotate: `${s.rot || 0}deg` }}>
          <div className="drift"><StickerArt type={s.type} /></div>
        </div>
      ))}
    </div>
  );
}

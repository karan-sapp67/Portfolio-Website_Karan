# Cinematic Portfolio

Vite + vanilla JS, GSAP/ScrollTrigger, Lenis and Three.js. A scroll-driven particle intro leads into About, Projects, Skills, Journey and Contact sections.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # serve the production build
```

## Structure

```
index.html                  section shells, meta + Open Graph tags
src/content.js              ALL editable content (name, bio, projects, skills, timeline, contact)
src/main.js                 boot order: preloader, intro, sections, nav
src/scene/heroScene.js      Three.js particles (+ shaders/ for the GLSL)
src/animations/             heroScroll (scrubbed timeline), smooth (Lenis), text (word splitting)
src/sections/               about, projects, skills, journey, contact
src/ui/                     preloader, cursor, nav, interactions (tilt, spotlight, magnetic)
src/styles/main.css         tokens, layout, all section styles
```

## Customize

- **Content:** edit `src/content.js`. Everything marked `TODO` is dummy data. Also update the `<title>`, description and Open Graph URLs in `index.html`, and drop `resume.pdf` and an `og.png` (1200x630) in `public/`.
- **Colors:** the `:root` tokens at the top of `src/styles/main.css`. The particle colors live in `src/scene/shaders/particles.vert.glsl` (`violet`, `cyan`).
- **Fonts:** change the Google Fonts `<link>` in `index.html` and `--font-display` / `--font-body` in the CSS. The particle name is sampled from `--font-display`.
- **Particle count:** `PARTICLES` in `src/main.js` (8000 desktop, 3500 mobile).
- **Intro length and phase timing:** `.hero-track { height: 500vh }` in the CSS, `PHASES` in `src/scene/heroScene.js`, and the matching positions in `src/animations/heroScroll.js`.

## Accessibility and motion

`prefers-reduced-motion`, or a WebGL failure, swaps the intro for a plain fade-in hero and disables smooth scroll and scrubbed effects. The custom cursor is disabled on touch devices.

## Deploy

**Vercel:** push to GitHub, import the repo at vercel.com/new. Framework preset Vite, build `npm run build`, output `dist`.

**Netlify:** push to GitHub, "Add new site" then "Import an existing project". Build command `npm run build`, publish directory `dist`.

Or from the CLI: `npx vercel --prod` / `npx netlify deploy --prod --dir=dist`.

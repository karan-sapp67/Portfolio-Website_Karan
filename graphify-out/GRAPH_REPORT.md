# Graph Report - src  (2026-10-30)

## Corpus Check
- Corpus is ~3,501 words - fits in a single context window. You may not need a graph.

## Summary
- 51 nodes · 124 edges · 7 communities (4 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6

## God Nodes (most connected - your core abstractions)
1. `boot()` - 13 edges
2. `splitMask()` - 9 edges
3. `content` - 8 edges
4. `mountProjects()` - 6 edges
5. `mountContact()` - 5 edges
6. `mountSkills()` - 5 edges
7. `initSpotlight()` - 5 edges
8. `createHeroScene()` - 4 edges
9. `mountAbout()` - 4 edges
10. `mountJourney()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `boot()` --calls--> `initSmoothScroll()`  [EXTRACTED]
  main.js → animations/smooth.js
- `mountJourney()` --calls--> `splitMask()`  [EXTRACTED]
  sections/journey.js → animations/text.js
- `boot()` --calls--> `mountAbout()`  [EXTRACTED]
  main.js → sections/about.js
- `boot()` --calls--> `mountContact()`  [EXTRACTED]
  main.js → sections/contact.js
- `boot()` --calls--> `mountJourney()`  [EXTRACTED]
  main.js → sections/journey.js

## Import Cycles
- None detected.

## Communities (7 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (4): content, mountJourney(), LINKS, mountNav()

### Community 1 - "Community 1"
Cohesion: 0.42
Nodes (7): splitMask(), mountContact(), mountProjects(), mountSkills(), initMagnetic(), initSpotlight(), initTilt()

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (5): createHeroScene(), render(), PHASES, sampleName(), smooth()

### Community 4 - "Community 4"
Cohesion: 0.67
Nodes (3): initHeroScroll(), initStaticHero(), boot()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `boot()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `mountProjects()` connect `Community 1` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
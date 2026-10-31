// Single source of truth for site content.
// - The server seeds MongoDB from this file (`npm run seed`) and serves it from memory when no DB is set.
// - The client bundles it as a fallback, so the site never looks empty if the API is down.
// Every TODO is a placeholder to replace with your own content.

// categories drive the filter chips: INTERNSHIP · HACKATHON · DESIGN · PERSONAL · RESEARCH
// valencia: true groups internship apps (tag, banner, disclaimer). For company apps, repo/live links
// stay empty until you confirm they are public (nothing confidential is published).
// With more than 10 projects only the first 9 get full panels; the rest live in ALL MISSIONS.
export const projects = [
  {
    order: 1,
    title: 'SIH 2026 Prototype',
    subtitle: 'Smart Real-Time Monitoring & Inspection Mobile App',
    description: 'A mobile-first prototype for the Smart India Hackathon 2026 that streams live readings and guides on-site inspections.',
    categories: ['HACKATHON'],
    tech: ['React', 'JavaScript', 'Responsive UI', 'Vercel'],
    role: 'Developer',
    status: 'Prototype',
    year: '2026',
    live: 'https://sih-2026-poc-xi.vercel.app',
    github: 'https://github.com/karan-sapp67/SIH_2026_POC',
    image: '', // TODO: screenshot path, e.g. /images/projects/sih.webp
    device: 'phone', mock: 'monitor', // generated mock shown until `image` is set
  },
  {
    order: 2,
    title: 'Sign Language: Gesture-to-Text-to-Speech',
    subtitle: 'Real-time gesture recognition',
    description: 'Computer vision and Python that turn hand gestures into text and speech: landmarks from a webcam, a predicted sign, then a spoken word.',
    categories: ['PERSONAL'],
    tech: ['Python', 'MediaPipe', 'scikit-learn', 'gTTS', 'OpenCV'],
    role: 'Developer',
    status: 'Working build',
    year: '\u2014', // TODO: year
    live: '',
    github: 'https://github.com/karan-sapp67/sign-language-detection-through-gtts',
    image: '',
    device: 'browser', mock: 'gesture',
    cursor: 'hand', // the custom cursor becomes an open hand over this panel
  },
  {
    order: 3,
    title: 'Intern Performance Tracking Web App',
    subtitle: 'Task & performance tracking',
    description: 'A centralized portal for assigning intern tasks and tracking performance, with secure auth, submission validation and a gamified credit-reward system.',
    categories: ['INTERNSHIP'],
    valencia: true,
    tech: ['Next.js', 'Tailwind CSS', 'Firebase'],
    role: 'Software Developer Intern',
    status: 'Shipped',
    year: '2026',
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'dashboard',
  },
  {
    order: 4,
    title: 'Multi-Brand Distributor Sales App',
    subtitle: 'Crunzzo \u00b7 Bounce \u00b7 Drink Valencia',
    description: 'A B2B sales dashboard for three brands that streamlines regional stock management and order placement for distributors.',
    categories: ['INTERNSHIP'],
    valencia: true,
    tech: ['React', 'Next.js', 'Firebase'],
    role: 'Software Developer Intern',
    status: 'Shipped',
    year: '2026',
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'orders',
  },
  {
    order: 5,
    title: 'Procurement Management System',
    subtitle: 'Purchase orders & vendor quotes',
    description: 'A supply-chain web app for creating purchase orders, comparing vendor quotations side by side and exporting automated PDFs.',
    categories: ['INTERNSHIP'],
    valencia: true,
    tech: ['React', 'Tailwind CSS', 'Firestore'],
    role: 'Software Developer Intern',
    status: 'Shipped',
    year: '2026',
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'quotes',
  },
  {
    order: 6,
    title: 'Natal-Care Form (Nataclare)',
    subtitle: 'Maternal & pediatric nutrition study',
    description: 'A multi-step clinical survey interface built so field staff can collect reliable clinical data for a maternal and pediatric nutrition study.',
    categories: ['INTERNSHIP'],
    valencia: true,
    tech: ['React', 'Vite', 'Tailwind CSS'],
    role: 'Software Developer Intern',
    status: 'Shipped',
    year: '2026',
    live: '', // TODO: only if the company confirms it is public
    github: '', // TODO: public repos exist (Natal-Care-Form, Natal-Care-Dashboard); link them only if the company is fine with it
    image: '',
    device: 'browser', mock: 'form',
  },
  {
    order: 7,
    title: 'GDG On Campus Vibe Coding Prototype',
    subtitle: 'Firebase AI & Stitch',
    description: 'A rapid prototype built at a GDG On Campus vibe-coding session, going from a prompt to a working interface with Firebase AI and Stitch.',
    categories: ['HACKATHON'],
    tech: ['Firebase AI', 'Stitch', 'Generative AI'],
    role: 'Developer',
    status: 'Prototype',
    year: '\u2014', // TODO: year
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'prompt',
  },
  {
    order: 8,
    title: 'E-Shopper Redesign',
    subtitle: 'Mobile & tablet UI/UX',
    description: 'A responsive rework and full visual redesign of an e-commerce storefront, focused on mobile and tablet screens.',
    categories: ['DESIGN'],
    tech: ['JavaScript', 'HTML', 'CSS', 'UI/UX'],
    role: 'UI/UX & Front-end',
    status: 'Live',
    year: '\u2014', // TODO: year
    live: 'https://eshopperwebsite-redesign-redesign.vercel.app',
    github: 'https://github.com/karan-sapp67/eshopper_website-redesign',
    image: '',
    device: 'phone', mock: 'store',
  },
  {
    order: 9,
    title: 'Model Portfolio Website',
    subtitle: 'Client portfolio',
    description: 'An image-led portfolio site designed, built and deployed for a model.',
    categories: ['DESIGN', 'PERSONAL'],
    tech: ['JavaScript', 'HTML', 'CSS', 'Vercel'],
    role: 'Design & Development',
    status: 'Live',
    year: '\u2014', // TODO: year
    live: 'https://dhurti-patel.vercel.app',
    github: 'https://github.com/karan-sapp67/Portfolio-Website_Dhru',
    image: '',
    device: 'browser', mock: 'gallery',
  },
  {
    order: 10,
    title: 'Behavioral & Invisible Tracking Research',
    subtitle: 'Digital tracking, privacy and behavior',
    description: 'Research into the ethical impact of digital tracking on privacy and behavior.',
    categories: ['RESEARCH'],
    tech: ['Research', 'Data Ethics', 'Privacy'],
    role: 'Researcher',
    status: 'Completed',
    year: '\u2014', // TODO: year
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'classified',
  },
  {
    order: 11,
    title: 'Web & Logic Development',
    subtitle: 'Responsive pages and Python logic',
    description: 'Responsive web pages and Python logic problems from the first year of the degree.',
    categories: ['PERSONAL'],
    tech: ['HTML', 'CSS', 'JavaScript', 'Python'],
    role: 'Student',
    status: 'Completed',
    year: '\u2014', // TODO: year
    live: '',
    github: '',
    image: '',
    device: 'browser', mock: 'gallery',
  },
];

// TODO: all clips are placeholders ("CLIP COMING SOON"). For each real clip set ONE of:
//   src: '/clips/name.mp4'  (your own recording in client/public/clips, optional poster: '/clips/name.jpg')
//   youtube: 'VIDEO_ID'     (a link you paste, e.g. youtu.be/VIDEO_ID; played with the official embed)
export const clips = [
  { order: 1, title: 'Last-minute winner', game: 'FIFA', src: '', youtube: '', poster: '', duration: '0:24' },
  { order: 2, title: 'Ace on Ascent', game: 'VALORANT', src: '', youtube: '', poster: '', duration: '0:41' },
  { order: 3, title: 'Bicycle kick', game: 'FIFA', src: '', youtube: '', poster: '', duration: '0:18' },
  { order: 4, title: '1v3 clutch', game: 'VALORANT', src: '', youtube: '', poster: '', duration: '0:33' },
  { order: 5, title: 'Free-kick curler', game: 'FIFA', src: '', youtube: '', poster: '', duration: '0:15' },
  { order: 6, title: 'Spike defuse', game: 'VALORANT', src: '', youtube: '', poster: '', duration: '0:29' },
  { order: 7, title: 'Clean sheet', game: 'FIFA', src: '', youtube: '', poster: '', duration: '0:52' },
  { order: 8, title: 'Team wipe', game: 'VALORANT', src: '', youtube: '', poster: '', duration: '0:27' },
];

// Newest first. Certificates and courses: paste yours (title, issuer, year, link) and they are added
// as kind 'Certificate' / 'Course' entries. The group stays hidden until there is at least one.
export const journey = [
  {
    order: 1,
    date: '2026',
    kind: 'Internship',
    role: 'Software Developer Intern',
    org: 'Valencia Nutrition Ltd.',
    bullets: [
      'Built an intern task and performance tracking portal with a gamified credit-reward system.',
      'Developed a multi-brand B2B distributor sales dashboard for stock and order workflows.',
      'Engineered a procurement system with vendor quotation comparison and automated PDF exports.',
      'Designed the Natal-Care multi-step clinical survey form for a maternal and pediatric nutrition study.',
    ],
    tags: ['Next.js', 'React', 'Firebase', 'Tailwind CSS'],
  },
  {
    order: 2,
    date: '2026',
    kind: 'Hackathon',
    role: 'Smart India Hackathon 2026',
    org: 'Team prototype',
    bullets: ['Prototyped a smart real-time monitoring and inspection mobile app.'], // TODO: your result and learnings
    tags: ['Hackathon', 'React'],
  },
  {
    order: 3,
    date: '\u2014', // TODO: year
    kind: 'Hackathon',
    role: 'GDG On Campus Vibe Coding Prototype',
    org: 'GDG On Campus',
    bullets: ['Built a rapid prototype with Firebase AI and Stitch, from prompt to working interface.'],
    tags: ['Firebase AI', 'Stitch'],
  },
  {
    order: 4,
    date: '2025 \u2013 Present',
    kind: 'Education',
    role: 'Data Science',
    org: 'Atharva College of Hotel Management and Catering Technology',
    bullets: ['Python, R, SQL, statistics and discrete mathematics, plus Generative AI tools and data ethics.'],
    tags: ['Python', 'R', 'SQL'],
  },
  {
    order: 5,
    date: '2025',
    kind: 'Education',
    role: 'HSC',
    org: 'Higher Secondary Certificate',
    bullets: ['Scored 71.17%.'],
    tags: [],
  },
  {
    order: 6,
    date: '2023',
    kind: 'Education',
    role: 'SSC',
    org: 'Secondary School Certificate',
    bullets: ['Scored 70.20%.'],
    tags: [],
  },
  // Dev-only placeholders so the layout is visible while you gather real ones; never shown in production.
  { order: 90, date: 'TBA', kind: 'Certificate', role: 'Certificate title', org: 'Issuer', bullets: ['Placeholder: add a certificate you have earned.'], tags: ['TODO'] },
  { order: 91, date: 'TBA', kind: 'Course', role: 'Course title', org: 'Platform', bullets: ['Placeholder: add a course you have completed.'], tags: ['TODO'] },
];

// kind 'stat' = segmented bar; kind 'skill' = selectable list item. Groups follow the resume.
// TODO: levels are self-assessed, adjust them. `related` must match project titles exactly.
export const skills = [
  { order: 1, kind: 'stat', name: 'Languages & Databases', level: 75 },
  { order: 2, kind: 'stat', name: 'Frameworks', level: 85 },
  { order: 3, kind: 'stat', name: 'Tools & Platforms', level: 75 },
  { order: 4, kind: 'stat', name: 'Core Competencies', level: 75 },
  { order: 10, kind: 'skill', name: 'Python', category: 'Languages & Databases', level: 75, detail: 'Data work, logic problems and computer vision, like the gesture-to-speech system.', related: ['Sign Language: Gesture-to-Text-to-Speech', 'Web & Logic Development'] },
  { order: 11, kind: 'skill', name: 'R', category: 'Languages & Databases', level: 55, detail: 'Statistics and data analysis from the Data Science degree.', related: [] },
  { order: 12, kind: 'skill', name: 'SQL', category: 'Languages & Databases', level: 65, detail: 'Querying and analysis from the Data Science degree.', related: [] },
  { order: 13, kind: 'skill', name: 'JavaScript', category: 'Languages & Databases', level: 85, detail: 'The language behind every front-end build and prototype.', related: ['E-Shopper Redesign', 'Model Portfolio Website', 'SIH 2026 Prototype'] },
  { order: 14, kind: 'skill', name: 'HTML/CSS', category: 'Languages & Databases', level: 90, detail: 'Responsive, accessible layouts from 360px phones to wide desktops.', related: ['E-Shopper Redesign', 'Web & Logic Development'] },
  { order: 15, kind: 'skill', name: 'Firestore', category: 'Languages & Databases', level: 75, detail: 'Document data for the production internship apps.', related: ['Procurement Management System'] },
  { order: 20, kind: 'skill', name: 'React.js', category: 'Frameworks', level: 90, detail: 'Component-driven UIs, hooks and state across the internship apps.', related: ['Multi-Brand Distributor Sales App', 'Procurement Management System', 'Natal-Care Form (Nataclare)'] },
  { order: 21, kind: 'skill', name: 'Next.js', category: 'Frameworks', level: 75, detail: 'Routing and server rendering for the Valencia intern and distributor apps.', related: ['Intern Performance Tracking Web App', 'Multi-Brand Distributor Sales App'] },
  { order: 22, kind: 'skill', name: 'Tailwind CSS', category: 'Frameworks', level: 90, detail: 'Fast, consistent styling for dashboards and forms.', related: ['Intern Performance Tracking Web App', 'Procurement Management System'] },
  { order: 23, kind: 'skill', name: 'Vite', category: 'Frameworks', level: 80, detail: 'Fast builds and dev servers for React projects.', related: ['Natal-Care Form (Nataclare)'] },
  { order: 30, kind: 'skill', name: 'Firebase', category: 'Tools & Platforms', level: 80, detail: 'Auth, Firestore and hosting for production internship apps.', related: ['Intern Performance Tracking Web App', 'Multi-Brand Distributor Sales App'] },
  { order: 31, kind: 'skill', name: 'Firebase AI', category: 'Tools & Platforms', level: 65, detail: 'Generative AI features wired into rapid prototypes.', related: ['GDG On Campus Vibe Coding Prototype'] },
  { order: 32, kind: 'skill', name: 'Stitch', category: 'Tools & Platforms', level: 65, detail: 'Prompt-to-interface prototyping.', related: ['GDG On Campus Vibe Coding Prototype'] },
  { order: 33, kind: 'skill', name: 'Git', category: 'Tools & Platforms', level: 75, detail: 'Branching and version control for every project.', related: [] },
  { order: 34, kind: 'skill', name: 'GitHub', category: 'Tools & Platforms', level: 75, detail: 'Code hosting and deploys from GitHub to Vercel.', related: ['E-Shopper Redesign', 'Model Portfolio Website'] },
  { order: 35, kind: 'skill', name: 'MS Office', category: 'Tools & Platforms', level: 80, detail: 'Documents, slides and reports.', related: [] },
  { order: 36, kind: 'skill', name: 'Advanced Excel', category: 'Tools & Platforms', level: 75, detail: 'Analysis, formulas and reporting.', related: [] },
  { order: 40, kind: 'skill', name: 'Generative AI', category: 'Core Competencies', level: 70, detail: 'Practical use of GenAI tools in prototyping and research.', related: ['GDG On Campus Vibe Coding Prototype'] },
  { order: 41, kind: 'skill', name: 'Data Science', category: 'Core Competencies', level: 70, detail: 'The degree I am studying: Python, R, SQL and statistics.', related: ['Behavioral & Invisible Tracking Research'] },
  { order: 42, kind: 'skill', name: 'Discrete Mathematics', category: 'Core Competencies', level: 65, detail: 'Logic, sets and graphs from coursework.', related: ['Web & Logic Development'] },
  { order: 43, kind: 'skill', name: 'Problem Solving', category: 'Core Competencies', level: 80, detail: 'Breaking big problems into shippable pieces.', related: [] },
  { order: 44, kind: 'skill', name: 'Analytical Thinking', category: 'Core Competencies', level: 75, detail: 'Reading data and tracking research with a critical eye.', related: ['Behavioral & Invisible Tracking Research'] },
  { order: 45, kind: 'skill', name: 'Adaptability', category: 'Core Competencies', level: 80, detail: 'Picking up new stacks fast, from Next.js to Firebase AI.', related: [] },
];

// Client-only content (not served by the API).
export const about = {
  intro: 'I am Karan, a data science student in Mumbai who builds full-stack web apps. Python, SQL and R by day; React, Next.js, Tailwind and Firebase by deadline. I have shipped four production apps in an internship, prototype fast with Firebase AI and Stitch, and care about data ethics and privacy.',
  stats: [
    { label: 'Projects', value: '11' },
    { label: 'Hackathons', value: '02' },
    { label: 'Internship', value: '01' },
    { label: 'Years learning', value: '02' }, // TODO: confirm
  ],
};

export const contact = {
  email: 'agentkaransapalia@gmail.com',
  github: 'https://github.com/karan-sapp67',
  linkedin: 'https://www.linkedin.com/in/karan-sapalia-9745a139a/',
  resume: '', // TODO: drop a PDF in client/public (e.g. /resume.pdf) and set the path
};

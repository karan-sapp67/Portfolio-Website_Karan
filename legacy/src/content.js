// ─────────────────────────────────────────────────────────────
// All editable site content lives here. Every TODO marks something to double-check.
// ─────────────────────────────────────────────────────────────

export const content = {
  name: 'Karan Sapalia',
  portrait: '/karan.jpg', // photo used in the hero collage and About section (put the file in /public)
  tagline: 'MERN Stack Developer & UI Designer',
  highlight: 'MERN Stack', // phrase in the tagline that gets the gradient
  bio: 'I am a MERN stack developer and UI designer studying Data Science in Mumbai. I build full-stack web apps with React, Next.js and Firebase, and I am exploring generative AI and data ethics along the way.',

  stats: [
    { value: 13, label: 'GitHub repositories' },
    { value: 4, label: 'Internship apps built' },
    { value: 1, label: 'Software internship' },
  ],

  // `hue` tints the generated preview art (0-360). Leave `live` or `github` empty to hide that link.
  projects: [
    {
      title: 'SIH 2026 Prototype',
      description: 'Proof-of-concept built for the Smart India Hackathon 2026.',
      tech: ['JavaScript', 'Vercel'],
      live: 'https://sih-2026-poc-xi.vercel.app',
      github: 'https://github.com/karan-sapp67/SIH_2026_POC',
      hue: 255,
    },
    {
      title: 'Intern Performance Tracker',
      description: 'Task assignment and performance portal with secure auth, submission validation and a gamified credit-reward system.',
      tech: ['Next.js', 'Tailwind CSS', 'Firebase'],
      live: '',
      github: 'https://github.com/karan-sapp67/Valencia-Intern-App',
      hue: 190,
    },
    {
      title: 'Procurement Management System',
      description: 'Supply chain app for purchase orders, vendor quotation comparison and automated PDF exports.',
      tech: ['React', 'Tailwind CSS', 'Firestore'],
      live: '',
      github: 'https://github.com/karan-sapp67/Valencia-Procurement-App',
      hue: 300,
    },
    {
      title: 'Sign Language to Speech',
      description: 'Real-time system that reads hand gestures from a webcam and speaks them aloud with a threaded text-to-speech pipeline.',
      tech: ['Python', 'MediaPipe', 'gTTS'],
      live: '',
      github: 'https://github.com/karan-sapp67/sign-language-detection-through-gtts',
      hue: 210,
    },
    {
      title: 'eShopper Redesign',
      description: 'Mobile and tablet optimisation plus a full visual redesign of an e-commerce storefront.',
      tech: ['JavaScript', 'Responsive UI', 'Vercel'],
      live: 'https://eshopperwebsite-redesign-redesign.vercel.app',
      github: 'https://github.com/karan-sapp67/eshopper_website-redesign',
      hue: 330,
    },
  ],

  skills: [
    'JavaScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Vite', 'HTML/CSS', 'Firebase', 'Firestore',
    'Python', 'R', 'SQL', 'Git & GitHub', 'Generative AI', 'Firebase AI', 'Stitch', 'Advanced Excel',
  ],

  // Add hackathons and certificates here. Leave `text` empty to hide the description.
  timeline: [
    { when: '2026', kind: 'Internship', title: 'Software Developer Intern, Valencia Nutrition Ltd.', text: '' },
    { when: '2025 – present', kind: 'Education', title: 'BSc Data Science', text: 'Atharva College of Hotel Management and Catering Technology.' },
  ],

  contact: {
    email: 'agentkaransapalia@gmail.com',
    github: 'https://github.com/karan-sapp67',
    linkedin: 'https://www.linkedin.com/in/karan-sapalia-9745a139a/',
    resume: '', // TODO: add a PDF to /public (e.g. '/resume.pdf') and put its path here to show the link
  },
};

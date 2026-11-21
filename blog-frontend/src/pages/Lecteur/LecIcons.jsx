/* Icônes SVG du côté lecteur (aucun emoji) */

const Svg = ({ size = 20, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Svg>
);

export const IconUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);

export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M12 6c-1.8-1.5-4.2-2-8-2v14c3.8 0 6.2.5 8 2 1.8-1.5 4.2-2 8-2V4c-3.8 0-6.2.5-8 2z" />
    <path d="M12 6v14" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const IconChat = (p) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" />
  </Svg>
);

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconStar = (p) => (
  <Svg {...p}>
    <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z" />
  </Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const IconArrow = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);

export const IconSparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
  </Svg>
);

/* Illustration d'un livre ouvert pour l'accueil */
export const BookIllustration = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 280 190"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse cx="140" cy="172" rx="108" ry="9" fill="#0f172a" opacity="0.07" />
    {/* page gauche */}
    <path
      d="M140 42C113 27 64 25 30 34v112c34-9 83-7 110 8z"
      fill="#ffffff"
      stroke="#4f46e5"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* page droite */}
    <path
      d="M140 42c27-15 76-17 110-8v112c-34-9-83-7-110 8z"
      fill="#eef2ff"
      stroke="#4f46e5"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M140 42v112" stroke="#4f46e5" strokeWidth="2" />
    {/* lignes de texte */}
    <g stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round">
      <path d="M50 58c22-3 46-2 72 7" />
      <path d="M50 74c22-3 46-2 72 7" />
      <path d="M50 90c22-3 46-2 72 7" />
      <path d="M50 106c22-3 46-2 72 7" />
      <path d="M50 122c16-2 34-1 52 4" />
    </g>
    {/* illustration page droite */}
    <circle cx="206" cy="68" r="13" fill="#4f46e5" opacity="0.9" />
    <path
      d="M158 126c18-26 34-34 50-20 12-12 26-10 36 4v18c-28-6-58-4-86-2z"
      fill="#4f46e5"
      opacity="0.18"
    />
    <path
      d="M158 126c18-26 34-34 50-20 12-12 26-10 36 4"
      stroke="#4f46e5"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
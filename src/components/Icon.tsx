import type { ReactNode } from 'react';

export type IconName =
  | 'overview'
  | 'repositories'
  | 'sync'
  | 'repair'
  | 'agents'
  | 'runs'
  | 'settings'
  | 'plus'
  | 'arrow'
  | 'shield'
  | 'external'
  | 'menu'
  | 'close'
  | 'branch'
  | 'clock'
  | 'check'
  | 'warning'
  | 'github'
  | 'gitlab'
  | 'codeberg'
  | 'git'
  | 'chevron';

const paths: Record<IconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
      <rect x="3" y="13" width="7" height="8" rx="1.5" />
    </>
  ),
  repositories: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5v15M8 7h8M8 11h6" />
    </>
  ),
  sync: (
    <>
      <path d="M20 7h-5l2.1-2.1A7 7 0 0 0 5 7" />
      <path d="M4 17h5l-2.1 2.1A7 7 0 0 0 19 17" />
      <path d="M20 7v4M4 17v-4" />
    </>
  ),
  repair: (
    <>
      <path d="M14.7 6.3a5 5 0 0 0-6.9 6.9l-4.2 4.2a2 2 0 0 0 2.8 2.8l4.2-4.2a5 5 0 0 0 6.9-6.9l-3 3-3.5-3.5z" />
    </>
  ),
  agents: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="3" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2M8 12h.01M16 12h.01M9 16h6" />
    </>
  ),
  runs: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5 16 12l-6 3.5z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  branch: (
    <>
      <circle cx="6" cy="4" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="20" r="2" />
      <path d="M6 6v12M18 8a6 6 0 0 1-6 6H8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  warning: (
    <>
      <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  github: (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.2A5.6 5.6 0 0 0 19.3 4a5.2 5.2 0 0 0-.1-3.9S18 0 15 2a13.4 13.4 0 0 0-7 0C5 0 3.8.1 3.8.1A5.2 5.2 0 0 0 3.7 4 5.6 5.6 0 0 0 2.2 8c0 5.6 3.5 6.8 6.8 7.2a3.4 3.4 0 0 0-1 2.6V22" />
  ),
  gitlab: (
    <path d="m12 22 8.7-6.3L18 3.2a.8.8 0 0 0-1.5 0L14.7 9h-5.4L7.5 3.2a.8.8 0 0 0-1.5 0L3.3 15.7 12 22zM9.3 9 12 22m2.7-13L12 22" />
  ),
  codeberg: <path d="M12 3a9 9 0 1 0 8.7 11.3H12L9.6 9.7A6 6 0 1 1 12 21" />,
  git: <path d="m12 3 9 9-9 9-9-9 9-9zM7.5 7.5l9 9M9 12h3v4" />,
  chevron: <path d="m9 18 6-6-6-6" />,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

import React from 'react';

/* Iconos de trazo (24x24). Heredan color con currentColor. */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (paths) => {
  const Icon = ({ size = 20, className = '', ...rest }) => (
    <svg {...base} width={size} height={size} className={className} {...rest}>
      {paths}
    </svg>
  );
  return Icon;
};

export const IconHome = make(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-5.5h4V20h5V9.5" />
  </>
);

export const IconChat = make(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z" />
    <path d="M8.5 8.5h7M8.5 11.5h4" />
  </>
);

export const IconChart = make(
  <>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="m7.5 15 3.5-4 3 2.5 4.5-6" />
  </>
);

export const IconPlan = make(
  <>
    <rect x="4" y="5" width="16" height="15" rx="2.5" />
    <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    <path d="m9 15 2 2 4-4" />
  </>
);

export const IconLogout = make(
  <>
    <path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </>
);

export const IconCheck = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);

export const IconSend = make(
  <>
    <path d="M20.5 3.5 10 14" />
    <path d="M20.5 3.5 14 20.5l-4-6.5-6.5-4z" />
  </>
);

export const IconDrop = make(<path d="M12 3.5c3.6 4.2 6 7.2 6 10.2a6 6 0 0 1-12 0c0-3 2.4-6 6-10.2z" />);

export const IconBowl = make(
  <>
    <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z" />
    <path d="M8 7.5c0-1.2 1-1.6 1-2.8M12 7.5c0-1.2 1-1.6 1-2.8M16 7.5c0-1.2 1-1.6 1-2.8" />
  </>
);

export const IconSun = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </>
);

export const IconMoon = make(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />);

export const IconDumbbell = make(
  <>
    <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
  </>
);

export const IconEgg = make(
  <path d="M12 3c3.6 0 6.5 5.2 6.5 9.5a6.5 6.5 0 0 1-13 0C5.5 8.2 8.4 3 12 3z" />
);

export const IconShield = make(
  <>
    <path d="M12 3 4.5 6v5.5c0 4.4 3 8 7.5 9.5 4.5-1.5 7.5-5.1 7.5-9.5V6z" />
    <path d="m8.8 12 2.4 2.4 4-4.4" />
  </>
);

export const IconFlame = make(
  <path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-3.4-2.2-5.6-3.8-7.6-.6-.8-1-1.800-1.100-2.900-2.800 1.400-5 4.300-5 7.200 0 .5.100 1 .3 1.400-.9-.3-1.600-1-1.900-2C5.700 11.800 5.500 13 5.500 14.500A6.500 6.500 0 0 0 12 21z" />
);

export const IconBolt = make(<path d="M13 3 5.500 13.500H11L10 21l8-11h-5.500z" />);

export const IconArrowRight = make(<path d="M5 12h14M13 6l6 6-6 6" />);

export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />);

export const IconAlert = make(
  <>
    <path d="M12 3.500 2.500 20h19z" />
    <path d="M12 10v4.500M12 17.200v.1" />
  </>
);

export const IconInfo = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.800v.1" />
  </>
);

export const IconSpark = make(
  <path d="M12 3.500c.8 4.200 2.300 5.700 6.500 6.500-4.200.8-5.700 2.300-6.500 6.500-.8-4.200-2.300-5.700-6.500-6.500 4.200-.8 5.700-2.300 6.500-6.500zM18.500 16.500c.3 1.500.8 2 2.300 2.300-1.500.3-2 .8-2.300 2.300-.3-1.500-.8-2-2.300-2.300 1.500-.3 2-.8 2.300-2.300z" />
);

import React from 'react';

const Brand = ({ tone = 'dark', size = 'md' }) => {
  const box = size === 'lg' ? 'w-10 h-10 rounded-xl' : 'w-9 h-9 rounded-[10px]';
  const text = size === 'lg' ? 'text-2xl' : 'text-xl';
  const onDark = tone === 'light';

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`${box} grid place-items-center ${
          onDark ? 'bg-leaf-400/20 text-leaf-200 ring-1 ring-inset ring-white/15' : 'bg-pine-800 text-white'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12.5h4l2.2-6 3.6 11.500 2.400-5.500H21" />
        </svg>
      </span>
      <span className={`font-display font-semibold tracking-tight ${text} ${onDark ? 'text-white' : 'text-pine-900'}`}>
        NutriLife
      </span>
    </div>
  );
};

export default Brand;

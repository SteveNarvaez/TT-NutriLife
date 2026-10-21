import React from 'react';
import { IconAlert, IconCheck, IconInfo } from './Icons';

const tones = {
  error:   { box: 'bg-rose-100 text-rose-600 border-rose-600/20', icon: IconAlert },
  warning: { box: 'bg-amber-100 text-amber-700 border-amber-600/25', icon: IconAlert },
  success: { box: 'bg-leaf-50 text-pine-800 border-leaf-500/30', icon: IconCheck },
  info:    { box: 'bg-tide-100 text-tide-700 border-tide-600/20', icon: IconInfo },
};

const Notice = ({ tone = 'info', title, children, className = '' }) => {
  const { box, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm animate-fade ${box} ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <p className={title ? 'opacity-90' : ''}>{children}</p>}
      </div>
    </div>
  );
};

export default Notice;

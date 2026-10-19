import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'mark-only' | 'full-lockup';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md',
  variant = 'horizontal',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'full-lockup') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <img
          src="/logo.png"
          alt="Enersense Logo"
          className="h-16 w-auto object-contain dark:hidden"
        />
        <img
          src="/logo-dark.png"
          alt="Enersense Logo"
          className="h-16 w-auto object-contain hidden dark:block"
        />
        {showTagline && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            Understand Your Energy. Predict Your Bill. Save More.
          </span>
        )}
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <img
          src="/logo-icon.png"
          alt="Enersense Icon"
          className="w-full h-full object-contain dark:hidden drop-shadow-sm"
        />
        <img
          src="/logo-icon-dark.png"
          alt="Enersense Icon"
          className="w-full h-full object-contain hidden dark:block drop-shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Enersense E-Lightning Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <img
          src="/logo-icon.png"
          alt="Enersense Bolt Mark"
          className="w-full h-full object-contain dark:hidden drop-shadow-sm"
        />
        <img
          src="/logo-icon-dark.png"
          alt="Enersense Bolt Mark"
          className="w-full h-full object-contain hidden dark:block drop-shadow-sm"
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-black uppercase tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            ENER<span className="text-emerald-500">SENSE</span>
          </span>
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 rounded-md border border-emerald-300/40">
            AI
          </span>
        </div>
      </div>
    </div>
  );
};

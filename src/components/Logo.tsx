import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon-only' | 'full' | 'horizontal';
  className?: string;
  showSubtitle?: boolean;
  customLogoUrl?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = '',
  showSubtitle = false,
  customLogoUrl,
  onClick,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (customLogoUrl) return customLogoUrl;
    try {
      const saved = localStorage.getItem('nrityasana_custom_logo');
      if (saved) return saved;
    } catch {}
    return '/logo.jpg';
  });

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (customLogoUrl) {
      setLogoSrc(customLogoUrl);
      setHasError(false);
    }
  }, [customLogoUrl]);

  // Listen for storage changes across components
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('nrityasana_custom_logo');
        if (saved) {
          setLogoSrc(saved);
          setHasError(false);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', container: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-xl', container: 'gap-2.5' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl', container: 'gap-3' },
    xl: { icon: 'w-24 h-24', text: 'text-3xl', container: 'gap-4' },
  };

  const config = sizeMap[size];

  // Natural emblem rendering: as-is, natural transparency, no mix-blend-multiply
  const emblem = (
    <div
      className={`relative ${config.icon} flex items-center justify-center shrink-0 transition-transform ${
        onClick ? 'hover:scale-105 cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {!hasError ? (
        <img
          src={logoSrc}
          alt="Nrityasana Logo"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain drop-shadow-2xs rounded-lg"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-[#B8543F] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
          N
        </div>
      )}
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        title={onClick ? 'Click to customize logo & theme' : undefined}
      >
        {emblem}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`flex flex-col items-center text-center ${config.container} ${className} ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        <div className="p-1 flex items-center justify-center">
          {emblem}
        </div>
        <div>
          <h1 className={`font-serif font-bold text-[#1F161A] tracking-tight ${config.text}`}>
            Nrityasana
          </h1>
          {showSubtitle && (
            <p className="text-xs text-[#7D6D73] font-medium tracking-wide mt-0.5">
              Yoga & Indian Classical Dance
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div
      className={`inline-flex items-center ${config.container} ${className} ${
        onClick ? 'cursor-pointer group' : ''
      }`}
      onClick={onClick}
      title={onClick ? 'Click to customize logo & theme' : undefined}
    >
      {emblem}
      <div className="flex flex-col">
        <span className={`font-serif font-bold text-[#1F161A] tracking-tight ${config.text} leading-tight`}>
          Nrityasana
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-[#7D6D73] font-medium tracking-wider uppercase mt-0.5">
            Yoga & Classical Dance
          </span>
        )}
      </div>
    </div>
  );
};

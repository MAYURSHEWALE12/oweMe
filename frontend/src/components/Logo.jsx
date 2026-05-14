export function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="0.6" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
      <path d="M10 12c0-1.1.9-2 2-2h8a2 2 0 012 2v1l-6 3-6-3v-1z" fill="#fff" opacity="0.9" />
      <path d="M10 14.5l6 3 6-3V18a2 2 0 01-2 2H12a2 2 0 01-2-2v-3.5z" fill="#fff" />
      <path d="M14 16l2 1.5L18 16" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function LogoFull({ size = 24, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} />
      {showText && <span className="font-bold text-lg" style={{ color: 'inherit' }}>OweMe</span>}
    </div>
  );
}

export function LogoHorizontal({ size = 28, dark = false }) {
  return (
    <div className={`flex items-center gap-2.5`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="hGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="0.6" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#hGrad)" />
        <path d="M10 12c0-1.1.9-2 2-2h8a2 2 0 012 2v1l-6 3-6-3v-1z" fill="#fff" opacity="0.9" />
        <path d="M10 14.5l6 3 6-3V18a2 2 0 01-2 2H12a2 2 0 01-2-2v-3.5z" fill="#fff" />
        <path d="M14 16l2 1.5L18 16" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className={`font-bold text-xl ${dark ? 'text-white' : 'text-gray-900'}`}>OweMe</span>
    </div>
  );
}

export function LogoFavicon() {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs><linearGradient id="g" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#3b82f6"/><stop offset="0.6" stopColor="#8b5cf6"/><stop offset="1" stopColor="#06b6d4"/></linearGradient></defs>
      <rect width="32" height="32" rx="8" fill="url(#g)"/>
      <path d="M10 12c0-1.1.9-2 2-2h8a2 2 0 012 2v1l-6 3-6-3v-1z" fill="#fff" opacity="0.9"/>
      <path d="M10 14.5l6 3 6-3V18a2 2 0 01-2 2H12a2 2 0 01-2-2v-3.5z" fill="#fff"/>
      <path d="M14 16l2 1.5L18 16" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>`
  )}`;
}
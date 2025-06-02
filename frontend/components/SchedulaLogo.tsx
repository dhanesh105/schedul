import React from 'react';

interface SchedulaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
  showSubtitle?: boolean;
}

const SchedulaLogo: React.FC<SchedulaLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true
}) => {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      container: 'p-2',
      title: 'text-lg',
      subtitle: 'text-xs'
    },
    md: {
      icon: 'w-8 h-8',
      container: 'p-3',
      title: 'text-3xl',
      subtitle: 'text-xs'
    },
    lg: {
      icon: 'w-10 h-10',
      container: 'p-4',
      title: 'text-4xl',
      subtitle: 'text-sm'
    },
    xl: {
      icon: 'w-12 h-12',
      container: 'p-5',
      title: 'text-5xl',
      subtitle: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  const LogoIcon = () => (
    <div className="relative group animate-subtle-float">
      {/* Glowing background effect with enhanced animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-xl blur-lg animate-glow-pulse group-hover:animate-medical-glow transition-all duration-500"></div>

      {/* Logo container with medical glow */}
      <div className={`relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl ${currentSize.container} border border-white/20 shadow-2xl group-hover:shadow-emerald-500/20 transition-all duration-300`}>
        {/* Medical Cross + Stethoscope Combined Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className={`${currentSize.icon} text-white drop-shadow-lg group-hover:animate-medical-heartbeat transition-all duration-300`}
          fill="currentColor"
        >
          {/* Medical Cross - Main symbol */}
          <path
            d="M14 2h4v8h8v4h-8v8h8v4h-8v4h-4v-4H6v-4h8v-8H6V10h8V2z"
            className="opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Stethoscope accent - Professional touch */}
          <circle
            cx="24"
            cy="8"
            r="2"
            className="opacity-80 group-hover:opacity-90 transition-opacity duration-300"
          />
          <path
            d="M22 8c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.4 1.5-1 1.8v2.4c0 2.2-1.8 4-4 4h-1v2h1c3.3 0 6-2.7 6-6v-2.4c.6-.3 1-1 1-1.8 0-1.7-1.3-3-3-3s-3 1.3-3 3z"
            className="opacity-70 group-hover:opacity-80 transition-opacity duration-300"
          />

          {/* Heartbeat line accent - Life and vitality */}
          <path
            d="M2 20h4l2-4 2 8 2-4h4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="opacity-60 group-hover:opacity-75 transition-opacity duration-300"
          />

          {/* Additional medical elements for elegance */}
          <circle
            cx="8"
            cy="8"
            r="1"
            className="opacity-40 group-hover:opacity-60 transition-opacity duration-300"
          />
          <circle
            cx="24"
            cy="24"
            r="1"
            className="opacity-40 group-hover:opacity-60 transition-opacity duration-300"
          />
        </svg>
      </div>

      {/* Enhanced pulse animation with medical theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl opacity-20 animate-pulse group-hover:opacity-30 transition-opacity duration-300"></div>
    </div>
  );

  const LogoText = () => (
    <div className="flex flex-col group-hover:transform group-hover:scale-105 transition-transform duration-300">
      <h1 className={`${currentSize.title} font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-200 bg-clip-text text-transparent leading-tight group-hover:from-emerald-200 group-hover:via-cyan-200 group-hover:to-white transition-all duration-500`}>
        Schedula
      </h1>
      {showSubtitle && (
        <p className={`${currentSize.subtitle} text-cyan-200/80 font-medium tracking-wider uppercase group-hover:text-emerald-200/90 transition-colors duration-300`}>
          <span className="inline-flex items-center">
            <span className="w-1 h-1 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            Medical Scheduling
            <span className="w-1 h-1 bg-cyan-400 rounded-full ml-2 animate-pulse"></span>
          </span>
        </p>
      )}
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={className}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={className}>
        <LogoText />
      </div>
    );
  }

  return (
    <div className={`flex items-center group ${className}`}>
      <div className="mr-4">
        <LogoIcon />
      </div>
      <LogoText />
    </div>
  );
};

export default SchedulaLogo;

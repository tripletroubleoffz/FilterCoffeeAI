'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Atmosphere = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

interface AtmosphereContextType {
  atmosphere: Atmosphere;
  gradientClass: string;
  label: string;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  atmosphere: 'NIGHT',
  gradientClass: 'bg-gradient-to-b from-[#050302] via-[#0b0504] to-[#020101]',
  label: 'Deep Espresso Mode',
});

export function CafeAtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('NIGHT');
  
  useEffect(() => {
    const updateAtmosphere = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setAtmosphere('MORNING');
      } else if (hour >= 12 && hour < 17) {
        setAtmosphere('AFTERNOON');
      } else if (hour >= 17 && hour < 21) {
        setAtmosphere('EVENING');
      } else {
        setAtmosphere('NIGHT');
      }
    };

    updateAtmosphere();
    const interval = setInterval(updateAtmosphere, 60000);
    return () => clearInterval(interval);
  }, []);

  const getGradientClass = () => {
    switch (atmosphere) {
      case 'MORNING':
        return 'bg-gradient-to-b from-[#0d0705] via-[#180c09] to-[#070403]';
      case 'AFTERNOON':
        return 'bg-gradient-to-b from-[#120d0b] via-[#1d1310] to-[#090605]';
      case 'EVENING':
        return 'bg-gradient-to-b from-[#090504] via-[#120907] to-[#040202]';
      case 'NIGHT':
      default:
        return 'bg-gradient-to-b from-[#040201] via-[#080403] to-[#010101]';
    }
  };

  const getAtmosphereLabel = () => {
    switch (atmosphere) {
      case 'MORNING':
        return 'Sunrise Intelligence Café';
      case 'AFTERNOON':
        return 'Bright Workspace Mode';
      case 'EVENING':
        return 'Luxury Coffee Lounge';
      case 'NIGHT':
      default:
        return 'Deep Espresso Mode';
    }
  };

  return (
    <AtmosphereContext.Provider 
      value={{ 
        atmosphere, 
        gradientClass: getGradientClass(), 
        label: getAtmosphereLabel() 
      }}
    >
      <div className={`min-h-screen transition-all duration-1000 ${getGradientClass()} text-f4eae4`}>
        {children}
      </div>
    </AtmosphereContext.Provider>
  );
}

export const useCafeAtmosphere = () => useContext(AtmosphereContext);

import React from 'react';
import BrewingLoader from '@/components/BrewingLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070403] flex flex-col items-center justify-center">
      <BrewingLoader message="Brewing your intelligence lounge..." size="lg" />
    </div>
  );
}

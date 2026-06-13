import React from 'react';
import BrewingLoader from '@/components/BrewingLoader';

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center">
      <BrewingLoader message="Preparing fresh roast data..." size="md" />
    </div>
  );
}

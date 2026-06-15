import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FilterCoffee.ai',
    short_name: 'FilterCoffee',
    description: 'Brewed Intelligence for Professionals',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0604',
    theme_color: '#c28854',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

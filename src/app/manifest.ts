import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bakes by Coral',
    short_name: 'Bakes by Coral',
    description: 'Handcrafted gluten-free cookies and custom cakes in Cincinnati, OH',
    start_url: '/',
    display: 'browser',
    background_color: '#F7F3ED',
    theme_color: '#541409',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

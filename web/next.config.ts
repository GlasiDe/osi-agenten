import type { NextConfig } from 'next';

const config: NextConfig = {
  // Das Spiel liegt statisch unter /spiel/ (aus ../spiel kopiert) – ohne Dateinamen auf index.html leiten
  async redirects() {
    return [
      { source: '/spiel', destination: '/spiel/index.html', permanent: false },
      { source: '/spiel/', destination: '/spiel/index.html', permanent: false },
      { source: '/einsatzzentrale', destination: '/lehrkraft/einsatzzentrale.html', permanent: false }
    ];
  },
  async headers() {
    return [{
      source: '/:pfad*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }];
  }
};
export default config;

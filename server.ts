import fs from 'fs';
import path from 'path';

const bundlePath = path.join(process.cwd(), 'dist', 'server.bundle.js');

// When deployed on Cloud Run or in production, run the bundled production server
if (process.env.NODE_ENV === 'production' || fs.existsSync(bundlePath)) {
  await import('./dist/server.bundle.js');
} else {
  // In local development fallback, load the dev server with Vite middleware
  await import('./server-main.ts');
}

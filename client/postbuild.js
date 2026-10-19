import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

const indexHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('[postbuild] dist/index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// List of all SPA routes to generate physical files for bulletproof static hosting on Vercel
const routes = [
  'login',
  'register',
  'app',
  'app/meter-scanner',
  'app/bills',
  'app/appliances',
  'app/ai-advisor',
  'app/prediction',
  'app/history',
  'app/goals',
  'app/reports',
  'app/iot',
  'app/settings',
];

// 1. Create 404.html
fs.writeFileSync(path.join(distDir, '404.html'), indexContent);

// 2. Create directory index.html and root .html for each route
for (const r of routes) {
  const routeDir = path.join(distDir, r);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent);

  // Also create flat .html (e.g. dist/register.html)
  const flatHtml = path.join(distDir, `${r}.html`);
  const flatParent = path.dirname(flatHtml);
  fs.mkdirSync(flatParent, { recursive: true });
  fs.writeFileSync(flatHtml, indexContent);
}

console.log(`[postbuild] Generated static SPA entrypoints for ${routes.length} routes + 404.html`);

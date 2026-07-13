import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 20000 });
await page.screenshot({ path: '/tmp/landing.png' });
console.log('Landing OK');

await page.goto('http://localhost:3100/catalogo', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.screenshot({ path: '/tmp/catalogo.png' });
console.log('Catalogo OK');

await page.goto('http://localhost:3100/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.screenshot({ path: '/tmp/login.png' });
console.log('Login OK');

await browser.close();

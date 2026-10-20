const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const targetDir = process.argv[2] || path.join(__dirname, '..', 'screenshots', 'before');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const pages = [
  { name: 'home', url: 'https://crochus.netlify.app/' },
  { name: 'shop', url: 'https://crochus.netlify.app/shop' },
  { name: 'product', url: 'https://crochus.netlify.app/product/red-crochet' },
  { name: 'about', url: 'https://crochus.netlify.app/about' },
  { name: 'contact', url: 'https://crochus.netlify.app/contact' },
  { name: 'wishlist', url: 'https://crochus.netlify.app/wishlist' },
  { name: 'login', url: 'https://crochus.netlify.app/login' },
  { name: 'admin_login', url: 'https://crochus.netlify.app/admin' },
  { name: 'not_found', url: 'https://crochus.netlify.app/not-found' }
];

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 414, height: 896 },
  { width: 390, height: 844 },
  { width: 360, height: 780 }
];

async function run() {
  console.log(`Starting screenshot capture into ${targetDir}...`);
  for (const page of pages) {
    for (const vp of viewports) {
      const outPath = path.join(targetDir, `${page.name}_${vp.width}.png`);
      const tempUserDir = path.join(os.tmpdir(), `chrome_shot_${Date.now()}_${Math.random().toString(36).substring(7)}`);
      
      const args = [
        '--headless=new',
        `--user-data-dir=${tempUserDir}`,
        `--window-size=${vp.width},${vp.height}`,
        '--virtual-time-budget=2000',
        '--hide-scrollbars',
        `--screenshot=${outPath}`,
        page.url
      ];

      try {
        execFileSync(CHROME_PATH, args, { stdio: 'ignore' });
        const stat = fs.statSync(outPath);
        console.log(`[OK] ${page.name} @ ${vp.width}px (${Math.round(stat.size / 1024)} KB)`);
      } catch (err) {
        console.error(`[FAIL] ${page.name} @ ${vp.width}px:`, err.message);
      } finally {
        try {
          fs.rmSync(tempUserDir, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  }
  console.log('Finished capturing all screenshots!');
}

run();

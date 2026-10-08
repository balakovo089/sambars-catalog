const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  for (const [svg, png] of [['fal_v1.svg','fal_v1.png'],['fal_v2.svg','fal_v2.png']]) {
    const url = 'file://' + path.resolve('/root/.openclaw/workspace', svg);
    await page.setViewport({ width: 2048, height: 1024, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: '/root/.openclaw/workspace/' + png, type: 'png' });
    console.log('OK', png);
  }
  await browser.close();
})();

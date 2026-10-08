const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const base = 'file://' + path.resolve(__dirname, 'strender.html');
  for (const dir of ['right','left']) {
    await page.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 3 });
    await page.goto(base + '?dir=' + dir, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `/root/.openclaw/workspace/strender_${dir}.png`, type: 'png' });
    console.log('OK', dir);
  }
  await browser.close();
})();

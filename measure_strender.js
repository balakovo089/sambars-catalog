const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1500 });
  await page.goto('file://' + path.resolve(__dirname, 'strender.html'), { waitUntil: 'networkidle0' });
  const info = await page.evaluate(() => {
    const sel = ['.brand','.brandsub','.big','.phone','.site','.addr'];
    const out = { bodyScrollW: document.body.scrollWidth, items: {} };
    sel.forEach(s => {
      const el = document.querySelector(s);
      if (el) out.items[s] = { text: el.textContent.trim(), scrollW: el.scrollWidth, clientW: el.clientWidth };
    });
    document.querySelectorAll('.usp .row').forEach((r, i) => {
      const t = r.querySelector('.txt');
      out.items['row'+i] = { text: t.textContent.trim(), scrollW: r.scrollWidth, clientW: r.clientWidth, lines: Math.round(r.getBoundingClientRect().height / parseInt(getComputedStyle(t).fontSize)) };
    });
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();

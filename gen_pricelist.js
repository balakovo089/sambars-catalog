#!/usr/bin/env node
/**
 * gen_pricelist.js — генерирует pricelist.json из cutmap (BATCH_MODE)
 * 
 * Запуск: node gen_pricelist.js
 * 
 * 1. Открывает cutmap/index.html?batch=1 в headless Chrome
 * 2. Ждёт JSON-вывод (batchRun() выводит в <pre>)
 * 3. Сохраняет в pricelist.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CUTMAP_URL = process.env.CUTMAP_URL || 'https://balakovo089.github.io/sambars-catalog/tools/cutmap/?batch=1';
const OUTPUT = path.join(__dirname, 'pricelist.json');
const TIMEOUT = 60000; // 60 seconds max

(async () => {
  console.log('🚀 Запускаю headless Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT);
    
    // Suppress console noise
    page.on('console', () => {});
    page.on('pageerror', err => console.error('Page error:', err.message));
    
    console.log(`📡 Открываю: ${CUTMAP_URL}`);
    await page.goto(CUTMAP_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT });

    // Wait for JSON output in <pre> tag
    console.log('⏳ Жду расчёт batch...');
    await page.waitForSelector('pre', { timeout: TIMEOUT });
    
    // Give a tiny bit more time for any async DOM updates
    await new Promise(r => setTimeout(r, 500));
    
    const text = await page.$eval('pre', el => el.textContent);
    
    if (!text || text.trim().length < 10) {
      throw new Error('Empty or too short output from batch');
    }
    
    const data = JSON.parse(text);
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid output: not an array or empty');
    }
    
    // Write pretty JSON
    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf8');
    
    // Stats
    const byBrand = {};
    const byKit = {};
    data.forEach(r => {
      byBrand[r.brand] = (byBrand[r.brand] || 0) + 1;
      byKit[r.kitName] = (byKit[r.kitName] || 0) + 1;
    });
    
    console.log(`✅ Сохранено ${data.length} записей в ${OUTPUT}`);
    console.log('   По брендам:', JSON.stringify(byBrand));
    console.log('   По комплектациям:', JSON.stringify(byKit));
    
    // Show a few samples
    console.log('\n📊 Примеры:');
    data.filter(r => r.kit === 4).slice(0, 5).forEach(r => {
      console.log(`   ${r.model} (${r.axles}ось): себ.${r.cost.toLocaleString()}₽ → розн.${r.retail.toLocaleString()}₽ (маржа ${r.marginPctRetail}%)`);
    });
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('🔒 Браузер закрыт');
  }
})();

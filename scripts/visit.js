const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:3000';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    try {
      const args = msg.args().map(a => a._remoteObject && a._remoteObject.preview ? a._remoteObject.preview : a.toString());
      console.log('BROWSER:', msg.type(), args.join(' '));
    } catch (e) {
      console.log('BROWSER:', msg.type(), msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    console.log('Visiting root');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(800);

    console.log('Visiting /register');
    await page.goto(url + '/register', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(800);

    console.log('Visiting /login');
    await page.goto(url + '/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(800);

    console.log('Visiting /settings');
    await page.goto(url + '/settings', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(800);

  } catch (e) {
    console.error('SCRIPT ERROR:', e && e.stack ? e.stack : e);
  } finally {
    await browser.close();
  }
})();

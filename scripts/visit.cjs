const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:3000';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', async msg => {
    try {
      const vals = await Promise.all(msg.args().map(async a => {
        try { return await a.jsonValue(); } catch (e) { return a.toString(); }
      }));
      console.log('BROWSER:', msg.type(), vals.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(' '));
    } catch (e) {
      try { console.log('BROWSER:', msg.type(), msg.text()); } catch (err) { console.log('BROWSER:', msg.type()); }
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    // Inject global capture for errors and console.error to collect richer info
    await page.evaluateOnNewDocument(() => {
      window.__capturedErrors = [];
      window.addEventListener('error', (e) => {
        try {
          window.__capturedErrors.push({ message: e.message, stack: (e.error && e.error.stack) || null, filename: e.filename, lineno: e.lineno });
        } catch (err) {}
      });
      const origErr = console.error;
      console.error = function(...args) {
        try {
          const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          const stack = (args[0] && args[0].stack) || null;
          window.__capturedErrors.push({ message: msg, stack });
        } catch (e) {}
        origErr.apply(console, args);
      };
    });

    console.log('Visiting root');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    const rootErrors = await page.evaluate(() => window.__capturedErrors || []);
    if (rootErrors.length) console.log('CAPTURED ERRORS (root):', JSON.stringify(rootErrors, null, 2));

    console.log('Visiting /register');
    await page.goto(url + '/register', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    const regErrors = await page.evaluate(() => window.__capturedErrors || []);
    if (regErrors.length) console.log('CAPTURED ERRORS (/register):', JSON.stringify(regErrors, null, 2));

    console.log('Visiting /login');
    await page.goto(url + '/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    const loginErrors = await page.evaluate(() => window.__capturedErrors || []);
    if (loginErrors.length) console.log('CAPTURED ERRORS (/login):', JSON.stringify(loginErrors, null, 2));

    console.log('Visiting /settings');
    await page.goto(url + '/settings', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    const setErrors = await page.evaluate(() => window.__capturedErrors || []);
    if (setErrors.length) console.log('CAPTURED ERRORS (/settings):', JSON.stringify(setErrors, null, 2));

  } catch (e) {
    console.error('SCRIPT ERROR:', e && e.stack ? e.stack : e);
  } finally {
    await browser.close();
  }
})();

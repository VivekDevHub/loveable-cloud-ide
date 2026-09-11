import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const IMAGES_DIR = path.resolve('docs/images');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1512,982', '--disable-web-security'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();

  console.log('1. Capturing Sign In Screen (/login)...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(IMAGES_DIR, 'login_ui.png'), type: 'png' });
  console.log('Saved login_ui.png');

  console.log('2. Capturing Registration Screen (/register)...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(IMAGES_DIR, 'register_ui.png'), type: 'png' });
  console.log('Saved register_ui.png');

  console.log('3. Authenticating user...');
  const randomSuffix = Math.floor(Math.random() * 10000);
  const testEmail = `developer${randomSuffix}@loveable.dev`;
  const testPassword = 'Password123!';

  // Fill in registration form
  await page.type('input[name="name"]', 'Alex Developer');
  await page.type('input[name="email"]', testEmail);
  await page.type('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');

  // Wait for redirect to /projects
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 });
  } catch {
    console.log('Wait navigation timeout, continuing to /projects...');
  }
  await sleep(1500);

  console.log('Current URL after auth:', page.url());

  console.log('4. Capturing Projects Dashboard (/projects)...');
  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle0' });
  await sleep(2000);

  // Capture projects dashboard (empty or initial state)
  console.log('Opening create project modal...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.toLowerCase().includes('project')) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({ path: path.join(IMAGES_DIR, 'create_project_modal.png'), type: 'png' });
  console.log('Saved create_project_modal.png');

  // Type project name
  const input = await page.$('input[name="title"]');
  if (input) {
    await input.type('E-Commerce Autonomous AI SaaS');
    await sleep(400);
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(2500);
    }
  }

  // Capture projects dashboard with project card
  await page.screenshot({ path: path.join(IMAGES_DIR, 'projects_ui.png'), type: 'png' });
  console.log('Saved projects_ui.png');

  // 5. Open the project workspace
  console.log('5. Navigating to project workspace Cloud IDE...');
  const projectLink = await page.$('a[href*="/projects/"]');
  if (projectLink) {
    await projectLink.click();
  } else {
    // If link not found, fetch projects from API or page
    const href = await page.evaluate(() => {
      const a = document.querySelector('a[href*="/projects/"]');
      return a ? a.getAttribute('href') : null;
    });
    if (href) {
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle0' });
    }
  }

  console.log('Waiting for workspace to load...');
  await sleep(5000);
  console.log('Workspace URL:', page.url());

  // Wait for file tree or editor to load
  await sleep(3000);

  // Let's click on a file if available
  try {
    const fileNodes = await page.$$('div[role="treeitem"], [data-arborist-node], span');
    for (const node of fileNodes) {
      const text = await page.evaluate((el) => el.textContent, node);
      if (text && (text.includes('package.json') || text.includes('page.tsx') || text.includes('README.md') || text.includes('layout.tsx'))) {
        await node.click();
        break;
      }
    }
  } catch (e) {
    console.log('Clicking file node skipped:', e.message);
  }
  await sleep(2000);

  // Capture Cloud IDE workspace
  console.log('Capturing Cloud IDE workspace (Code Editor Mode)...');
  await page.screenshot({ path: path.join(IMAGES_DIR, 'workspace_ui.png'), type: 'png' });
  await page.screenshot({ path: path.join(IMAGES_DIR, 'workspace_ui.jpg'), type: 'jpeg', quality: 90 });
  console.log('Saved workspace_ui.png and workspace_ui.jpg');

  // 6. Switch to Live Preview Mode
  console.log('6. Switching to Live Preview Mode...');
  const previewButtons = await page.$$('button');
  for (const btn of previewButtons) {
    const title = await page.evaluate((el) => el.getAttribute('title') || el.textContent, btn);
    if (title && (title.includes('Show preview') || title.includes('Preview'))) {
      await btn.click();
      console.log('Clicked Preview toggle button');
      break;
    }
  }
  await sleep(4000);

  console.log('Capturing Live Preview UI...');
  await page.screenshot({ path: path.join(IMAGES_DIR, 'preview_ui.png'), type: 'png' });
  await page.screenshot({ path: path.join(IMAGES_DIR, 'preview_ui.jpg'), type: 'jpeg', quality: 90 });
  console.log('Saved preview_ui.png and preview_ui.jpg');

  // Also capture the standalone Next.js live preview screen at port 3002
  console.log('7. Capturing standalone live preview screen (http://localhost:3002)...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.screenshot({ path: path.join(IMAGES_DIR, 'live_preview_screen.png'), type: 'png' });
  console.log('Saved live_preview_screen.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

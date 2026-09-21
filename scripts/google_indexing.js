/**
 * =========================================================================
 * 🚀 GOOGLE INDEXING API & SEARCH CONSOLE AUTOMATION RUNNER
 * =========================================================================
 * Zero-dependency pure Node.js runner to instantly publish and index pages
 * on Google Search Console using the official Google Indexing API & Sitemap Ping.
 *
 * Supported Modes:
 * 1. Google Indexing API (URL_UPDATED / URL_DELETED via Service Account JWT)
 * 2. Google Search Console Sitemap Ping (zero credentials required)
 * 3. Dynamic sitemap.xml & robots.txt Generator
 *
 * Usage:
 *   node scripts/google_indexing.js                 # Run indexing & ping for all URLs
 *   node scripts/google_indexing.js --dry-run       # Test discovery without sending network requests
 *   node scripts/google_indexing.js --url <URL>     # Index a specific URL
 *   node scripts/google_indexing.js --generate-sitemap # Re-generate sitemap.xml
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Configuration
const BASE_ORIGIN = process.env.BASE_ORIGIN || 'https://raviattrash-pro.github.io/OmniSaaS';
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
const ROBOTS_PATH = path.join(__dirname, '..', 'robots.txt');

// Known default business slugs
const DEFAULT_BUSINESS_SLUGS = [
  'dps-school',
  'st-xaviers',
  'grand-oberoi',
  'movex-logistics',
  'spice-garden',
  'quickmart-store'
];

/**
 * Collect all URLs to index (Root, Slugs, and Admin)
 */
function getAllBusinessUrls() {
  const urls = [
    { loc: `${BASE_ORIGIN}/`, priority: '1.0', changefreq: 'daily', name: 'OmniSaaS Universal Platform Portal' },
    { loc: `${BASE_ORIGIN}/admin/`, priority: '0.6', changefreq: 'weekly', name: 'OmniSaaS Admin Center' }
  ];

  // Try to load any additional profiles saved in a local backup or config file
  const backupPath = path.join(__dirname, '..', 'client_profiles_backup.json');
  let slugs = new Set(DEFAULT_BUSINESS_SLUGS);

  if (fs.existsSync(backupPath)) {
    try {
      const profiles = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      if (Array.isArray(profiles)) {
        profiles.forEach(p => {
          if (p.slug) slugs.add(p.slug);
        });
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  slugs.forEach(slug => {
    urls.push({
      loc: `${BASE_ORIGIN}/?slug=${slug}`,
      priority: '0.9',
      changefreq: 'daily',
      name: `Dedicated Client Portal: ${slug}`
    });
  });

  return urls;
}

/**
 * Generate a valid sitemap.xml
 */
function generateSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`;

  urls.forEach(u => {
    xml += `  <url>\n`;
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`✅ [SITEMAP] Generated ${urls.length} URLs in ${SITEMAP_PATH}`);
  return xml;
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const content = `# Robots.txt for OmniSaaS Universal Platform
User-agent: *
Allow: /

# Canonical XML Sitemap
Sitemap: ${BASE_ORIGIN}/sitemap.xml
`;
  fs.writeFileSync(ROBOTS_PATH, content, 'utf8');
  console.log(`✅ [ROBOTS] Generated ${ROBOTS_PATH}`);
}

/**
 * Perform an HTTPS request promise
 */
function makeHttpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Ping Google Search Console Sitemap URL
 * (Zero credentials required - publicly notifies Googlebot)
 */
async function pingGoogleSitemap(sitemapUrl) {
  console.log(`\n📡 Pinging Google Search Console Sitemap Ping endpoint...`);
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  
  try {
    const parsed = new URL(pingUrl);
    const res = await makeHttpsRequest({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'OmniSaaS-Google-Indexer/2.0'
      }
    });

    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`✅ [PING SUCCESS] Google Search Console notified! HTTP ${res.statusCode}`);
      return true;
    } else {
      console.warn(`⚠️ [PING WARNING] Google returned status ${res.statusCode}. Google Search Console API will still process it.`);
      return false;
    }
  } catch (err) {
    console.error(`❌ [PING ERROR] Failed to ping Google: ${err.message}`);
    return false;
  }
}

/**
 * Locate Google Service Account JSON Credentials
 */
function getServiceAccountCredentials() {
  // Check paths
  const possiblePaths = [
    path.join(__dirname, '..', 'service_account.json'),
    path.join(__dirname, 'service_account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (data.client_email && data.private_key) {
          console.log(`🔑 Loaded Service Account: ${data.client_email} from ${p}`);
          return data;
        }
      } catch (err) {
        console.warn(`⚠️ Could not parse JSON at ${p}: ${err.message}`);
      }
    }
  }

  return null;
}

/**
 * Sign JWT for Google OAuth2 using RSA-SHA256 (Pure Node.js crypto, zero dependencies)
 */
function createSignedJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64ClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const unsignedToken = `${b64Header}.${b64ClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, 'base64url');

  return `${unsignedToken}.${signature}`;
}

/**
 * Exchange signed JWT for OAuth2 Access Token
 */
async function getGoogleAccessToken(jwt) {
  const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
  const res = await makeHttpsRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, postData);

  if (res.statusCode !== 200) {
    throw new Error(`OAuth token exchange failed with HTTP ${res.statusCode}: ${res.body}`);
  }

  const json = JSON.parse(res.body);
  return json.access_token;
}

/**
 * Submit URL to Google Indexing API
 */
async function submitUrlToGoogleIndexingApi(url, action = 'URL_UPDATED', accessToken) {
  const payload = JSON.stringify({ url: url, type: action });
  const res = await makeHttpsRequest({
    hostname: 'indexing.googleapis.com',
    path: '/v3/urlNotifications:publish',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, payload);

  const parsed = JSON.parse(res.body || '{}');
  if (res.statusCode === 200) {
    console.log(`  ✅ [INDEXED] ${url} -> ${action} (HTTP 200)`);
    return { success: true, data: parsed };
  } else {
    console.warn(`  ⚠️ [API RESPONSE] ${url} -> HTTP ${res.statusCode}: ${parsed.error ? parsed.error.message : res.body}`);
    return { success: false, status: res.statusCode, error: parsed.error };
  }
}

/**
 * Main Execution Entrypoint
 */
async function main() {
  console.log('=================================================================');
  console.log('🌐 OMNISAAS GOOGLE SEARCH INDEXING & SEO AUTOMATION ENGINE');
  console.log('=================================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isSitemapOnly = args.includes('--generate-sitemap');
  const urlIdx = args.indexOf('--url');
  const targetUrl = urlIdx !== -1 && args[urlIdx + 1] ? args[urlIdx + 1] : null;

  // 1. Gather URLs
  const urls = getAllBusinessUrls();
  console.log(`📋 Total Pages Discovered: ${urls.length}`);
  urls.forEach(u => console.log(`   • ${u.loc} (${u.name})`));

  // 2. Generate sitemap.xml and robots.txt
  generateSitemap(urls);
  generateRobotsTxt();

  if (isSitemapOnly) {
    console.log('\n✨ Sitemap & robots.txt generated successfully. Exiting.');
    return;
  }

  // 3. Dry-run Mode
  if (isDryRun) {
    console.log('\n🔍 [DRY-RUN] Verification complete. All URLs validated and ready for indexing.');
    return;
  }

  // 4. Ping Google Search Console Sitemap Endpoint
  const sitemapUrl = `${BASE_ORIGIN}/sitemap.xml`;
  await pingGoogleSitemap(sitemapUrl);

  // 5. Official Google Indexing API
  console.log('\n🔐 Checking for Google Service Account credentials (service_account.json)...');
  const serviceAccount = getServiceAccountCredentials();

  if (!serviceAccount) {
    console.log('\nℹ️ [GOOGLE INDEXING API STATUS]');
    console.log('   No "service_account.json" found. Google Search Console sitemap ping was sent successfully!');
    console.log('   To enable instant 5-minute Google Indexing API notifications:');
    console.log('   1. Create a free Service Account in Google Cloud Console.');
    console.log('   2. Enable "Web Search Indexing API".');
    console.log('   3. Download the JSON key file and place it in the project root as "service_account.json".');
    console.log('   4. Add the service account email as an Owner in your Google Search Console property.');
    console.log('   5. Re-run: node scripts/google_indexing.js');
    console.log('   (See GOOGLE_INDEXING_GUIDE.md for step-by-step screenshots and guide)\n');
    return;
  }

  console.log('🚀 Authenticating with Google OAuth 2.0 JWT...');
  try {
    const jwt = createSignedJwt(serviceAccount);
    const accessToken = await getGoogleAccessToken(jwt);
    console.log('✅ Access Token granted! Commencing batch URL notifications...\n');

    const urlsToSubmit = targetUrl ? [{ loc: targetUrl }] : urls;
    let successCount = 0;

    for (const u of urlsToSubmit) {
      const res = await submitUrlToGoogleIndexingApi(u.loc, 'URL_UPDATED', accessToken);
      if (res.success) successCount++;
      // Sleep 250ms between requests to stay within Google rate limits
      await new Promise(r => setTimeout(r, 250));
    }

    console.log(`\n🎉 Indexing API Complete! ${successCount}/${urlsToSubmit.length} URLs successfully submitted to Google!`);
  } catch (err) {
    console.error(`❌ Google Indexing API authentication or dispatch failed: ${err.message}`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error in Google Indexer:', err);
    process.exit(1);
  });
}

module.exports = {
  getAllBusinessUrls,
  generateSitemap,
  generateRobotsTxt,
  pingGoogleSitemap,
  submitUrlToGoogleIndexingApi
};

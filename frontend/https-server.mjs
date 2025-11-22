import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import next from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
// Default to 127.0.0.1 for Windows compatibility (avoids needing unix-style env prefixes)
const hostname = process.env.HOSTNAME || '127.0.0.1';
const port = parseInt(process.env.PORT || '443', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const certsDir = path.join(__dirname, '..', 'certs');
const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost-cert.pem');

// Helper function to check certificate validity
function validateCertificates() {
  if (!fs.existsSync(keyPath)) {
    console.error('❌ SSL private key not found at:', keyPath);
    return false;
  }

  if (!fs.existsSync(certPath)) {
    console.error('❌ SSL certificate not found at:', certPath);
    return false;
  }

  try {
    // Verify files are readable and not empty
    const keyStats = fs.statSync(keyPath);
    const certStats = fs.statSync(certPath);

    if (keyStats.size === 0) {
      console.error('❌ SSL private key is empty:', keyPath);
      return false;
    }

    if (certStats.size === 0) {
      console.error('❌ SSL certificate is empty:', certPath);
      return false;
    }

    // Verify they contain PEM format markers
    const keyContent = fs.readFileSync(keyPath, 'utf-8');
    const certContent = fs.readFileSync(certPath, 'utf-8');

    if (!keyContent.includes('BEGIN PRIVATE KEY') || !keyContent.includes('END PRIVATE KEY')) {
      console.error('❌ SSL private key is not in valid PEM format');
      return false;
    }

    if (!certContent.includes('BEGIN CERTIFICATE') || !certContent.includes('END CERTIFICATE')) {
      console.error('❌ SSL certificate is not in valid PEM format');
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Error validating certificates:', err.message);
    return false;
  }
}

// Check if certificates exist and are valid
if (!validateCertificates()) {
  console.error('');
  console.error('🔐 Certificate Setup Required');
  console.error('─────────────────────────────');
  console.error('');
  console.error('Run one of these commands:');
  console.error('');
  console.error('1. npm run setup:https  (recommended - automatic setup)');
  console.error('');
  console.error('2. Manual setup:');
  console.error('   mkcert -install');
  console.error('   mkcert -cert-file=../certs/localhost-cert.pem \\');
  console.error('          -key-file=../certs/localhost-key.pem \\');
  console.error('          localhost 127.0.0.1 lcl.host');
  console.error('');
  console.error('3. Skip HTTPS and use HTTP:');
  console.error('   npm run dev  (uses http://localhost:3000)');
  console.error('');
  process.exit(1);
}

app.prepare().then(() => {
  try {
    // Read certificates with error handling
    const key = fs.readFileSync(keyPath, 'utf-8');
    const cert = fs.readFileSync(certPath, 'utf-8');

    const options = {
      key,
      cert,
      // Security options for production
      ...(process.env.NODE_ENV === 'production' && {
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
      }),
    };

    const server = https.createServer(options, (req, res) => {
      // Add security headers
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      handle(req, res);
    });

    server.listen(port, hostname, () => {
      console.log('');
      console.log('🔒 HTTPS Server running securely!');
      console.log('─────────────────────────────────');
      console.log('');
      console.log('📍 https://' + hostname + ':' + port);
      console.log('📍 https://lcl.host:' + port);
      console.log('📍 https://127.0.0.1:' + port);
      console.log('');
      console.log('🔐 Certificates:');
      console.log('   Key:  ' + keyPath);
      console.log('   Cert: ' + certPath);
      console.log('');
      if (dev) {
        console.log('⚠️  Development mode - browsers will show certificate warnings');
        console.log('   This is normal for self-signed certificates');
      }
      console.log('');
    });

    // Error handling
    server.on('error', (err) => {
      if (err.code === 'EACCES') {
        console.error('❌ Permission denied. Port ' + port + ' requires admin privileges');
      } else if (err.code === 'EADDRINUSE') {
        console.error('❌ Port ' + port + ' is already in use');
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Error reading certificates:', err.message);
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Next.js app preparation failed:', err);
  process.exit(1);
});

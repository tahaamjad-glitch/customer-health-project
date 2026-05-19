# Public URL Setup

Production URL:

```text
https://www.projecthealth.com
```

Staging URL:

```text
https://staging.projecthealth.com
```

Local development URL:

```text
http://127.0.0.1:4174/index.html#dashboard
```

Public URL after deployment:

```text
https://www.projecthealth.com
```

## 1. Buy Or Connect The Domain

Use a registrar or DNS provider such as your existing domain registrar, Cloudflare, GoDaddy, Namecheap, cPanel DNS, AWS Route 53, or DigitalOcean DNS.

Required domain:

```text
projecthealth.com
www.projecthealth.com
staging.projecthealth.com
```

## 2. Deploy The Website And Backend

This project includes a Node backend, login sessions, API routes, and JSON persistence. The best fit is a host that can run a long-lived Node process or Docker container.

Good fits:

```text
DigitalOcean Droplet
AWS EC2
cPanel Node.js App
Any VPS with Node.js + Nginx
Docker-capable hosting
```

Possible with changes:

```text
Vercel
Netlify
```

Vercel and Netlify are excellent for static frontends, but this project currently uses a Node server plus a local JSON database. To use Vercel or Netlify fully, move the backend into serverless functions and replace `data/db.json` with a hosted database.

### Option A: VPS / DigitalOcean / AWS EC2

Install Node.js on the server, upload the project, then run:

```bash
export HOST=0.0.0.0
export PORT=4174
export PROJECT_DOMAIN=www.projecthealth.com
export PUBLIC_ORIGIN=https://www.projecthealth.com
export CANONICAL_ORIGIN=https://www.projecthealth.com
export ALLOWED_ORIGINS=https://www.projecthealth.com
export COOKIE_DOMAIN=.projecthealth.com
export COOKIE_SECURE=true
npm start
```

For staging, use:

```bash
export HOST=0.0.0.0
export PORT=4174
export PROJECT_DOMAIN=staging.projecthealth.com
export PUBLIC_ORIGIN=https://staging.projecthealth.com
export CANONICAL_ORIGIN=https://staging.projecthealth.com
export ALLOWED_ORIGINS=https://staging.projecthealth.com,https://www.projecthealth.com
export COOKIE_DOMAIN=.projecthealth.com
export COOKIE_SECURE=true
npm start
```

### Option B: Docker Hosting

Build and run:

```bash
docker build -t projecthealth .
docker run -d --name projecthealth -p 4174:4174 --env-file .env.production.example -v projecthealth-data:/app/data projecthealth
```

### Option C: cPanel Node.js Hosting

1. Create a Node.js app in cPanel.
2. Set the application root to this project folder.
3. Set the startup file to:

```text
server.js
```

4. Add these environment variables:

```text
HOST=0.0.0.0
PORT=4174
PROJECT_DOMAIN=www.projecthealth.com
PUBLIC_ORIGIN=https://www.projecthealth.com
CANONICAL_ORIGIN=https://www.projecthealth.com
ALLOWED_ORIGINS=https://www.projecthealth.com
COOKIE_DOMAIN=.projecthealth.com
COOKIE_SECURE=true
```

5. Map `www.projecthealth.com` to the Node app in cPanel.

## 3. Point DNS To Hosting

Create one of these DNS configurations at the registrar or DNS provider for `projecthealth.com`.

If hosting on a VM with a public IP:

```text
Type  Name  Value
A     @     YOUR_SERVER_PUBLIC_IPV4
A     www   YOUR_SERVER_PUBLIC_IPV4
A     staging YOUR_SERVER_PUBLIC_IPV4
```

If the host provides a CNAME target:

```text
Type   Name  Value
CNAME  www   YOUR_HOSTING_PROVIDER_TARGET
CNAME  staging YOUR_STAGING_HOSTING_PROVIDER_TARGET
```

Common examples:

```text
AWS EC2 / DigitalOcean Droplet:
A     @     server public IP
A     www   server public IP

Vercel / Netlify / managed host:
CNAME www   provider target
CNAME staging   staging provider target
A     @     provider IP if they provide one
```

Keep TTL at `300` while testing. Raise it after the site is stable.

## 4. Enable HTTPS / SSL

Use one of these:

```text
Let's Encrypt
Cloudflare SSL
cPanel AutoSSL
Hosting provider SSL settings
AWS ACM behind a load balancer
```

### Nginx + Let's Encrypt

Use this reverse proxy template:

```text
deployment/nginx/projecthealth.conf
```

Issue the certificate:

```bash
certbot --nginx -d www.projecthealth.com -d projecthealth.com -d staging.projecthealth.com
```

### Cloudflare

1. Add `projecthealth.com` to Cloudflare.
2. Point nameservers at Cloudflare.
3. Create `A` or `CNAME` records for the server.
4. Set SSL/TLS mode to `Full` or `Full (strict)`.
5. Enable "Always Use HTTPS".

### cPanel

1. Open SSL/TLS Status or AutoSSL.
2. Enable SSL for `projecthealth.com` and `www.projecthealth.com`.
3. Force HTTPS redirects.

### Hosting SSL Settings

Most hosting dashboards have an SSL or HTTPS page. Use these settings after DNS is pointing to the host:

```text
Primary domain: www.projecthealth.com
Also secure: projecthealth.com
SSL certificate: Enabled
HTTPS redirect: Enabled / Force HTTPS
Auto-renewal: Enabled
Minimum TLS version: TLS 1.2 or higher
HSTS: Enabled after HTTPS is confirmed working
```

If the host asks for the app/backend port, use:

```text
4174
```

If the host asks for the backend origin, use:

```text
http://127.0.0.1:4174
```

If the host asks for the public site URL, use:

```text
https://www.projecthealth.com
```

Provider-specific names vary, but the setting usually appears as one of these:

```text
SSL / TLS
HTTPS
Custom Domain
Domain Management
Edge Certificates
AutoSSL
Force HTTPS
Always Use HTTPS
```

Keep the site on plain HTTP only long enough to issue the certificate. After SSL is active, all traffic should redirect to:

```text
https://www.projecthealth.com
```

## 5. Verify

After DNS and SSL are active, check:

```text
https://www.projecthealth.com
https://www.projecthealth.com/api/health
```

Expected `/api/health` response:

```json
{
  "status": "ok",
  "domain": "www.projecthealth.com",
  "publicOrigin": "https://www.projecthealth.com",
  "canonicalOrigin": "https://www.projecthealth.com"
}
```

## Final URL Mapping

Once DNS, hosting, and HTTPS are complete:

```text
http://127.0.0.1:4174/index.html#dashboard
=> https://www.projecthealth.com
```

# Vertex AI

Local app URL:

```powershell
npm start
```

Open:

```text
http://localhost:4174/index.html
```

## Domain Setup

Production URL:

```text
https://www.projecthealth.com
```

The local development URL `http://127.0.0.1:4174/index.html?domain-final=1#security` corresponds to the production URL:

```text
https://www.projecthealth.com
```

Point `www.projecthealth.com` or your reverse proxy to this Node server and start it with the public origin:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="4174"
$env:PUBLIC_ORIGIN="https://www.projecthealth.com"
$env:CANONICAL_ORIGIN="https://www.projecthealth.com"
$env:ALLOWED_ORIGINS="https://www.projecthealth.com"
npm start
```

If the app is served from a subdomain and the API is on another subdomain, also set:

```powershell
$env:COOKIE_DOMAIN=".projecthealth.com"
```

The simplest production setup is to serve the website and `/api/*` from the same domain so login cookies work consistently in Chrome and Safari.

## Production Deployment

This project now includes deployment assets for DNS, hosting, and HTTPS:

```text
.env.production.example
Dockerfile
netlify.toml
vercel.json
deployment/NETLIFY.md
deployment/VERCEL.md
deployment/DNS.md
deployment/nginx/projecthealth.conf
```

Build and run with Docker:

```bash
docker build -t projecthealth .
docker run -d --name projecthealth -p 4174:4174 --env-file .env.production.example projecthealth
```

Production health check:

```text
https://www.projecthealth.com/api/health
```

Use [deployment/DNS.md](</C:/Users/taha.amjad/Documents/New project/deployment/DNS.md>) for the full public URL checklist:

```text
1. Buy/connect projecthealth.com
2. Deploy the Node app to hosting
3. Add A/CNAME DNS records
4. Enable HTTPS/SSL
   - Use hosting SSL settings, AutoSSL, Cloudflare SSL, Let's Encrypt, or AWS ACM
   - Force HTTPS to https://www.projecthealth.com
5. Verify https://www.projecthealth.com/api/health
```

Use `deployment/nginx/projecthealth.conf` as the HTTPS reverse proxy template after DNS points `www.projecthealth.com` to the server.

## Netlify Manual Deploy

For Netlify:

```bash
npm run build
```

Then drag and drop:

```text
dist
```

See [deployment/NETLIFY.md](</C:/Users/taha.amjad/Documents/New project/deployment/NETLIFY.md>) for the full Netlify domain and HTTPS steps.

## Vercel Deploy

For Vercel, push this project to GitHub, then import the repository in Vercel.

Vercel settings:

```text
Build command: npm run build
Output directory: dist
Custom domain: www.projecthealth.com
```

DNS record commonly used for `www`:

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Vercel will enable HTTPS after DNS is verified.

See [deployment/VERCEL.md](</C:/Users/taha.amjad/Documents/New project/deployment/VERCEL.md>) for the full GitHub, Vercel, DNS, and HTTPS steps.

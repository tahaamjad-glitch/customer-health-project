# Customer Health Projection Agent

Professional MVP website for the Customer Trust Early Warning System. The app includes demo login roles, role-aware navigation, executive dashboard, customer portfolio, customer detail workspace, signal inbox, recommendation review gate, scoring configuration, agent workflow, RBAC, reports, and discovery artifacts.

## Discovery Phase Artifacts

The Customer Health discovery and solution design package is documented in [docs/discovery/customer-health-discovery-artifacts.md](</C:/Users/taha.amjad/Documents/New project/docs/discovery/customer-health-discovery-artifacts.md>). It includes the Business Canvas, Process Flow, Functional Architecture Diagram, Integration Diagram, Swimlane Diagram, Application Design, PRD, and Agent Graph.

PDF version: [docs/discovery/customer-health-discovery-artifacts.pdf](</C:/Users/taha.amjad/Documents/New project/docs/discovery/customer-health-discovery-artifacts.pdf>).

Master diagram: [docs/discovery/customer-health-master-diagram.md](</C:/Users/taha.amjad/Documents/New project/docs/discovery/customer-health-master-diagram.md>) and [docs/discovery/customer-health-master-diagram.svg](</C:/Users/taha.amjad/Documents/New project/docs/discovery/customer-health-master-diagram.svg>).

JPEG diagrams: [docs/discovery/jpeg/README.md](</C:/Users/taha.amjad/Documents/New project/docs/discovery/jpeg/README.md>).

PDF slide deck: [docs/discovery/slides/customer-health-discovery-slides.pdf](</C:/Users/taha.amjad/Documents/New project/docs/discovery/slides/customer-health-discovery-slides.pdf>).

## Local Full-Stack Setup

Install dependencies if this is a fresh checkout:

```powershell
npm install
```

Start the Python API and React frontend together:

```powershell
npm run dev:full
```

Open:

```text
http://127.0.0.1:5173/login
```

The local app is configured through `.env.local` to call:

```text
http://127.0.0.1:8181
```

Seed login:

```text
admin@customerhealth.test / Admin@123
```

Run only the frontend:

```powershell
npm run dev:frontend
```

Run only the backend:

```powershell
npm run dev:backend
```

## Domain Setup

Production URL:

```text
https://www.projecthealth.com
```

Staging URL:

```text
https://staging.projecthealth.com
```

GitHub Pages staging deployment:

```text
https://staging.projecthealth.com
```

DNS record for GitHub Pages staging:

```text
Type: CNAME
Name: staging
Value: tahaamjad-glitch.github.io
```

After adding the DNS record, open GitHub repository Settings -> Pages and set the source to GitHub Actions. The included workflow deploys the static website build and includes the staging custom domain.

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

For staging, use the staging subdomain and the staging environment file:

```powershell
$env:HOST="0.0.0.0"
$env:PORT="4174"
$env:PROJECT_DOMAIN="staging.projecthealth.com"
$env:PUBLIC_ORIGIN="https://staging.projecthealth.com"
$env:CANONICAL_ORIGIN="https://staging.projecthealth.com"
$env:ALLOWED_ORIGINS="https://staging.projecthealth.com,https://www.projecthealth.com"
$env:COOKIE_DOMAIN=".projecthealth.com"
$env:COOKIE_SECURE="true"
npm start
```

## Production Deployment

This project now includes deployment assets for DNS, hosting, and HTTPS:

```text
.env.production.example
.env.staging.example
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

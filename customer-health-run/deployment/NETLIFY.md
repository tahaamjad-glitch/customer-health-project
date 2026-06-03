# Netlify Deployment

Use this when deploying the public frontend to Netlify.

## Manual Deploy

1. Open the project folder.
2. Build the deployable folder:

```bash
npm run build
```

3. Go to Netlify.
4. Click **Add new site**.
5. Choose **Deploy manually**.
6. Drag and drop the generated folder:

```text
dist
```

Netlify will give you a temporary live URL such as:

```text
your-netlify-site.netlify.app
```

## Add Domain

In Netlify:

```text
Site settings -> Domain management -> Add a domain
```

Add:

```text
www.projecthealth.com
```

## DNS Record

Where `projecthealth.com` is purchased, add:

```text
Type: CNAME
Name: www
Value: your-netlify-site.netlify.app
```

If you also want the root domain, follow Netlify's displayed record instructions for:

```text
projecthealth.com
```

## HTTPS / SSL

Netlify automatically enables HTTPS after DNS is correct.

In Netlify, check:

```text
Site settings -> Domain management -> HTTPS
```

Enable:

```text
Netlify managed certificate
Force HTTPS
```

## Backend Important Note

The static Netlify deploy will publish the website UI. Login, registration, project updates, and `/api/*` features need a hosted backend.

Use one of these options:

```text
1. Host server.js on DigitalOcean, AWS, cPanel Node.js, or another Node host.
2. Set PROJECT_HEALTH_API_BASE before npm run build to the hosted backend URL.
3. Or convert the API to Netlify Functions plus a hosted database.
```

Example build with an external backend:

```bash
PROJECT_HEALTH_API_BASE=https://api.projecthealth.com npm run build
```

For PowerShell:

```powershell
$env:PROJECT_HEALTH_API_BASE="https://api.projecthealth.com"
npm run build
```

If the backend is served from the same Netlify domain through functions or proxying, leave `PROJECT_HEALTH_API_BASE` empty.

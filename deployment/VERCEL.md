# Vercel Deployment

Use this when deploying the public frontend to Vercel.

Local development URL:

```text
http://127.0.0.1:4174/index.html#dashboard
```

Production URL:

```text
https://www.projecthealth.com
```

## 1. Push Code To GitHub

Create a GitHub repository and push this project.

```bash
git init
git add .
git commit -m "Prepare Vertex AI for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
git push -u origin main
```

If the repository already exists, only commit and push the latest changes.

## 2. Import In Vercel

In Vercel:

```text
Add New Project -> Import Git Repository -> Select the GitHub repo -> Deploy
```

Vercel should read:

```text
vercel.json
```

Build settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

Vercel will give you a live URL such as:

```text
your-project.vercel.app
```

## 3. Add Custom Domain

In Vercel:

```text
Project -> Settings -> Domains
```

Add:

```text
www.projecthealth.com
```

## 4. Update DNS

Where `projecthealth.com` is purchased, add the DNS record Vercel shows.

Common Vercel record for `www`:

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

If Vercel gives a different value for your project, use the exact value shown in Vercel.

For the root domain `projecthealth.com`, Vercel commonly shows:

```text
Type: A
Name: @
Value: 76.76.21.21
```

Again, use the exact records Vercel displays in the dashboard.

## 5. HTTPS

Vercel automatically enables HTTPS after DNS is verified.

Check:

```text
Project -> Settings -> Domains -> www.projecthealth.com
```

Expected state:

```text
Valid Configuration
SSL Certificate: Active
```

## Backend Important Note

The Vercel setup above deploys the static website UI. This project currently uses `server.js` and `data/db.json` for login, registration, project updates, and `/api/*`.

Vercel does not run this long-lived local Node server with persistent JSON storage as-is. To keep backend features working, choose one:

```text
1. Host server.js separately on a Node host, then set PROJECT_HEALTH_API_BASE in Vercel.
2. Convert /api/* to Vercel Functions and move data/db.json to a hosted database.
```

For an external backend, add this Vercel environment variable before deploying:

```text
PROJECT_HEALTH_API_BASE=https://api.projecthealth.com
```

Then rebuild/redeploy.

## Final Mapping

After deployment, DNS, and HTTPS:

```text
http://127.0.0.1:4174/index.html#dashboard
=> https://www.projecthealth.com
```

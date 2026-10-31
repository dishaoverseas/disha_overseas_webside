# Disha Overseas: Website + Live Admin Panel (Netlify)

The admin panel lives on your own website at **`https://yourdomain.com/admin`**.
Log in from any phone or computer, change anything, press Save. The change is committed to GitHub using a token stored in Netlify, and Netlify rebuilds the site in about one minute.

```
/admin (login)  ->  Netlify Function  ->  GitHub (content/content.json)  ->  Netlify rebuild  ->  Live website
```

No database and no separate server. All content is in `content/content.json` in your repository.

## 1. Put the code on GitHub

Create a **private** repository (recommended) and push this folder:

```bash
git init
git add .
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 2. Create a GitHub token

GitHub > Settings > Developer settings > Personal access tokens > **Fine-grained tokens** > Generate new token.
- Repository access: **Only select repositories** > your website repo
- Permissions > Repository permissions > **Contents: Read and write**
- Copy the token (starts with `github_pat_`).

## 3. Deploy on Netlify

Netlify > Add new site > Import an existing project > GitHub > choose the repo. Build settings come from `netlify.toml`.

Then **Site configuration > Environment variables** and add:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | the token from step 2 |
| `GITHUB_OWNER` | your GitHub username (or organisation) |
| `GITHUB_REPO` | repository name |
| `GITHUB_BRANCH` | `main` (optional, this is the default) |
| `ADMIN_PASSWORD` | the password you want for logging in |
| `NETLIFY_API_TOKEN` | optional, to read contact enquiries inside the admin (User settings > Applications > Personal access tokens) |

After adding the variables, go to **Deploys > Trigger deploy > Clear cache and deploy site** (functions read the variables on the next deploy).

## 4. Connect your domain

Netlify > Domain management > Add a domain. Either switch your domain's nameservers to Netlify, or add the A / CNAME records Netlify shows at your DNS provider. HTTPS is automatic.
Then put your address (for example `https://www.yourdomain.com`) in Admin > Site settings > Website address, so the sitemap for Google is created.

## 5. Use the admin panel

Open `https://yourdomain.com/admin`, enter your password, edit any page and press **Save changes**. Your site updates in about a minute.

- **Account** lets you change the password. The new password is stored as a salted hash in `content/admin-auth.json` in your repo (this is why a private repo is recommended). If you ever forget it, delete that file on GitHub and `ADMIN_PASSWORD` works again.
- **Connection** shows whether GitHub is connected correctly.
- **Enquiries** shows contact form messages (needs `NETLIFY_API_TOKEN`). They are also always in Netlify > Forms, where you can turn on email alerts.

## Good to know

- Each Save is one GitHub commit and one Netlify build (free plan: 300 build minutes per month). Make several edits on a page, then Save once.
- Images are resized in your browser and saved to `public/uploads` in the repo. A new image appears on the site after the rebuild.
- If you edit code yourself on your computer, run `git pull` first, because the admin panel commits to the same repo.
- Keep `GITHUB_TOKEN` only in Netlify environment variables. Never put it in the code.

## Test on your computer (optional)

```bash
npm install
npm run dev                  # website only: http://localhost:5173 (admin needs the functions below)
npm i -g netlify-cli
netlify dev                  # website + admin + functions: http://localhost:8888/admin
```
For `netlify dev`, create a `.env` file with the same variables as step 3.

## Structure

```
content/content.json     all website text (edited by the admin)
src/                     React website
admin/                   admin panel (React), served at /admin
netlify/functions/       login, content, upload, password, status, enquiries
netlify/lib/gh.mjs       GitHub + login helper
scripts/seo.mjs          builds sitemap.xml before each build
```
To add a new editable field: add it to `content/content.json`, to `admin/src/schema.js`, and use it in a page in `src/pages`.

# Disha Overseas: Website + Live Admin Panel

React website hosted on Netlify, with an admin panel at **`https://dishaoverseas.in/admin`**.
Log in from any phone or computer, change anything, press **Save**. The change is committed to GitHub using a token stored in Netlify, and Netlify rebuilds the site in about one minute.

```
/admin (login)  ->  Netlify Function  ->  GitHub (content/content.json)  ->  Netlify rebuild  ->  Live website
```

No database and no separate server. All content lives in `content/content.json` in this repository.

## What the website has

Home (country finder, destinations, services, Russia highlight, how it works, FAQ), About (company and founder), Destinations (many countries, search and region filter, one page each), Services, Russia Visa, Blog, FAQ, Contact (enquiry form), Privacy Policy, Terms. A WhatsApp button is shown on every page.

## What you can edit in the admin panel

- **Site settings:** name, logo, colours, **font style** (5 presets), phone, WhatsApp, email, address, menu, social links, footer text, SEO, optional Meta Pixel ID.
- **Pages:** Home, About (company and founder), Russia Visa, Contact, Privacy and Terms.
- **Content:** Services, **Destinations (countries)**, Blog articles, FAQs, Testimonials.
- **Account:** change the admin password. **Enquiries:** read contact form messages. **Connection:** check GitHub link.

Images are uploaded in the panel and resized automatically.

## 1. Environment variables (Netlify)

Netlify > Project configuration > **Environment variables**:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | Fine-grained token for this repository only, permission **Contents: Read and write** |
| `GITHUB_OWNER` | GitHub username or organisation that owns the repo |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | `main` (optional, default) |
| `ADMIN_PASSWORD` | Password for logging in to `/admin` |
| `NETLIFY_API_TOKEN` | Optional. Lets the panel show enquiries (User settings > Applications > Personal access tokens) |

After adding or changing variables: **Deploys > Trigger deploy > Clear cache and deploy site**.
Never put the token in the code.

## 2. Contact form (Netlify Forms)

1. Netlify > **Forms** > make sure **form detection is enabled**, then redeploy.
2. Send a test enquiry from the website. It appears in Netlify > Forms (turn on email notifications there).
3. If sending ever fails, the visitor sees a button to send the same details on WhatsApp instead.

## 3. Domain

Hostinger DNS: `A` record `@` to `75.2.60.5` and `CNAME` `www` to `<your-site>.netlify.app`. Then in Netlify > Domain management verify the domain and provision the HTTPS certificate.
Put `https://dishaoverseas.in` in Admin > Site settings > Website address so the sitemap is created.

## 4. Working with Git

The admin panel commits to this repository too. So always pull before you push:

```bash
git pull origin main --no-rebase
git push origin main
```

If you see a merge conflict in `content/content.json`, keep the version you want (`git checkout --ours content/content.json` keeps yours, `--theirs` keeps the one from GitHub), then `git add`, `git commit`, `git push`.

**Netlify free plan:** a private repository allows only one Git contributor. Link your GitHub account in Netlify > Team settings > Git contributors, and use the same GitHub account for your commits.

## 5. Password

Change it in Admin > Account. The new password is stored as a salted hash in `content/admin-auth.json` (keep the repository **private**). If you forget it, delete that file on GitHub and `ADMIN_PASSWORD` works again.

## 6. Meta (Facebook) ads tracking, optional

Create a Pixel in Meta Events Manager, paste the Pixel ID in Admin > Site settings. The site then sends PageView, Lead (form sent) and Contact (WhatsApp click). Mention the Pixel in your Privacy Policy.

## 7. Good to know

- Each Save is one GitHub commit and one Netlify build (free plan: 300 build minutes per month). Make several edits on a page, then Save once.
- A new image appears on the live site after the rebuild.
- Country flags load from flagcdn.com. Find country codes at flagcdn.com/en/codes.html.
- Do not replace `content/content.json` with an older copy, because that removes edits made in the admin panel.

## Run on your computer (optional)

```bash
npm install
npm run dev            # website at http://localhost:5173
npm i -g netlify-cli
netlify dev            # website + admin + functions at http://localhost:8888/admin
```
For `netlify dev`, create a local `.env` file with the variables from step 1.

## Project structure

```
content/content.json         all website text (edited by the admin)
src/                         React website
  pages/                     Home, About, Destinations, Services, RussiaVisa, Blog, Misc
  components/                Layout, forms, illustrations, shared parts
admin/                       admin panel (React), served at /admin
  src/schema.js              describes every editable field
netlify/functions/           login, content, upload, password, status, enquiries
netlify/lib/gh.mjs           GitHub and login helper
scripts/seo.mjs              builds sitemap.xml before each build
public/                      logo, favicon, uploaded images (public/uploads)
```

To add a new editable field: add it to `content/content.json`, to `admin/src/schema.js`, and show it in a page in `src/pages`.
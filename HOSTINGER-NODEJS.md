# Website ko Hostinger (Unlimited plan) par shift karna: step by step

Hostinger ki screens kabhi kabhi badalti hain. Agar koi button alag naam ka dikhe to uska matlab wahi samjhein, ya screenshot mujhe bhej dein.

## Step 1: Onboarding screen par kya chunein
- **"Create a new site"** chunein. ("Migrate an existing site" sirf WordPress ke liye hota hai, hamari site ke liye nahi.)
- Agar aage AI Builder ya WordPress ke option aayein, **Node.js / Custom code / Other** dhundhein. Na mile to upar right ka **X** dabakar onboarding band kar dein.
- Phir hPanel mein: **Websites, Add website, Node.js Apps** (ya "Import Git repository").
- Agar domain puche to **temporary domain** (jaise xxxx.hostingersite.com) chunein ya "connect later". **`dishaoverseas.in` abhi mat jodein**, warna aapki Netlify wali live site band ho sakti hai.
- "Free domain" claim mat karein.

## Step 2: Computer par code taiyar karein
1. In files ko apne project mein rakhein (replace ya nayi):
   - `package.json` (replace) phir terminal mein `npm install` chalayein, taaki `package-lock.json` bhi update ho
   - `server/server.js`, `server/backup.js`
   - `src/content.jsx`, `src/components/EnquiryForm.jsx`
   - `admin/src/App.jsx`
   - `.gitignore` mein ek line `data`
2. Push karein:
   ```powershell
   git add .
   git commit -m "hostinger version"
   git sync
   git push origin main
   ```
3. **Netlify ke admin se is dauraan koi badlav save mat karein.** Wo GitHub par commit karta hai aur Hostinger ko baar baar redeploy karwa dega.

## Step 3: Hostinger par app banayein
1. Node.js app mein **GitHub repository connect** karein (Hostinger ko GitHub allow karna hoga). Repo aur branch `main` chunein.
2. Settings:
   - Node.js version: **22** (ya 20)
   - Build command: `npm run build`
   - Start command: `npm start`
   - Entry file (agar puche): `server/server.js`
3. **Environment variables** jodein:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | admin login ka password |
| `SESSION_SECRET` | koi lambi random line (30+ akshar) |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `admin@dishaoverseas.in` |
| `SMTP_PASS` | mailbox ka password |
| `GITHUB_TOKEN` | token jisme **Contents: Read and write** ho |
| `GITHUB_OWNER` | GitHub username |
| `GITHUB_REPO` | repo ka naam |
| `GOOGLE_SHEET_URL` | Apps Script URL (optional) |
| `GOOGLE_SHEET_SECRET` | sheet ka secret shabd (optional) |
| `DATA_DIR` | Step 4 dekhein |

(`PORT` mat daalein, platform khud deta hai.)

## Step 4: Data ka surakshit folder (bahut zaroori)
Hosting redeploy par app ke apne folders overwrite kar sakti hai. Isliye data unke **bahar** rakhein.
1. hPanel, **File Manager** kholein. Sabse upar apna home path dikhega (jaise `/home/u123456789`).
2. Wahan (app ke folder ke bahar) ek folder banayein: `disha-data`.
3. `DATA_DIR` = `/home/u123456789/disha-data` (apna asli path).
4. Agar permission na de to `DATA_DIR` khali chhod dein. Server tab bhi GitHub backup (branch `data-backup`) se data wapas le aata hai.

## Step 5: Deploy aur test (temporary link par)
Deploy chalayein. Phir temporary link par ye 9 test karein (30 din ke refund ke andar, achha ho 10 din mein):

| # | Test | Pass |
|---|---|---|
| 1 | Home page khulta hai, logo aur country finder dikhta hai | Haan |
| 2 | `/admin` par login hota hai | Haan |
| 3 | Admin mein ek badlav Save karein, page refresh karein | Turant dikhta hai |
| 4 | **Redeploy test:** koi chhota code badlav push karke redeploy karwayein | Admin ka badlav bacha rehta hai |
| 5 | Ek image upload karein, redeploy ke baad dekhein | Image bachi rehti hai |
| 6 | Test enquiry bhejein | Email aati hai, Google Sheet mein row aati hai, Admin Enquiries mein dikhti hai |
| 7 | Mobile data par speed | 3 second ke andar |
| 8 | Admin, **Server status** page | Sab row hari, GitHub backup bhi |
| 9 | `https://temporary-link/api/health` kholein | `{"ok":true}` |

Koi test fail ho (khaaskar 4, 5, 6) to refund maang lein (din 25 se pehle) aur mujhe batayein.

## Step 6: Domain jodna (jab 1 se 9 pass ho jayein)
1. hPanel mein app ke **Domain** section mein `dishaoverseas.in` jodein. Domain Hostinger par hi hai, to DNS ka A record aksar apne aap badal jata hai.
2. **DNS / Nameservers** mein dekhein ki A record (`@` aur `www`) ab hosting ke IP par hain. Purana `75.2.60.5` (Netlify) hata dein.
3. **MX aur TXT (email wale) records bilkul na chhedein.**
4. SSL (https) apne aap lagta hai. 10 se 30 minute baad `https://dishaoverseas.in` kholein aur Step 5 ke test dobara karein.
5. Admin, Site settings mein **Website address** `https://dishaoverseas.in` daalein.
6. Netlify ko refund window (30 din) tak band mat karein, bas wapas jana ho to A record `75.2.60.5` kar dein.

## Email port 465 band ho to
1. Google Apps Script mein naya code (`google-apps-script.gs`) paste karein, **Deploy, Manage deployments, New version**, permission allow karein.
2. Environment variable `EMAIL_VIA_SHEET` = `yes` jodein.
3. Enquiry email ab founder ke Google account se jayega.

## Roz ka kaam
- Content, services, images, blog: `/admin` se, turant live.
- Code badlav: `git push`, Hostinger apne aap redeploy karega.
- Backup: har Save par GitHub branch `data-backup` mein copy jati hai, aur Hostinger ke daily backup alag se hain.
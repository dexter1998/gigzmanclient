# High Properties — deployment guide

Everything in this folder is ready to upload to Hostinger. Follow the steps in order;
the site works after **Step 2**, and each step after that turns on more.

---

## Step 1 — Upload the files

1. Hostinger **hPanel → Files → File Manager**
2. Open `public_html` and delete anything already in there (or move it to a backup folder).
3. Upload the **contents** of this folder into `public_html` — not the folder itself.

`public_html` should end up looking like this:

```
public_html/
├── index.html            the website
├── admin.html            listings manager (staff only)
├── privacy-policy.html
├── terms.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── .htaccess             HTTPS, caching, security headers
├── .env                  you create this in Step 3 — never share it
├── .env.example          template to copy
├── assets/               logo + favicons
├── data/listings.json    the 3 starter listings
├── api/                  PHP backend
└── storage/              written to by the site (see Step 2)
```

> `.htaccess` and `.env` start with a dot. If you can't see them in File Manager,
> turn on **Settings → Show hidden files**.

## Step 2 — Set folder permissions

The site stores listings and enquiries in `storage/` until you connect MySQL.

- Right-click `storage/` → **Permissions** → set to **755** (or 775 if 755 fails).

At this point the site is live and working. Visit `https://www.highproperties.in/` —
you should see the three starter listings.

## Step 3 — Create your `.env`

1. In File Manager, copy `.env.example` and rename the copy to `.env`.
2. Open it and fill in the values.

### Your admin password

Passwords are never stored as plain text. Generate a hash:

- hPanel → **Advanced → Terminal** (or SSH), then run:

```bash
php -r 'echo password_hash("YOUR-STRONG-PASSWORD", PASSWORD_DEFAULT), PHP_EOL;'
```

Copy the whole `$2y$...` string into `HP_USERS`:

```
HP_USERS=[{"u":"yogesh","role":"admin","hash":"$2y$10$....."}]
```

Then sign in at `https://www.highproperties.in/admin.html` with username `yogesh`
and the password you chose. Add the rest of your staff from **Manage Access** on the
main site — you never have to touch `.env` again.

> **Change the password that was in the old site's source code.** It was publicly
> readable and must be treated as compromised.

## Step 4 — Connect MySQL (recommended)

The JSON-file store works, but MySQL is faster and safer once you have real inventory.

1. hPanel → **Databases → MySQL Databases** → create a database and user.
2. hPanel → **phpMyAdmin** → select the database → **Import** → choose `api/schema.sql` → Go.
3. Put the credentials into `.env`:

```
DB_HOST=localhost
DB_NAME=u123456789_highprops
DB_USER=u123456789_admin
DB_PASS=your-database-password
```

The site switches over automatically — no code changes.

## Step 5 — Point the domain

hPanel → **Domains** → point `highproperties.in` at this hosting, then
**SSL → install** the free certificate. `.htaccess` already forces HTTPS and
redirects `highproperties.in` → `www.highproperties.in`.

---

## Step 6 — WhatsApp Business API (optional but recommended)

Without this the site still works: every enquiry opens a prefilled WhatsApp chat.
With it, enquiries are logged automatically and you get an instant alert.

1. Go to **developers.facebook.com** → create a Business app → add **WhatsApp**.
2. Connect the number **+91 98215 53693** (it must not be active on the normal
   WhatsApp or WhatsApp Business phone app — the Cloud API takes it over).
3. From **API Setup**, copy the **Phone number ID** and generate a
   **permanent access token** for a System User.
4. Fill in `.env`:

```
WA_PHONE_NUMBER_ID=123456789012345
WA_ACCESS_TOKEN=EAAG...
WA_APP_SECRET=...            # App → Settings → Basic
WA_OWNER_MSISDN=919821553693 # where new-lead alerts are sent
WA_VERIFY_TOKEN=pick-any-long-random-string
```

5. **Webhook**: WhatsApp → Configuration → Callback URL

```
https://www.highproperties.in/api/webhook.php
```

   Verify token = the same `WA_VERIFY_TOKEN` you just set. Subscribe to **messages**.

6. **Auto-reply to customers** needs an approved template
   (Meta requires this to start a conversation). Create one under
   **WhatsApp Manager → Message templates**, for example:

   > Hi {{1}}, thanks for contacting {{2}}. We've received your property requirement
   > and will call you shortly.

   Then set `WA_TEMPLATE_LEAD=your_template_name`.

### What the automation does

| Trigger | Action |
|---|---|
| Someone submits the enquiry form | Lead saved, WhatsApp alert sent to you |
| …and a template is configured | Customer gets an instant confirmation |
| Customer messages your WhatsApp | Logged to the CRM inbox; keyword menu auto-replies |
| Customer replies 1 / 2 / 3 / 4 | Routed to buy / sell / rent / construction |

Auto-replies are rate-limited (4 per number per 15 minutes) so they can't loop.

---

## Step 7 — Analytics & Search Console

- In `index.html`, search for `GA4_ID` and `META_PIXEL_ID` and replace with your real
  IDs. Both only load **after** a visitor accepts the cookie banner.
- Google Search Console → add `https://www.highproperties.in/` → submit
  `https://www.highproperties.in/sitemap.xml`.
- Google Business Profile: make sure the phone number and address match the site
  exactly — that consistency is what drives local map rankings.

---

## Adding properties

**One at a time:** `admin.html` → *Add / edit* → fill in → Save.

**In bulk:** *Import / export* → upload a CSV with this header:

```csv
title,type,category,purpose,price,sector,locality,city,beds,area,status,featured
"3 BHK Apartment",Apartment,residential,buy|sell,14500000,"Sector 99","Dwarka Expressway",Gurugram,3,1650,"Ready to Move",yes
```

- `category` — one of `residential`, `commercial`, `plot`, `industrial`
- `purpose` — any of `buy`, `sell`, `rent`, `lease`, `collab`, separated by `|`
- `price` — plain rupees, no commas. The "₹1.45 Cr" label is generated for you.
- `featured` — `yes` puts it at the top of the grid

Listings appear on the site immediately.

---

## Security checklist

- [ ] Changed the admin password that was exposed in the old site's source
- [ ] Rotated the Hostinger account password (it was shared over WhatsApp)
- [ ] `.env` exists and is **not** readable at `https://www.highproperties.in/.env`
      (it should give 403 — `.htaccess` handles this)
- [ ] `https://www.highproperties.in/storage/` gives 403
- [ ] SSL installed and the site redirects to `https://www`
- [ ] Staff each have their own login — nobody shares one

---

## Troubleshooting

**Listings don't appear** — open `https://www.highproperties.in/api/listings.php`.
JSON means the backend is fine. A PHP error means `storage/` needs write permission
(Step 2). A 404 means the `api/` folder didn't upload.

**Can't sign in to admin** — `HP_USERS` in `.env` must be valid JSON on a single line,
and the hash must be the full `$2y$...` string in double quotes.

**WhatsApp isn't sending** — check `WA_ACCESS_TOKEN` hasn't expired (use a permanent
System User token, not the 24-hour test token). Errors are written to the PHP error log.

**Changes don't show** — hard refresh (Ctrl/Cmd + Shift + R). `.htaccess` tells browsers
to cache images for a year; HTML is never cached.

# Al-Habib Sweets & Bakers

Full-stack website for a Pakistani sweets and bakery shop: product catalog, advanced stock with variants, secure admin dashboard, ImageKit images and WhatsApp pickup orders.
No online payments, no home delivery, no automatic order confirmation (version 1).

**Stack:** React + Vite + Tailwind CSS + Framer Motion + Chart.js (client) · Node.js + Express + MongoDB/Mongoose + JWT + ImageKit (server).

## Features
- Public: animated home, catalog with debounced search, filters, sorting, pagination, product details with weight / package / size variants, stock-aware options, related products, About, Contact, 404.
- Order builder (no account): server re-checks prices and stock, then opens a pre-filled WhatsApp message. Opening WhatsApp never reserves stock or confirms an order.
- Special event / bulk inquiry page with a structured WhatsApp message.
- Admin: login, dashboard (real data and Chart.js charts), products with variant editor, categories, settings, ImageKit upload / replace / remove with safe cleanup.
- Security: bcrypt, JWT in HttpOnly cookie, CSRF header guard, rate limits, Helmet, CORS lock, validation, no public admin sign-up.

## Prerequisites
Node.js 18+ (20 recommended), a MongoDB database (MongoDB Atlas free tier is fine), an ImageKit account (free tier is fine).

## Folder structure
```
client/  React app (src/pages, components, context, hooks, services, utils)
server/  Express API (src/config, models, controllers, routes, middleware, validators, services)
         scripts/createAdmin.js, scripts/seed.js, tests/
```

## Setup (Windows PowerShell)
**1. MongoDB.** In Atlas: create a cluster, a database user, allow your IP under Network Access, then copy the connection string (`mongodb+srv://...`) and add a database name, e.g. `.../alhabib?retryWrites=true&w=majority`.

**2. ImageKit.** Dashboard > Developer options: copy Public key, Private key and URL endpoint (`https://ik.imagekit.io/your_id`). The private key stays in `server/.env` only.

**3. Server**
```powershell
cd server
npm install
Copy-Item .env.example .env
notepad .env
```
Fill `.env`:
```
PORT=5000
MONGODB_URI=<your connection string>
JWT_SECRET=<32+ random characters>
CLIENT_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
WHATSAPP_NUMBER=            # optional; can also be set in Admin > Settings
```
Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**4. First admin** (there is no public sign-up):
```powershell
$env:ADMIN_NAME="Owner"; $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-long-password-12+"
npm run create-admin
```
**5. Optional demo data** (marked as demo, never overwrites your data):
```powershell
npm run seed            # add demo categories/products
npm run seed -- --remove  # remove only the demo records later
```
**6. Run**
```powershell
npm run dev                    # API on http://localhost:5000
cd ..\client
npm install
Copy-Item .env.example .env    # set VITE_API_URL=http://localhost:5000/api
npm run dev                    # site on http://localhost:5173
```
Open `http://localhost:5173/admin/login`, then **Settings**: enter the WhatsApp number (country code first, digits only), address, hours, etc. Then add categories and products.

Tests: `cd server; npm test` (model rules and API guards; no database needed).

## Production
Build: `cd client; npm run build` (output in `client/dist`). Start API: `cd server; npm start` with `NODE_ENV=production`.

Server variables: `NODE_ENV=production`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (exact site origin, no trailing slash), `IMAGEKIT_*`, optional `WHATSAPP_NUMBER`, `COOKIE_SAMESITE`.
Client variable (set at build time): `VITE_API_URL=https://api.yourdomain.com/api`.

Deploy tips:
- API on Render / Railway / a VPS; client on Netlify / Vercel / any static host. `client/public/_redirects` already handles React Router refreshes on Netlify (on Vercel add a rewrite of `/(.*)` to `/index.html`).
- Best: serve site and API from the same registrable domain (`www.example.com` + `api.example.com`). The default `SameSite=Strict` cookie then works. If they are on unrelated domains you need `COOKIE_SAMESITE=none` (HTTPS only), and some browsers block such cookies.
- Add your MongoDB host IP allow-list for the server in Atlas.

## Troubleshooting
- **Server exits with "Missing environment variables"**: `.env` is missing or `JWT_SECRET` is under 32 characters.
- **MongoDB connection timeout**: add your IP in Atlas Network Access; check the password has no unescaped special characters.
- **Admin login works but you are logged out on refresh**: `CLIENT_URL` must exactly match the site origin; in production use HTTPS and the same-site setup above.
- **"Missing CSRF header" (403)**: custom API clients must send `X-Requested-With: XMLHttpRequest`.
- **"Image uploads are not configured yet" (503)**: fill the three ImageKit variables and restart the API.
- **"Images must be uploaded through ImageKit"**: the image URL must start with `IMAGEKIT_URL_ENDPOINT`.
- **WhatsApp button says it is not set up**: add the number in Admin > Settings.
- **Old images still in ImageKit**: replaced files are deleted after the save, with retries every 15 minutes (`POST /api/imagekit/cleanup` forces a run).

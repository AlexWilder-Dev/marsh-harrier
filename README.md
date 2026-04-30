# The Marsh Harrier — Website

Marketing and ordering website for The Marsh Harrier pub, 40 Marsh Road, Cowley, Oxford OX4 2HH.

---

## Stack

| Layer | Service | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | TypeScript throughout |
| Styling | Tailwind CSS v3 | Colour system via CSS variables in `globals.css` |
| Hosting | Vercel | Watches the `main` branch — push to deploy |
| Database | Turso (libSQL/SQLite) | Powers the table ordering and admin dashboard |
| Forms | Formspree | Rooms enquiry and contact forms |
| Fonts | Google Fonts | Cormorant Garamond + DM Sans |
| Animation | Framer Motion + Lenis | Smooth scroll and section transitions |
| **Planned** | Sanity CMS | Menu, opening hours, and rooms content — see below |

---

## Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account (free tier is sufficient)
- A [Formspree](https://formspree.io) account (free tier is sufficient)
- A [Vercel](https://vercel.com) account for deployment

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your values (see Environment Variables below)
npm run dev
```

The site runs at `http://localhost:3000`.

**Without a Turso database configured**, the app falls back to a local SQLite file at `data/ordering.db`. This means the ordering system and admin dashboard work locally out of the box — no Turso account needed for development.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value. All variables are also required in Vercel (Settings → Environment Variables).

| Variable | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | Production | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |
| `ADMIN_PASSWORD` | Yes | Plain-text password for the staff admin dashboard. Hashed with SHA-256 at runtime — never stored as plaintext. |
| `NEXT_PUBLIC_FORMSPREE_ID` | Yes | Formspree form ID for the rooms enquiry form |
| `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` | Yes | Formspree form ID for the general contact form |

---

## Database Setup (Turso)

The ordering system stores live table orders and session data in a Turso database.

**First-time setup:**

1. Create a database at [turso.tech](https://turso.tech) and copy the URL and auth token into your environment variables.
2. Deploy to Vercel (or run locally with env vars set).
3. Log in to the admin dashboard at `/admin/login`.
4. Hit this endpoint once to create the tables and seed tables 1–20:

```
POST /api/init
```

You can do this from the browser devtools, Postman, or curl:

```bash
curl -X POST https://your-domain.com/api/init \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

The session cookie is set when you log in to `/admin/login`. The schema is in [`db/schema.sql`](db/schema.sql) for reference.

**Tables 1–20 are pre-populated on first init.** Takeaway orders use table number `0` and are created automatically when a customer orders.

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in Vercel — it will detect Next.js automatically.
3. Add all environment variables in Vercel project settings.
4. Deploy. Vercel watches the `main` branch — every push deploys automatically.

**Preview deployments** are created for every pull request automatically.

---

## Admin Dashboard

URL: `/admin` (redirects to `/admin/login` if not authenticated)

The admin dashboard shows all open tables and pending orders in real time, polling every 12 seconds when the tab is active. Staff can mark orders as delivered and close tables.

**Password:** set via the `ADMIN_PASSWORD` environment variable in Vercel. To change it, update the variable and redeploy (Settings → Environment Variables → Redeploy).

QR codes for each table are generated at `/admin/qr`. Print and laminate these for each table.

---

## Ordering System

Customers scan a QR code at their table which takes them to `/order?table=N`. Takeaway customers go to `/order?type=takeaway`.

The menu is currently served from `data/menu.json` — 276 items with IDs 1–200 (drinks) and 201–276 (food). Prices are stored in **pence** (integers). See [Planned: Sanity CMS](#planned-sanity-cms) for the intended future state.

---

## Content Updates (Current)

Until Sanity is integrated, content lives in the following files:

| Content | File | What to change |
|---|---|---|
| Opening hours | `components/OpeningHours.tsx` | Edit the `hours` array at the top of the file |
| Menu items | `data/menu.json` | Edit item names, prices (in pence), descriptions, availability |
| PDF menus | `public/media/` | Replace files — filenames must match those referenced in `HorizontalFlow.tsx` and `Footer.tsx` |
| Rooms content | `app/rooms/page.tsx` | Hardcoded in component — search for the content arrays near the top |
| Footer nav / social links | `components/Footer.tsx` | Edit the `nav`, `menus`, and `social` arrays at the top |
| Hero image | `public/images/` | Replace `marsh-harrier-pub-front.webp` — also update the preload in `app/layout.tsx` |
| Colour scheme | `app/globals.css` | Edit RGB channel values in the `:root` block — all Tailwind colours read from these variables |
| JSON-LD schema | `app/layout.tsx` | Update `jsonLd` object — keep in sync with opening hours |

---

## Planned: Sanity CMS

The intention is to integrate [Sanity](https://sanity.io) as a headless CMS so that content (menu, opening hours, rooms copy, images) can be updated by non-technical staff without touching code.

**What would move to Sanity:**
- Menu items (currently `data/menu.json`)
- Opening hours (currently hardcoded in `OpeningHours.tsx`)
- Rooms page copy and images
- PDF menu references

**What stays in Turso:**
- Live table orders
- Admin dashboard data
- Anything that needs real-time writes

When integrating Sanity, the recommended approach for Next.js App Router is the [official Next.js + Sanity starter](https://github.com/sanity-io/next-sanity) using the `@sanity/client` package with ISR (Incremental Static Regeneration) so content updates publish within seconds without a full redeploy.

---

## Project Structure

```
app/
  (pages)/          — Next.js App Router pages
  api/              — API routes (orders, tables, auth, menu)
  admin/            — Staff dashboard (auth-gated)
  rooms/            — Guest room enquiry page
  order/            — Customer ordering interface
  allergens/        — Allergen information (public)
  privacy/          — Privacy policy
  terms/            — Terms & conditions
  cookies/          — Cookie policy
  responsible-drinking/ — Licensing / Challenge 25
components/
  HorizontalFlow.tsx  — Horizontal scroll section (About, Garden, Food)
  OpeningHours.tsx    — Animated hours table
  Footer.tsx          — Site footer with nav, menus, social, legal links
  Nav.tsx             — Top navigation
  Hero.tsx            — Landing hero
  SmoothScroll.tsx    — Lenis smooth scroll wrapper (exposes window.__lenis)
data/
  menu.json           — All 276 menu items served by /api/menu
db/
  schema.sql          — Database table definitions for reference
lib/
  db.ts               — Turso/libSQL client + initDb()
  auth.ts             — SHA-256 session cookie auth
public/
  images/             — All site images
  media/              — PDF menus (food, drinks, BBQ, buffet, Christmas)
```

---

## Key Architectural Notes

- **Colour system:** All colours are CSS custom properties in `app/globals.css` as RGB channels. Tailwind reads them via `rgb(var(--color-x) / <alpha-value>)`. To change the brand colour, edit `globals.css` only.
- **HorizontalFlow:** The About / Garden / Food sections use a custom horizontal scroll component. See the architecture note at the top of `components/HorizontalFlow.tsx` before modifying it.
- **Auth:** Admin auth uses a single `ADMIN_PASSWORD` env var hashed with SHA-256. There is no multi-user system. This is intentional for a single-site deployment.
- **Rate limiting:** The login route uses in-memory rate limiting (5 attempts / 15 min per IP). In a Vercel serverless environment this resets per function instance — adequate for this scale but not a substitute for a WAF on a high-traffic deployment.

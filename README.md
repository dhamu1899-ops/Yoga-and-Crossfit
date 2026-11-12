# Stackly — Yoga & CrossFit Website

A premium, fully responsive multi-page website for **Stackly**, a Yoga & CrossFit studio.

## Pages

| Page | File | Description |
|------|------|-------------|
| Landing | `index.html` | Hero, about, programs, trainers, testimonials, pricing, CTA, footer |
| Contact | `contact.html` | Hero + breadcrumb, contact cards, validated form, Google Map, FAQ |
| 404 | `404.html` | Custom error page with search + quick links |
| Login | `login.html` | Split-screen login with password toggle + demo accounts |
| Signup | `signup.html` | Registration with password strength meter + goal picker |
| User Dashboard | `dashboard.html` | Stats, line chart, schedule, goals, heatmap, membership |
| Admin Dashboard | `admin.html` | Revenue charts, member management, class scheduler, messages |

## Tech

- **HTML5 / CSS3 / Vanilla JS** — no build step
- **Bootstrap 5.3** (grid + utilities) with a fully custom premium design system on top
- **Font Awesome 6** icons, **Google Fonts** (Sora + Inter)
- Unsplash photography throughout
- CSS-only animations: preloader, scroll reveals, counters, marquee, parallax, chart draws

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@stackly.fit` | `admin123` |
| User | `user@stackly.fit` | `user123` |

Auth is stored in `localStorage` (demo only — no backend).

## Run

Open `index.html` directly, or serve the folder:

```bash
npx serve .
```

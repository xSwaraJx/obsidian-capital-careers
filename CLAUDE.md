# Obsidian Capital — Careers Website

Premium careers site for **Obsidian Capital**, a fictional elite investment bank (Goldman Sachs / JPMorgan tier). Pure HTML/CSS/JS — no build step, no dependencies, no framework.

## How to run

Serve from the project root (needed so pages share relative paths cleanly; `file://` also works):

```
python -m http.server 8000
# or: npx serve
```

Then open http://localhost:8000

## Structure

```
index.html      Home — cinematic hero, stats, departments, featured roles, CTA
careers.html    Job board — live search + filters over the dataset
job.html        Job detail (?id=<job id>) + mock application form
culture.html    Life at Obsidian — benefits, offices, stories, hiring timeline
css/main.css    Entire design system + all page styles
js/jobs-data.js Job dataset (~30 roles) — single source of truth, global `JOBS`
js/main.js      Shared: nav, scroll reveals, custom cursor, counters, transitions
js/careers.js   Job board rendering, search, filters
js/job.js       Job detail rendering + apply-form validation
```

## Design system (dark luxe)

CSS custom properties live at the top of `css/main.css`. Key tokens:

- Background near-black `#0a0a0c`, raised surface `#121216`, card `#16161b`
- Accent champagne gold `#c9a962` (hover `#e0c284`), hairline `rgba(201,169,98,.22)`
- Text warm off-white `#ece9e2`, secondary `#8a8a93`
- Display type: **Cormorant Garamond** (serif); UI/body: **Outfit** — both Google Fonts
- Eyebrow labels: uppercase, letter-spacing `.35em`, gold, 12px

## Conventions

- Jobs are rendered client-side from the global `JOBS` array in `js/jobs-data.js` (31 roles).
  Job shape: `{ id, title, department, location, type, seniority, salary, summary, responsibilities[], requirements[], posted }`.
  Derived globals for filter UIs: `DEPARTMENTS`, `LOCATIONS`, `TYPES`, `SENIORITIES`.
  Departments: Engineering, Quantitative, Trading & Markets, Corporate, Internships, Facilities & Services.
  Locations: New York (HQ), London, Singapore, Zurich, Remote.
- Scroll animations: add class `reveal` (optionally `reveal-delay-1..4`); `js/main.js` observes and adds `.visible`. All motion is disabled under `prefers-reduced-motion`.
- Every page includes `js/main.js`; pages that need job data include `js/jobs-data.js` **before** their page script.
- Nav marks the active page via `aria-current="page"` on the link.
- No external JS libraries. Only external resources are Google Fonts.

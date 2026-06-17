# Deployment and Backend Outline

Date: 2026-06-16
Scope: moving the current local prototype toward a production HTTPS app suitable for Instagram, Messenger, and similar in-app browsers

## 1. Hosting recommendation

You do not have to buy a traditional server first.

Recommended starting options:

- Cloudflare Pages + Pages Functions
- Vercel + Serverless Functions

Why:

- HTTPS is automatic
- CDN delivery is built in
- easier mobile web deployment
- no separate Linux server required at the beginning

## 2. Frontend hardening already started

- `index-en.html` now points to local vendor files instead of external CDN URLs
- export flow now supports:
  - file picker when available
  - blob download fallback
  - preview fallback when embedded browsers block download
- a share button has been added for mobile/in-app browser usage

## 3. Recommended backend responsibilities

These should move to the server side for production:

### Required

- BaZi calculation
- report generation
- PDF generation
- image export generation
- request logging
- rate limiting

### Recommended

- abuse protection
- usage monitoring
- payment gating
- report caching

## 4. Suggested API structure

### `POST /api/calculate`

Input:

- name
- gender
- birth date
- birth time
- DST flag
- continent / country / state / city / district

Output:

- normalized birth data
- true solar time
- four pillars
- chart rows
- element distribution

### `POST /api/report`

Input:

- normalized chart payload
- language

Output:

- six-section report content
- metadata for export

### `POST /api/export/pdf`

Input:

- rendered report payload
- language

Output:

- downloadable PDF file URL or binary response

### `POST /api/export/image`

Input:

- chart payload

Output:

- downloadable image file URL or binary response

### `POST /api/share/log`

Input:

- share action type
- client platform
- embedded browser hint

Output:

- success status

## 5. Mobile embedded browser requirements

For Instagram, Messenger, and similar in-app browsers:

- avoid relying only on automatic downloads
- support share, preview, and save workflows
- avoid popup-heavy flows
- avoid layout depending on desktop width
- handle soft keyboard viewport resize
- ensure main controls remain tappable after keyboard opens

## 6. Remaining production tasks

1. Move core chart calculation into backend endpoints
2. Move PDF export into backend generation
3. Move chart image rendering into backend generation or a dedicated export worker
4. Add rate limiting
5. Add request logging
6. Add environment config for production
7. Add custom domain and HTTPS deployment
8. Run iPhone and Android embedded browser validation

## 7. Recommended next implementation order

1. Finish English mobile embedded flow
2. Add backend scaffold
3. Deploy to HTTPS preview domain
4. Validate in Instagram and Messenger in-app browsers
5. Only then connect payment and release

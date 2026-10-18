# Gentleman Gym

A premium, fully responsive single-page website for **Gentleman Gym**, a professional multi-gym and fitness centre for ladies and gents in **Thellukuzhi, Perumkidavila P.O., Kerala**.

Built with React, Vite, Tailwind CSS and Lucide React. The design uses a dark editorial palette, warm gold accents, locally hosted display typography and real gym photography.

---

## What's included

- Sticky responsive navigation with scroll-spy, a mobile menu and a "Join Now" CTA
- Full-screen hero with location, calls to action and quick highlights
- About section with a layered photo composition
- Six facility cards with hover states
- Equal-prominence Ladies & Gents section
- Trainer section with role-based, editable placeholder cards (no invented names or qualifications)
- "Why Choose Us" benefits grid
- Conversion-focused membership section with call, WhatsApp and directions actions
- Contact section with click-to-call, per-number WhatsApp links and a map placeholder
- Validated enquiry form that prepares a WhatsApp message for the visitor to send
- Footer with navigation, contact information, directions and a dynamic copyright year
- Local SEO metadata, Open Graph tags and `HealthClub` structured data
- Reduced-motion support, keyboard-friendly controls, a skip link and visible focus states

The site is a single page with anchor navigation, so React Router is not required.

---

## Requirements

- Node.js **20.19+** (or 22.12+). Node 24 is recommended.
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite — normally <http://localhost:5173>.

### Production build

```bash
npm run build
npm run preview
```

The static production build is written to `dist/`.

### Lint

```bash
npm run lint
```

---

## Project structure

```text
.
├── index.html                  # SEO meta, Open Graph, structured data, font preloads
├── public/
│   ├── favicon.svg
│   ├── fonts/                  # Self-hosted Anton + Inter woff2 files
│   └── images/                 # Optimised gym photography and OG image
├── src/
│   ├── App.jsx                 # Section composition
│   ├── main.jsx
│   ├── index.css               # Tailwind theme, base styles, components, animations
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Marquee.jsx
│   │   ├── About.jsx
│   │   ├── Facilities.jsx
│   │   ├── LadiesGents.jsx
│   │   ├── Trainers.jsx
│   │   ├── WhyChooseUs.jsx
│   │   ├── Membership.jsx
│   │   ├── Contact.jsx
│   │   ├── Footer.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Logo.jsx
│   │       ├── Reveal.jsx
│   │       ├── SectionHeading.jsx
│   │       └── WhatsAppFloat.jsx
│   ├── data/
│   │   └── site.js             # Business details, nav, facilities, benefits, trainers
│   ├── hooks/
│   │   └── useActiveSection.js
│   └── lib/
│       ├── links.js            # tel / WhatsApp / directions helpers + validation
│       └── cx.js
└── vite.config.js
```

---

## Customising the site

### 1. Business details

Edit **`src/data/site.js`** to update the name, address, phone numbers, navigation, facility copy and benefits. Phone numbers are stored once and used across the call and WhatsApp links:

```js
phones: [
  { label: '9895979950', display: '98959 79950', tel: '+919895979950', digits: '9895979950' },
  ...
]
```

Update the same numbers in **`index.html`** (`telephone`, `contactPoint`) so the structured data stays accurate.

### 2. WhatsApp messages and directions

Edit **`src/lib/links.js`**:

- `DEFAULT_WHATSAPP_MESSAGE` — the prefilled greeting used by every WhatsApp link.
- `directionsHref` — replace the Google Maps search with the gym's verified place URL or share link.
- `normalisePhone` — validation for 10-digit Indian mobile numbers.

### 3. Trainers

The trainer section intentionally ships without names, certifications or experience claims. Each card in `trainers` (`src/data/site.js`) is a role-based placeholder:

```js
{
  title: 'Strength & Conditioning',
  description: '...',
  image: '/images/trainer-1.jpg',
  alt: '...',
}
```

Add the real details once the gym confirms them, then update the copy in `Trainers.jsx` and remove the "details will be published" note. Replace the stock portraits in `public/images/` with photos of the actual team.

### 4. Colours, type and spacing

The design tokens live in the `@theme` block at the top of **`src/index.css`**:

```css
--color-ink: #070707;
--color-gold: #d8a94b;
--font-display: 'Anton', ...;
--font-sans: 'Inter', ...;
```

Changing those values updates the whole brand. Heading sizes use `clamp()` for fluid scaling. Global components such as `.shell`, `.display`, `.section-title`, `.eyebrow` and form fields are defined in the same file.

### 5. Images

All photography is in **`public/images/`** and is currently representative stock imagery from [Unsplash](https://unsplash.com). Replace it with the gym's own photos before launch for a more authentic result. Keep these approximate dimensions to avoid layout shifts:

| File | Size | Use |
| --- | --- | --- |
| `hero.jpg` | 2000 × 1200 | Hero background |
| `about-main.jpg` | 1000 × 1250 | About composition |
| `about-detail.jpg` | 640 × 800 | About inset photo |
| `facility-*.jpg` | 1000 × 1250 | Six facility cards |
| `ladies.jpg`, `gents.jpg` | 1400 × 1050 | Ladies & Gents panels |
| `trainer-*.jpg` | 800 × 1000 | Trainer cards |
| `membership.jpg` | 1920 × 1100 | Membership background |
| `og-image.jpg` | 1200 × 630 | Social sharing |

Update the descriptive `alt` text in `src/data/site.js` (facilities/trainers) and in the section components if you swap the images.

### 6. Map

The contact section deliberately uses a styled map placeholder rather than embedding an unverified pin. Once the gym's exact Google Maps listing is confirmed:

1. Open `src/components/Contact.jsx`.
2. Replace the block marked `Map area` with the Google Maps embed iframe, or a static map image.
3. Keep the "Open in Google Maps" link pointed at the verified listing.

### 7. SEO

`index.html` already contains the title, meta description, Open Graph/Twitter tags, local keywords and `HealthClub` JSON-LD with the two verified phone numbers and address.

Before going live:

- Add the production domain and absolute `og:image` / `og:url` URLs (social platforms require absolute image URLs).
- Update the schema `url` and `image` if you add them.
- Create/claim a Google Business Profile for the gym; structured data is not a substitute for a verified listing.
- Replace the map placeholder with the verified location.
- Add a `robots.txt` and sitemap if you deploy to a real domain (optional for a single page).

### 8. Social links

No Instagram or other social links are included because no official URLs were supplied. Add real URLs to the footer only when the gym's accounts are confirmed.

---

## Enquiry form behaviour

The form validates:

- Name — at least 2 characters
- Phone — valid 10-digit Indian mobile number (accepts `+91`, `91` and leading `0` formats)
- Fitness goal — required
- Message — optional, max 600 characters

On a valid submission it opens `https://wa.me/91…` with a prefilled message containing the visitor's details. **Nothing is sent to a server.** The visitor must review and press send inside WhatsApp.

This keeps the site functional without a backend and avoids pretending an enquiry was delivered. To connect a real form service later, replace the `window.open(...)` call in `Contact.jsx` with your provider's request and show the success state only after a successful response.

---

## Accessibility notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and one `h1`
- Skip-to-content link
- Mobile menu traps nothing incorrectly: `Escape` closes it, focus returns to the toggle, background scroll is locked, and the panel is `inert` when closed
- All interactive controls have visible focus styles
- Form fields have labels, `aria-invalid` and linked error messages; an error summary is announced
- Decorative images and icons are hidden from assistive technology where appropriate
- Animations are disabled under `prefers-reduced-motion`

---

## Deployment

The project is a static site and can be deployed to Netlify, Vercel, Cloudflare Pages or any static host.

- Build command: `npm run build`
- Output directory: `dist`
- No environment variables are required.

---

## Notes and limitations

- Phone numbers, address, business name and the statement that the gym has certified trainers come from the supplied brief.
- No membership prices, opening hours, awards, years of experience, trainer names or certifications are invented. Contact details are the only verified commercial information shown.
- The images are representative stock photos, not photos of the actual gym.
- The map is a placeholder until the verified Google Maps location is provided.

---

© Gentleman Gym. Website content and branding belong to Gentleman Gym. Stock photography via Unsplash.

## Launch checklist additions

- FAQ section with keyboard-accessible expandable questions.
- Privacy Policy and Terms and Conditions pages at `/privacy` and `/terms`.
- Custom not-found page for unknown paths.
- `public/robots.txt` and `public/sitemap.xml` included.
- Before launch, replace `https://YOUR-DOMAIN.example` in `public/sitemap.xml` with the verified live domain. Update Open Graph/Twitter image URLs to absolute URLs after the domain is known.
- Confirm actual opening hours, membership prices, trainer names/certifications, ladies' and gents' arrangements, and the exact Google Maps pin with the gym owner before publishing claims.
- This site has no analytics/cookie tracking enabled by default. If you add trackers, update the privacy disclosures and implement any required consent controls first.
- The contact enquiry form prepares a WhatsApp message and does not submit form data to a website server.


## Multi-page routes

This project uses path-based React page rendering with separate URLs: `/`, `/about`, `/facilities`, `/ladies-gents`, `/trainer`, `/gallery`, `/membership`, `/contact`, `/why-us`, `/faq`, `/privacy`, and `/terms`. Configure your hosting provider to serve `index.html` for application routes so direct links and refreshes work.

A premium black-and-gold loading animation plays briefly on page load/refresh and respects the visitor's reduced-motion preference.

Before launch, replace `YOUR-DOMAIN.example` in `public/sitemap.xml` with the real website domain.

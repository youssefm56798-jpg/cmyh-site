# CMYH Site — Content Source of Truth

## Brand
- **Name**: CMYH — Coach Mohamed Youssef Hafez
- **Acronym tagline**: Consistency Make You Hustle
- **Colors**: Black bg, white text, red accent (#E50914-ish, refine)
- **Fonts**: Tanker (display), Satoshi (body) — fontshare

## Contact
- Phone / WhatsApp: 01064908551 (+20 10 6490 8551)
- Email: coachmohamedyoussef531@gmail.com
- Facebook: https://www.facebook.com/share/1C2vCSw3op/
- YouTube: https://youtube.com/@coachmohamedyoussef
- Instagram: TBC (likely exists, check)
- TikTok: TBC

## Programs (from old site)
1. Customized Training Plan Only
2. Customized Nutrition Plan Only
3. Customized Training + Nutrition Plan (combo / flagship)

## Site Map
- index.html — Home
- transformations.html — Full 30-pair gallery
- programs.html — 3 program tiers + bloodwork credibility
- about.html — Bio, certs, action shots
- contact.html — WhatsApp + form

## Languages
EN (default) + AR (RTL toggle)

## Assets (final, all compressed)
- assets/images/hero-original.jpeg (raw source, 42 KB)
- assets/images/hero.jpg (FINAL — used by site; Canva bg-remove → Gemini nano-banana studio relight → ffmpeg compress; 95 KB)
- assets/images/transformations/1-30.jpg (30 client before/after, ~70 KB each, 2.1 MB total)
- assets/images/bloodwork.jpg (programs credibility, 76 KB)
- assets/images/action-{treadmill,press,2,3}.jpeg (coach action shots, 25-52 KB each)

Total site weight: **2.6 MB** (all 5 pages + 35 images + CSS + JS + fonts via CDN)

## Tech
- Vanilla HTML/CSS/JS, no build step
- Fontshare CDN: Tanker (display) + Satoshi (body)
- Bilingual EN/AR via `data-en` / `data-ar` attributes + RTL `dir` flip (localStorage persisted)
- Lightbox, reveal-on-scroll, stat counters, mobile nav, WhatsApp deeplink form
- WhatsApp float bottom-right on every page
- Contact form opens WhatsApp pre-filled with form data

## Deploy
Hostinger FTP — drop entire `D:\CMYH\site\` contents into public_html for the domain.

## ⚠ Before Deploy — REPLACE THESE PLACEHOLDERS

**Real client quotes** (currently realistic but fabricated for layout):
Edit `index.html` → testimonials section (search "TODO: replace with real client quotes").
3 quote cards. Each needs: real EN + AR quote, real first name + city, real result (e.g. "−18 KG · 24 weeks").
Best testimonials mention: a specific failure they had before, what changed, a number.

**Stats numbers** (currently placeholders):
- Home page stats: 6 years / 500 clients / 1200 plans / 98% — confirm or adjust in `index.html`.
- Hero social proof: "4.9 rating · 500+ clients · 6 years coaching" — same.

**Availability number:**
- Programs page: "Currently accepting 8 new clients this month" — confirm or change in `programs.html`.

**Optional adds (not deployed yet):**
- Guarantee / risk reversal (e.g. "First week free" or "Money-back guarantee") — needs business decision.
- Instagram + TikTok handles — currently absent from socials (FB + YT + WA + Email only).

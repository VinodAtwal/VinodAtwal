---
name: portfolio-copy
description: Use when writing, editing or reviewing any copy for Vinod Atwal's portfolio site — hero headline, lede, section intros, meta descriptions, README blurbs, terminal output in main.js, or experience/about text. Front-loads the approved positioning, banned phrases, and résumé facts so new text stays consistent with decisions already made.
---

# Portfolio copy

Rules for all user-facing text on this site (index.html, main.js terminal
strings, README.md). New copy must match the voice and facts below.

## Positioning

The hook is **digital trust + security**, not distributed systems:

- Hero headline: `I build digital trust — secure SDLC, PKI and IAM.`
- Headline = scarce/rare skill (SDLC, PKI, IAM, supply chain). The lede
  directly below carries the scale proof (around 8 years, distributed, 100K+ IAM,
  50M+ end users). Never swap those roles — "distributed systems" alone is
  table stakes and reads generic.
- Frame tooling by **outcome, not process**: "the tooling that makes a Secure
  SDLC possible" beats "developing Secure SDLC tooling". Prefer
  *helps you achieve / makes possible / generates / turns X into Y* over
  *architected / implemented / delivered*.
- Sound like a **builder**, never an implementer: "developing", "building",
  "generating" — not "adopting", "rolling out", "compliance".

## Full tooling chain (say it end to end)

When describing the Secure SDLC work, spell the whole chain — don't stop at
generation, and don't drop the middle steps:

> end-to-end SBOM, CBOM and SLSA attestation generation, code signing and
> provenance, SAST scanning and vulnerability detection, VEX generation, and
> PQC vulnerability management with policy-based decisions

## Banned

| Don't | Why |
| --- | --- |
| "SLSA L3 compliance" / "we are SLSA Level 3" | Not a certification. He **builds tools to achieve** SLSA L3. Only the simulated pipeline trace may print "SLSA Level 3 satisfied". |
| "Ratify" anywhere | Client never wants the vendor named. Say "in-house PKI and signed attestations" or "policy engine". |
| Phone number | Removed at owner's request. Contact is email only. |
| `resume.pdf` links | No file exists. Use `mailto:...?subject=R%C3%A9sum%C3%A9%20request` with label "contact me for full résumé". |
| "Blackhawk Networks" (plural) | Official name is **Blackhawk Network** (singular). |
| Punjabi in Languages | Owner asked to drop it. English, Hindi only. |
| Detailed bullet lists in #experience | Headings only: role, company, dates, logo. Details live in #about and main.js. |
| GitHub stats images | Deleted — do not re-add profile/stats or top-langs images. |

## Facts (resume is authoritative)

- ~8 years (owner wording: "around 8 years"; tenure since Sep 2019), Bengaluru, IST (UTC+5:30).
- DigiCert — Senior Software Engineer, Sep 2024 → present.
- Blackhawk Network — Senior Software Engineer, Nov 2021 → Sep 2024.
- Infosys Limited — Software Engineer, Sep 2019 → Nov 2021.
- Email `vinodatwal27@gmail.com`; LinkedIn `/in/vinod-atwal`; GitHub
  `VinodAtwal`; Medium **`medium.com/@vinodatwal`** (not the subdomain);
  RSS `https://medium.com/feed/@vinodatwal`.
- Canonical URL `https://vinodatwal.github.io/VinodAtwal/`.
- Availability badge: "Open to collaboration & discussion" (not "open to roles").
- Employers get their logo in the timeline (DigiCert/Infosys SVG, Blackhawk
  PNG), displayed at matched ink height ~24px — don't rescale logos.

## Style

- Terminal/security voice: lowercase headings, `##` section hashes, `$` prompts.
- Keep sections parallel: every panel has an `<h2>` and a one-line
  `.panel-intro`. One idea per sentence; drop adjectives before dropping facts.
- British/partial spelling already in text (`productised`) is fine — match it.
- Page sections (about, experience, projects, stack, writing) live only in
  `index.html` — the terminal renders them from the DOM, so edit the HTML and
  the terminal follows automatically. Only terminal-specific strings (whoami,
  neofetch, contact, the experience detail map) live in `main.js`.
- Meta descriptions are shortened versions of the lede — rewrite the lede,
  then sync `<meta name="description">`, `og:description`, `twitter:description`
  and the JSON-LD `description`.

## Verify after edits

```bash
node --check main.js
python3 -m http.server 8899   # then Playwright: console errors, 0 overflow
grep -rn "ratify\|resume.pdf\|82850\|Punjabi" index.html main.js README.md
```

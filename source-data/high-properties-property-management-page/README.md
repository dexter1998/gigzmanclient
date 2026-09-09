# High Properties — Property Management Landing Page

This package contains the final desktop section visuals, the approved mobile hero, clean reusable image assets and scalable icons.

## Page order

1. Shared site navbar (reuse the final High Properties navbar component).
2. Property-management hero with High Properties Owner phone and integrated platform.
3. Complete management services.
4. Owner control-centre dashboard.
5. Management journey and tenant verification.
6. Inspections and maintenance.
7. Rental performance and recent managed deals.
8. Property types and Gurugram coverage.
9. Owner video testimonials.
10. Consultation form and FAQs.
11. Final CTA and footer.

## Important implementation rules

- Section images are visual references. Headings, forms, accordions, metrics and CTAs must be live HTML, not flattened screenshots.
- Reuse functionality from the existing component library, but do not inherit its visual styling. Apply this package's colors, spacing, imagery, gradients and type hierarchy.
- Hero phone, orbital line and black-marble platform are baked into responsive hero backgrounds. Do not add a separate phone asset.
- Testimonial photographs contain no play button or copy; add these as accessible live controls.
- Do not crop the desktop hero for mobile. Use the supplied portrait background at the mobile breakpoint.

## Core tokens

- `--hp-deep-teal: #033D38`
- `--hp-evergreen: #064C45`
- `--hp-gold: #D8AE59`
- `--hp-ivory: #F7F1E7`
- `--hp-ink: #092F2D`
- `--hp-section-space-desktop: 112px`
- `--hp-section-space-mobile: 72px`
- `--hp-container: 1440px`
- Serif headings: Cormorant Garamond or DM Serif Display.
- UI/body: Manrope or Inter.
- Main button radius: 8–10px; avoid pill-shaped buttons.
- Image radius: 10–16px; avoid excessive rounded cards.

## Asset mapping

- Hero: `assets/backgrounds/hero-desktop-integrated.png`, `hero-mobile-integrated.png`
- Services: `assets/service-mosaic-clean.png`, `managed-luxury-interior.png`
- Tenant verification: `assets/tenant-consultation.png`
- Inspections: `assets/property-inspector.png`
- Property types: `assets/property-types-panorama.png`
- Testimonials: files under `assets/testimonials/`
- Final CTA: `assets/gurugram-night-cta-bg.png`
- Owner dashboard and Gurugram map are cropped implementation references under `assets/ui/`.

All photographic PNG assets are intentionally opaque. The brand logo and gold decorative overlay preserve alpha transparency.

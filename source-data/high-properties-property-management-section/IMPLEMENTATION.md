# High Properties — Property Management Section

## Final composition

- No right-side information card, waitlist, `Notify Me`, launch badge, or phone-number field.
- The High Properties Owner phone, gold orbital line and black-marble/gold platform are baked directly into each responsive background.
- Do not layer a separate phone PNG over these backgrounds.

## Background usage

- Desktop: `assets/backgrounds/property-management-desktop-integrated.png`
- Mobile: `assets/backgrounds/property-management-mobile-integrated.png`
- Use separate `<picture>` sources or a breakpoint at `768px`; do not crop the desktop background for mobile.
- Desktop focal point: `background-position: center center`.
- Mobile focal point: `background-position: center bottom`.
- Recommended: `background-size: cover`, with the section content rendered as live HTML over the clean upper/left safe areas.

## Layout tokens

- Deep teal: `#033D38`
- Evergreen: `#064C45`
- Warm gold: `#D8AE59`
- Ivory: `#F7F1E7`
- Desktop max width: `1440px`
- Desktop horizontal padding: `clamp(48px, 5vw, 96px)`
- Mobile horizontal padding: `24px`
- Heading max width: desktop `760px`, mobile `92vw`
- Desktop section minimum height: `min(64vw, 920px)`
- Mobile section minimum height: `1536px` at the design ratio; allow content to grow naturally.

## Included files

- Two final full-section previews.
- Two HD integrated background images.
- Original High Properties logo reference.
- Six reusable gold service icons in SVG.

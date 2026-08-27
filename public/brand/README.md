# Brand assets

Drop a client's logo here and point at it from the dashboard:
**Settings → Firm identity → Logo path**, e.g. `/brand/ca-india-logo.png`.

Until a path is set, the built-in placeholder mark in
`components/site/BrandMark.tsx` is used instead.

Prefer SVG. If supplying a raster file, use PNG with a transparent background at
roughly 3x the largest display size — the header renders it at about 52x40 CSS px,
so 480px wide is comfortable.

import Link from "next/link";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "onNavy";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
  external?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors disabled:opacity-55 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-soft",
  secondary: "bg-surface text-navy border border-line-strong hover:border-navy",
  accent: "bg-accent text-white hover:bg-accent-hover",
  ghost: "text-navy hover:bg-tint",
  onNavy: "bg-accent text-white hover:bg-accent-hover",
};

// Minimum 44px tall at the default size to stay above the mobile tap-target floor.
const SIZES: Record<Size, string> = {
  sm: "min-h-[38px] px-3.5 text-[13px]",
  md: "min-h-[44px] px-5 text-[14px]",
  lg: "min-h-[50px] px-6 text-[15px]",
};

export default function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  external,
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

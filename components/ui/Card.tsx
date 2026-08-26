import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, href, className = "", padded = true }: CardProps) {
  const base = `rounded-[10px] border border-line bg-surface ${padded ? "p-5 sm:p-6" : ""}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} block transition-colors hover:border-navy-muted ${className}`}
      >
        {children}
      </Link>
    );
  }

  return <div className={`${base} ${className}`}>{children}</div>;
}

import Image from "next/image";
import { lenderLogoSrc, type Lender } from "@/lib/home-loan/banks";

/**
 * A lender mark on a chip sized to fit it.
 *
 * Some lenders publish only a white/reverse wordmark (Bajaj Housing Finance
 * is the one in this set). On the cream chip everything else uses, that mark
 * renders as nothing at all — so those get a forest chip instead. Handled
 * here rather than at each call site so no future usage reintroduces the
 * invisible-logo bug.
 */
export default function LenderLogo({
  lender,
  size = "md",
  className = "",
}: {
  lender: Lender;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const chip =
    size === "lg" ? "h-16 w-16 rounded-[var(--gp-radius-md)]" : size === "sm" ? "h-9 w-9 rounded-[6px]" : "h-11 w-11 rounded-[var(--gp-radius-sm)]";
  const inner = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden p-1.5 ${chip} ${
        lender.logoNeedsDarkBg ? "bg-[color:var(--gp-forest-900)]" : "bg-white"
      } ${className}`}
    >
      <Image
        src={lenderLogoSrc(lender)}
        alt=""
        width={64}
        height={64}
        className={`${inner} object-contain`}
      />
    </span>
  );
}

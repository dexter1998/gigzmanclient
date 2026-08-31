import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { getTenant } from "@/lib/tenant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Serif display face for the base (CA) vertical. Source Serif reads as
// institutional rather than editorial, which suits a professional practice
// better than a high-contrast display serif.
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Real-estate vertical's type system. Loaded here alongside the base fonts so
// every request pays the same font cost regardless of which vertical it
// resolves to; the per-vertical CSS block in globals.css only remaps which
// variable --font-display/--font-sans point at.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Professional Services",
  description: "Chartered accountancy, taxation and compliance support.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2c52",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // No tenant resolves for the deployment index or /library — data-vertical is
  // simply absent there and the base theme applies, which is correct for both.
  const tenant = await getTenant();

  const fontVariables = `${inter.variable} ${sourceSerif.variable} ${playfairDisplay.variable} ${montserrat.variable}`;

  return (
    <html lang="en" className={`${fontVariables} h-full`} data-vertical={tenant?.vertical}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

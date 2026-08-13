"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/intro", label: "✦ Intro" },
  { href: "/intro-1", label: "✦ Intro 1" },
  { href: "/model-showcase", label: "1. Model" },
  { href: "/spec-hotspots", label: "2. Spec Hotspots" },
  { href: "/model-hotspots", label: "3. Combined" },
  { href: "/performance", label: "4. Performance" },
];

export default function FloatingNav({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const pathname = usePathname();
  const positionClass = position === "top" ? "top-6" : "bottom-6";

  return (
    <nav className={`fixed ${positionClass} left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-2xl backdrop-blur-md`}>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${
              active
                ? "bg-neon-red text-white"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

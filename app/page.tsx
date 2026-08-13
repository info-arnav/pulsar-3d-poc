import Link from "next/link";
import FloatingNav from "./components/FloatingNav";

const pocs = [
  { href: "/intro", title: "✦ Interactive Introduction" },
  { href: "/intro-1", title: "✦ Locked Introduction" },
  { href: "/model-showcase", title: "1. Model Showcase" },
  { href: "/spec-hotspots", title: "2. Spec Hotspots" },
  { href: "/model-hotspots", title: "3. Model + Hotspots" },
  { href: "/performance", title: "4. Performance Simulator" },
];

export default function Home() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-surface-grey">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(254,1,0,0.12),transparent_60%)]" />
      <h1 className="relative text-4xl font-bold tracking-tight text-white">
        PULSAR <span className="text-neon-red">3D</span>
      </h1>
      <div className="relative mt-10 flex flex-col gap-3">
        {pocs.map((poc) => (
          <Link
            key={poc.href}
            href={poc.href}
            className="rounded-full border border-white/10 bg-dark-gray px-8 py-3 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-neon-red hover:text-white"
          >
            {poc.title}
          </Link>
        ))}
      </div>
      <FloatingNav />
    </div>
  );
}

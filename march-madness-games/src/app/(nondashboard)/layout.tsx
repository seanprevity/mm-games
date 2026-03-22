"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const PRIMARY_LINKS = [
  { href: "/connections", label: "Connections" },
  { href: "/crossword", label: "Crossword" },
  { href: "/millionaire", label: "Millionaire" },
];

const ALL_GAMES = [
  { href: "/mini-crossword", label: "Mini Crossword", icon: "▦" },
  { href: "/player", label: "Guess the Player", icon: "★" },
  { href: "/fifteen", label: "15 Words or Less", icon: "15" },
  { href: "/golf", label: "Height Golf", icon: "⛳" },
  { href: "/frankenstein", label: "Frankenstein", icon: "🧟" },
  { href: "/pangram", label: "Pangram", icon: "🐝" },
  { href: "/higher-lower", label: "Higher or Lower", icon: "↕" },
  { href: "/riddle", label: "Riddle", icon: "❓" },
  { href: "/picture-puzzle", label: "Picture Puzzle", icon: "🖼️" },
];

function GamesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          open
            ? "bg-white/[0.06] text-sky-300"
            : "text-gray-400 hover:bg-white/[0.04] hover:text-sky-300"
        }`}
      >
        More Games
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#1e2a45] bg-[#111827] py-1 shadow-xl shadow-black/30">
          {ALL_GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.04] hover:text-sky-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-400/10 text-[10px] text-sky-300/70">
                {game.icon}
              </span>
              {game.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NonDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ORIG: <div className="min-h-screen bg-white text-black">
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100">
      {/* ORIG: <header className="border-b border-black/10 bg-white"> */}
      <header className="border-b border-white/[0.06] bg-[#0d1220]">
        {/* ORIG: mx-auto flex max-w-6xl items-center justify-between px-6 py-4 */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* ORIG: text-xl font-bold */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-400 to-sky-300 text-[10px] font-black text-white">
              MM
            </span>
            <span className="hidden sm:inline">
              March Madness <span className="text-sky-300">Mini Games</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {/* Primary links — always visible */}
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.04] hover:text-sky-300"
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="mx-1 h-4 w-px bg-white/[0.06]" />

            {/* More Games dropdown */}
            <GamesDropdown />
          </nav>
        </div>
      </header>

      {/* ORIG: <main className="mx-auto max-w-6xl px-6 py-10"> */}
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}

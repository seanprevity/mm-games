import Link from "next/link";

const games = [
  {
    title: "Connections",
    href: "/connections",
    eyebrow: "Puzzle",
    description:
      "Group 16 March Madness terms into 4 hidden categories, just like the daily favorite.",
    icon: "◆",
  },
  {
    title: "Crossword",
    href: "/crossword",
    eyebrow: "Word Game",
    description:
      "The full March Madness crossword — more clues, bigger grid, deeper challenge.",
    icon: "▦",
  },
  {
    title: "Mini Crossword",
    href: "/mini-crossword",
    eyebrow: "Word Game",
    description:
      "Solve a quick March Madness themed crossword packed with teams, terms, and tournament clues.",
    icon: "▦",
  },
  {
    title: "Millionaire",
    href: "/millionaire",
    eyebrow: "Trivia",
    description:
      "Climb the prize ladder by answering March Madness questions in a game-show style challenge.",
    icon: "$",
  },
  {
    title: "Guess the Player",
    href: "/player",
    eyebrow: "Career Path",
    description:
      "Follow a March Madness legend's college-to-NBA path and guess the player before you run out of tries.",
    icon: "★",
  },
  {
    title: "15 Words or Less",
    href: "/fifteen",
    eyebrow: "Word Game",
    description:
      "Guess 8 March Madness terms with only 15 hints total. Budget your clues wisely.",
    icon: "15",
  },
  {
    title: "Height Golf",
    href: "/golf",
    eyebrow: "Guessing Game",
    description:
      "Guess each player's height — every inch off is a stroke. Lowest score wins the round.",
    icon: "⛳",
  },
  {
    title: "Frankenstein",
    href: "/frankenstein",
    eyebrow: "Face Game",
    description:
      "Three players, one face. Guess who owns the forehead, eyes, and chin in each mashed-up portrait.",
    icon: "🧟",
  },
  {
    title: "Pangram",
    href: "/pangram",
    eyebrow: "Word Game",
    description:
      "Form words from 8 letters using the center letter. Find the pangram that uses all 8.",
    icon: "🐝",
  },
  {
    title: "Higher or Lower",
    href: "/higher-lower",
    eyebrow: "NIL Game",
    description:
      "Compare NIL valuations of March Madness stars. Is the next player's deal higher or lower?",
    icon: "↕",
  },
  {
    title: "March Madness Riddle",
    href: "/riddle",
    eyebrow: "Trivia",
    description:
      "Four riddles, one legendary moment. Guess the teams, the event, and the year.",
    icon: "❓",
  },
  {
    title: "Picture Puzzle",
    href: "/picture-puzzle",
    eyebrow: "Visual Game",
    description:
      "Decode four visual clues — emojis, colors, and numbers — to guess the March Madness moment.",
    icon: "🖼️",
  },
];

export default function HomePage() {
  return (
    // ORIG: <div className="space-y-14">
    <div className="space-y-14">
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1e2a45] bg-[#111827] px-8 py-14 sm:px-12">
        {/* Ambient glows */}
        {/* ORIG: bg-orange-500/[0.07] */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/[0.07] blur-[80px]" />
        {/* ORIG: bg-amber-500/[0.06] */}
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-sky-400/[0.06] blur-[80px]" />
        {/* ORIG: bg-orange-500/[0.03] */}
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.03] blur-[100px]" />

        <div className="relative space-y-6">
          {/* ORIG: border-orange-500/20 bg-orange-500/[0.08] text-orange-400 / bg-orange-400 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            March Madness Mini Games
          </div>

          <div className="space-y-4">
            <h1
              className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              More fun {/* ORIG: from-orange-400 via-amber-300 to-orange-400 */}
              <span className="bg-gradient-to-r from-sky-300 via-sky-200 to-sky-300 bg-clip-text text-transparent">
                between the games.
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              A mini-game hub for March Madness fans featuring a themed
              Connections puzzle, a mini crossword, a Who Wants to Be a
              Millionaire style trivia game, and a career-path guessing game for
              March Madness legends.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* ORIG: from-orange-500 to-amber-500 shadow-orange-500/20 hover:shadow-orange-500/30 */}
            <Link
              href="/connections"
              className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Play Connections
            </Link>

            {/* ORIG: hover:border-orange-500/40 hover:text-orange-300 */}
            <Link
              href="/millionaire"
              className="rounded-full border border-[#1e2a45] bg-white/[0.04] px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300"
            >
              Try Trivia
            </Link>
          </div>
        </div>
      </section>

      {/* ── GAME CARDS SECTION ────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            {/* ORIG: text-orange-400 */}
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
              Pick a game
            </p>
            <h2
              className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Twelve ways to play
            </h2>
          </div>

          <p className="hidden max-w-md text-sm leading-6 text-gray-500 md:block">
            Quick, clean, and tournament-themed games built for college
            basketball fans.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.title}
              href={game.href}
              // ORIG: hover:border-orange-500/40 hover:shadow-[0_8px_32px_rgba(251,146,60,0.08)]
              className="group rounded-xl border border-[#1e2a45] bg-[#111827] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-[0_8px_32px_rgba(56,189,248,0.08)]"
            >
              <div className="flex h-full flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {/* ORIG: bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 */}
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sm text-sky-300 transition-colors group-hover:bg-sky-400/20">
                      {game.icon}
                    </span>
                    {/* ORIG: border-orange-500/20 bg-orange-500/[0.06] text-orange-400/80 */}
                    <span className="rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
                      {game.eyebrow}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* ORIG: group-hover:text-orange-300 */}
                    <h3 className="text-xl font-extrabold text-white transition group-hover:text-sky-300">
                      {game.title}
                    </h3>
                    <p className="text-sm leading-6 text-gray-500">
                      {game.description}
                    </p>
                  </div>
                </div>

                {/* ORIG: group-hover:text-orange-400 */}
                <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 transition group-hover:text-sky-300">
                  Play now
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

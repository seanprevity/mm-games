"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getHigherLowerGame, shufflePlayers } from "@/lib/higher-lower";

export default function HigherLowerPage() {
  const game = useMemo(() => getHigherLowerGame(), []);

  const [order, setOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(
    null,
  );
  const [gameOver, setGameOver] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    const shuffled = shufflePlayers(game.players);
    setOrder(shuffled.map((p) => p.id));
  }, [game.players]);

  const leftPlayer = useMemo(() => {
    if (order.length === 0) return null;
    return game.players.find((p) => p.id === order[currentIndex]) ?? null;
  }, [game.players, order, currentIndex]);

  const rightPlayer = useMemo(() => {
    if (order.length === 0) return null;
    return game.players.find((p) => p.id === order[currentIndex + 1]) ?? null;
  }, [game.players, order, currentIndex]);

  function handleGuess(guess: "higher" | "lower") {
    if (revealed || gameOver || !leftPlayer || !rightPlayer) return;

    const isHigher = rightPlayer.nilValue >= leftPlayer.nilValue;
    const isCorrect =
      (guess === "higher" && isHigher) || (guess === "lower" && !isHigher);

    setRevealed(true);
    setLastGuessCorrect(isCorrect);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      // Auto-advance after a brief pause to show the green outline
      setTimeout(() => {
        if (currentIndex + 2 >= order.length) {
          const shuffled = shufflePlayers(game.players);
          setOrder(shuffled.map((p) => p.id));
          setCurrentIndex(0);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setRevealed(false);
        setLastGuessCorrect(null);
      }, 1200);
    } else {
      setGameOver(true);
      setTimeout(() => setShowGameOver(true), 800);
    }
  }

  function resetGame() {
    const shuffled = shufflePlayers(game.players);
    setOrder(shuffled.map((p) => p.id));
    setCurrentIndex(0);
    setStreak(0);
    setRevealed(false);
    setLastGuessCorrect(null);
    setGameOver(false);
    setShowGameOver(false);
  }

  if (!leftPlayer || !rightPlayer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-xl space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {game.title}
        </h1>
        <p className="mx-auto max-w-lg text-sm text-gray-400">
          {game.description}
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-5">
        {/* ── Streak Bar ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              Streak
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Best: <span className="font-bold text-white">{bestStreak}</span>
              </span>
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm font-bold text-sky-300">
                {streak} 🔥
              </span>
            </div>
          </div>
        </div>

        {/* ── Photo Cards ────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ── Left Player: value shown ─────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1e2a45]">
            <div className="relative aspect-[3/4]">
              <Image
                src={leftPlayer.photo}
                alt={leftPlayer.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                {leftPlayer.team}
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-white">
                {leftPlayer.name}
              </p>
              <div className="mt-3 inline-block rounded-xl bg-black/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                  NIL Valuation
                </p>
                <p className="text-2xl font-black text-sky-300">
                  {leftPlayer.nilDisplay}
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Player: guess here ─────────────────────── */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 transition-colors ${
              revealed
                ? lastGuessCorrect
                  ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                  : "border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.15)]"
                : "border-[#1e2a45]"
            }`}
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={rightPlayer.photo}
                alt={rightPlayer.name}
                fill
                className="object-cover"
              />
              <div
                className={`absolute inset-0 transition-colors ${
                  revealed
                    ? lastGuessCorrect
                      ? "bg-gradient-to-t from-emerald-900/70 via-black/40 to-black/20"
                      : "bg-gradient-to-t from-red-900/70 via-black/40 to-black/20"
                    : "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                }`}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                {rightPlayer.team}
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-white">
                {rightPlayer.name}
              </p>

              {revealed ? (
                <div className="mt-3">
                  <div className="inline-block rounded-xl bg-black/40 px-4 py-2 backdrop-blur-sm">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                      NIL Valuation
                    </p>
                    <p className="text-2xl font-black text-sky-300">
                      {rightPlayer.nilDisplay}
                    </p>
                  </div>
                  <p
                    className={`mt-3 text-sm font-bold ${
                      lastGuessCorrect ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {lastGuessCorrect ? "✓ Correct!" : "✗ Wrong!"}
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuess("higher")}
                    className="flex-1 rounded-xl bg-emerald-500/80 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    ↑ Higher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGuess("lower")}
                    className="flex-1 rounded-xl bg-red-500/80 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-red-500 active:scale-[0.97]"
                  >
                    ↓ Lower
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Game Over Modal Popup ────────────────────────────── */}
        {showGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[#1e2a45] bg-[#111827] p-8 shadow-2xl shadow-black/40">
              {/* X button */}
              <button
                type="button"
                onClick={() => setShowGameOver(false)}
                className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center">
                <h2
                  className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-3xl font-extrabold text-transparent"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Game Over
                </h2>

                <div className="mt-5 flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-black text-sky-300">{streak}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Final Streak
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">
                      {bestStreak}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Best Streak
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={resetGame}
                    className="w-full rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    Play Again
                  </button>
                  <Link
                    href="/"
                    className="w-full rounded-full border border-[#1e2a45] bg-white/[0.04] px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300"
                  >
                    Quit to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
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

  // Shuffle on mount to avoid hydration mismatch
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
    } else {
      setGameOver(true);
    }
  }

  function handleNext() {
    if (!revealed || gameOver) return;

    // Check if we have another player to show
    if (currentIndex + 2 >= order.length) {
      // Reshuffle and continue the streak
      const shuffled = shufflePlayers(game.players);
      setOrder(shuffled.map((p) => p.id));
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    setRevealed(false);
    setLastGuessCorrect(null);
  }

  function resetGame() {
    const shuffled = shufflePlayers(game.players);
    setOrder(shuffled.map((p) => p.id));
    setCurrentIndex(0);
    setStreak(0);
    setRevealed(false);
    setLastGuessCorrect(null);
    setGameOver(false);
  }

  // Loading state before shuffle
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

      <section className="mx-auto max-w-2xl space-y-5">
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

        {!gameOver ? (
          /* ── Comparison Cards ───────────────────────────────── */
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Left Player — value shown */}
            <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-5">
              <div className="mb-4 flex flex-col items-center gap-3">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#1e2a45] bg-[#0f1729]">
                  <Image
                    src={leftPlayer.photo}
                    alt={leftPlayer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-white">
                    {leftPlayer.name}
                  </p>
                  <p className="text-xs text-gray-500">{leftPlayer.team}</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#1e2a45] bg-[#0f1729] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  NIL Valuation
                </p>
                <p className="mt-1 text-2xl font-black text-sky-300">
                  {leftPlayer.nilDisplay}
                </p>
              </div>
            </div>

            {/* Right Player — value hidden until revealed */}
            <div
              className={`rounded-2xl border p-5 transition ${
                revealed
                  ? lastGuessCorrect
                    ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                    : "border-red-500/30 bg-red-500/[0.04]"
                  : "border-[#1e2a45] bg-[#111827]"
              }`}
            >
              <div className="mb-4 flex flex-col items-center gap-3">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#1e2a45] bg-[#0f1729]">
                  <Image
                    src={rightPlayer.photo}
                    alt={rightPlayer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-white">
                    {rightPlayer.name}
                  </p>
                  <p className="text-xs text-gray-500">{rightPlayer.team}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1e2a45] bg-[#0f1729] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  NIL Valuation
                </p>
                {revealed ? (
                  <p className="mt-1 text-2xl font-black text-sky-300">
                    {rightPlayer.nilDisplay}
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-black text-gray-600">?</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Guess Buttons / Result / Game Over ──────────────── */}
        {!gameOver && !revealed && (
          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Is {rightPlayer.name}'s NIL valuation higher or lower than{" "}
              {leftPlayer.nilDisplay}?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => handleGuess("higher")}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
              >
                ↑ Higher
              </button>
              <button
                type="button"
                onClick={() => handleGuess("lower")}
                className="rounded-full bg-gradient-to-r from-red-500 to-red-400 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20 transition hover:shadow-red-500/30"
              >
                ↓ Lower
              </button>
            </div>
          </div>
        )}

        {!gameOver && revealed && lastGuessCorrect && (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-emerald-400">
              Correct! {rightPlayer.name} is valued at {rightPlayer.nilDisplay}.
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Next
            </button>
          </div>
        )}

        {gameOver && (
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-10 text-center">
            {/* Still show the two cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1e2a45] bg-[#0f1729] p-4 text-center">
                <p className="text-sm font-bold text-white">
                  {leftPlayer.name}
                </p>
                <p className="text-xl font-black text-sky-300">
                  {leftPlayer.nilDisplay}
                </p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/[0.04] p-4 text-center">
                <p className="text-sm font-bold text-white">
                  {rightPlayer.name}
                </p>
                <p className="text-xl font-black text-sky-300">
                  {rightPlayer.nilDisplay}
                </p>
              </div>
            </div>

            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Game Over
            </h2>

            <div className="mt-4 flex justify-center gap-8">
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

            <button
              type="button"
              onClick={resetGame}
              className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Play Again
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

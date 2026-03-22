"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getPlayerPathGame } from "@/lib/player";

function normalizeGuess(value: string) {
  return value.trim().toLowerCase();
}

function GuessDots({ remaining, total }: { remaining: number; total: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Guesses left
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const used = i >= remaining;

          return (
            <div
              key={i}
              // ORIG: used ? "bg-gray-300" : "bg-black"
              className={`h-2.5 w-2.5 rounded-full ${
                used ? "bg-white/10" : "bg-sky-400"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PlayerPathPage() {
  const game = useMemo(() => getPlayerPathGame(), []);
  const maxGuesses = 3;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [revealedHintIndices, setRevealedHintIndices] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [isOutOfGuesses, setIsOutOfGuesses] = useState(false);
  const [message, setMessage] = useState("");

  const currentPlayer = game.players[currentIndex];

  const hiddenIndices = useMemo(() => {
    const totalStops = currentPlayer.careerPath.length;

    if (totalStops <= 2) return [];

    return currentPlayer.careerPath
      .map((_, index) => index)
      .filter((index) => index >= 2);
  }, [currentPlayer]);

  const hiddenIndexSet = new Set(hiddenIndices);
  const revealedHintSet = new Set(revealedHintIndices);

  const hiddenStopsRemaining = hiddenIndices.filter(
    (index) => !revealedHintSet.has(index),
  ).length;

  const guessesRemaining = maxGuesses - guesses.length;
  const canGuess = !isSolved && !isOutOfGuesses;
  const isRoundFinished = isSolved || isOutOfGuesses;
  const isLastPlayer = currentIndex === game.players.length - 1;

  function handleSubmitGuess() {
    if (!guess.trim() || !canGuess) return;

    const submittedGuess = guess.trim();
    const normalizedSubmitted = normalizeGuess(submittedGuess);
    const normalizedAnswer = normalizeGuess(currentPlayer.playerName);

    const nextGuesses = [...guesses, submittedGuess];
    setGuesses(nextGuesses);

    if (normalizedSubmitted === normalizedAnswer) {
      setIsSolved(true);
      setMessage("");
      setGuess("");
      return;
    }

    const remaining = maxGuesses - nextGuesses.length;

    if (remaining <= 0) {
      setIsOutOfGuesses(true);
      setMessage("Out of guesses.");
    } else {
      setMessage(
        `Not quite. ${remaining} guess${remaining === 1 ? "" : "es"} left.`,
      );
    }

    setGuess("");
  }

  function handleRevealHint() {
    if (!canGuess) return;

    const nextHiddenIndex = hiddenIndices.find(
      (index) => !revealedHintSet.has(index),
    );

    if (nextHiddenIndex === undefined) return;

    setRevealedHintIndices((prev) => [...prev, nextHiddenIndex]);
    setMessage("");
  }

  function handleNextPlayer() {
    if (isLastPlayer) return;

    setCurrentIndex((prev) => prev + 1);
    setGuess("");
    setGuesses([]);
    setRevealedHintIndices([]);
    setIsSolved(false);
    setIsOutOfGuesses(false);
    setMessage("");
  }

  return (
    // ORIG: <div className="space-y-8">
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      {/* ORIG: <section className="mx-auto max-w-xl space-y-2 text-center"> */}
      <section className="mx-auto max-w-xl space-y-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
          March Madness Edition
        </p>
        {/* ORIG: text-3xl font-bold */}
        <h1
          className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {game.title}
        </h1>
        {/* ORIG: text-gray-600 */}
        <p className="mx-auto max-w-xl text-sm text-gray-400">
          Follow the career path and guess the player. Only the first two stops
          are shown at first. Reveal more teams if you need help.
        </p>
      </section>

      <section className="mx-auto max-w-6xl space-y-5">
        {/* ══════════════════════════════════════════════════════════ */}
        {/*  CAREER PATH CARD                                          */}
        {/* ══════════════════════════════════════════════════════════ */}
        {/* ORIG: rounded-3xl border border-gray-200 bg-white p-6 shadow-sm */}
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            {/* ORIG: text-xl font-bold text-gray-900 */}
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
              Career Path
            </h3>

            {/* ORIG: rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-white */}
            <button
              type="button"
              onClick={handleRevealHint}
              disabled={hiddenStopsRemaining === 0 || !canGuess}
              className="cursor-pointer rounded-full border border-[#1e2a45] bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Reveal Hidden Team
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
            {currentPlayer.careerPath.map((stop, index) => {
              const isLast = index === currentPlayer.careerPath.length - 1;
              const isHidden =
                hiddenIndexSet.has(index) && !revealedHintSet.has(index);

              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex w-28 flex-col items-center text-center sm:w-32">
                    {/* ORIG: text-sm font-semibold text-gray-900 */}
                    <p className="mb-1 text-sm font-semibold text-gray-200">
                      {isHidden ? (
                        <span className="text-gray-500">Hidden Team</span>
                      ) : (
                        stop.team
                      )}
                    </p>

                    {isHidden ? (
                      // ORIG: bg-gray-200 text-gray-500
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1e2a45] bg-white/[0.04] text-lg font-bold text-gray-600 sm:h-20 sm:w-20">
                        ?
                      </div>
                    ) : stop.logo ? (
                      <Image
                        src={stop.logo}
                        alt={stop.team}
                        width={72}
                        height={72}
                        className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                      />
                    ) : (
                      // ORIG: bg-gray-100 text-gray-500
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1e2a45] bg-white/[0.04] text-xs font-semibold text-gray-500 sm:h-20 sm:w-20">
                        No logo
                      </div>
                    )}

                    {/* ORIG: text-sm text-gray-500 */}
                    <p className="mt-1 text-xs text-gray-400">
                      {isHidden ? "Reveal to see" : stop.years}
                    </p>
                  </div>

                  {/* ORIG: text-gray-400 */}
                  {!isLast && <span className="text-gray-600">→</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  GUESS CARD                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        {/* ORIG: rounded-3xl border bg-white p-5 shadow-sm / isSolved ? border-green-300 bg-green-50 : border-gray-200 */}
        <div
          className={`rounded-2xl border p-5 transition ${
            isSolved
              ? "border-emerald-500/40 bg-emerald-500/[0.06]"
              : "border-[#1e2a45] bg-[#111827]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            {/* ORIG: text-lg font-bold */}
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-300">
              Your Guess
            </h3>
            <GuessDots remaining={guessesRemaining} total={maxGuesses} />
          </div>

          {/* ── Result banners ───────────────────────────────────── */}
          {isSolved && (
            // ORIG: rounded-2xl bg-green-100 p-3 font-semibold text-green-900
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-300">
              Correct! — {currentPlayer.playerName}
            </div>
          )}

          {!isSolved && isRoundFinished && (
            // ORIG: rounded-2xl bg-red-50 p-3 text-red-900
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {message} — {currentPlayer.playerName}
            </div>
          )}

          {!isSolved && message && !isOutOfGuesses && (
            // ORIG: text-red-600
            <p className="mb-4 text-sm text-sky-300">{message}</p>
          )}

          {/* ── Input row ────────────────────────────────────────── */}
          <div className="flex justify-center gap-2.5">
            {/* ORIG: w-56 rounded-xl border px-3 py-2.5 text-sm */}
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitGuess();
              }}
              disabled={!canGuess}
              placeholder="Enter player name…"
              className="w-56 rounded-xl border border-[#1e2a45] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20 disabled:opacity-40"
            />
            {/* ORIG: rounded-xl bg-black px-3.5 py-2.5 text-sm text-white */}
            <button
              onClick={handleSubmitGuess}
              disabled={!canGuess}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-sky-400 to-sky-300 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
            >
              Submit
            </button>
          </div>

          {/* ── Next Player button ───────────────────────────────── */}
          {isRoundFinished && !isLastPlayer && (
            // ORIG: mt-4 bg-black text-white px-4 py-2 rounded-full
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleNextPlayer}
                className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
              >
                Next Player
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

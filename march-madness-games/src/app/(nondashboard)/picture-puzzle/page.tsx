"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getPicturePuzzleGame } from "@/lib/picture-puzzle";

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
}

export default function PicturePuzzlePage() {
  const game = useMemo(() => getPicturePuzzleGame(), []);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [locked, setLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const currentRound = game.rounds[currentRoundIndex] ?? null;
  const isLastRound = currentRoundIndex === game.rounds.length - 1;
  const totalCorrect = results.filter(Boolean).length;

  function handleSubmit() {
    if (locked || !currentRound || !guess.trim()) return;

    const normalized = normalizeAnswer(guess);
    const correct = currentRound.acceptableAnswers.some(
      (a) => normalizeAnswer(a) === normalized,
    );

    setIsCorrect(correct);
    setLocked(true);
    setResults((prev) => [...prev, correct]);
  }

  function handleNextRound() {
    if (!locked) return;
    if (isLastRound) {
      setGameOver(true);
      return;
    }
    setCurrentRoundIndex((prev) => prev + 1);
    setGuess("");
    setLocked(false);
    setIsCorrect(false);
  }

  function resetGame() {
    setCurrentRoundIndex(0);
    setGuess("");
    setLocked(false);
    setIsCorrect(false);
    setResults([]);
    setGameOver(false);
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

      <section className="mx-auto max-w-xl space-y-5">
        {/* ── Score Bar ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              Scorecard
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Puzzle{" "}
                <span className="font-bold text-white">
                  {Math.min(currentRoundIndex + 1, game.rounds.length)}
                </span>
                <span className="text-gray-600">/{game.rounds.length}</span>
              </span>
              {results.length > 0 && (
                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm font-bold text-sky-300">
                  {totalCorrect}/{results.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {!gameOver && currentRound ? (
          <>
            {/* ── Puzzle Card ─────────────────────────────────── */}
            <div
              className={`rounded-2xl border p-6 transition ${
                locked
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                    : "border-red-500/30 bg-red-500/[0.04]"
                  : "border-[#1e2a45] bg-[#111827]"
              }`}
            >
              <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                What March Madness moment is this?
              </p>

              {/* Visual Clue Cards */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {currentRound.clues.map((clue, i) => (
                  <div
                    key={i}
                    className="relative h-40 overflow-hidden rounded-xl border border-[#1e2a45]"
                  >
                    <Image
                      src={clue.image}
                      alt={`Clue ${i + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Clue number */}
                    <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white/80 backdrop-blur-sm">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Guess Input */}
              {!locked ? (
                <div className="space-y-3">
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                    placeholder="Describe the March Madness moment…"
                    className="w-full rounded-xl border border-[#1e2a45] bg-white/[0.04] px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20"
                  />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:cursor-pointer hover:shadow-sky-400/30"
                    >
                      Lock In Guess
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Result banner */}
                  <div
                    className={`rounded-xl border p-4 text-center ${
                      isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        isCorrect ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {isCorrect ? "✓ Correct!" : "✗ Not quite"}
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-white">
                      {currentRound.answer}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="rounded-xl border border-[#1e2a45] bg-[#0f1729] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      The Story
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-300">
                      {currentRound.description}
                    </p>
                  </div>

                  {!isCorrect && guess.trim() && (
                    <p className="text-center text-xs text-gray-500">
                      You guessed: {guess}
                    </p>
                  )}

                  {/* Next button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleNextRound}
                      className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:cursor-pointer hover:shadow-sky-400/30"
                    >
                      {isLastRound ? "See Results" : "Next Puzzle"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Progress Dots ────────────────────────────────── */}
            <div className="flex justify-center gap-1.5">
              {game.rounds.map((round, i) => {
                const isCurrent = i === currentRoundIndex;
                const result = results[i];

                let dotClass = "bg-white/[0.06]";
                if (result !== undefined) {
                  dotClass = result ? "bg-emerald-400" : "bg-red-400/60";
                } else if (isCurrent) {
                  dotClass = "bg-sky-400";
                }

                return (
                  <div
                    key={round.id}
                    className={`h-2 w-2 rounded-full transition-colors ${dotClass}`}
                  />
                );
              })}
            </div>
          </>
        ) : gameOver ? (
          /* ── Game Over ──────────────────────────────────────── */
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-10 text-center">
            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {totalCorrect === game.rounds.length
                ? "Perfect Eye!"
                : totalCorrect >= game.rounds.length - 1
                  ? "Sharp!"
                  : totalCorrect >= Math.ceil(game.rounds.length / 2)
                    ? "Not Bad"
                    : "Game Over"}
            </h2>

            <div className="mt-6">
              <p className="text-5xl font-black text-sky-300">
                {totalCorrect}
                <span className="text-2xl text-gray-500">
                  /{game.rounds.length}
                </span>
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Puzzles Solved
              </p>
            </div>

            {/* Breakdown */}
            <div className="mx-auto mt-8 max-w-sm space-y-2">
              {game.rounds.map((round, i) => (
                <div
                  key={round.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                    results[i]
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <span className="truncate">{round.answer}</span>
                  <span>{results[i] ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:cursor-pointer hover:shadow-sky-400/30"
            >
              Play Again
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getHeightGolfGame, inchesToDisplay } from "@/lib/golf";

interface HoleResult {
  holeId: number;
  playerName: string;
  actualInches: number;
  guessedInches: number;
  strokes: number;
}

function ScoreBar({
  totalStrokes,
  holesPlayed,
  totalHoles,
}: {
  totalStrokes: number;
  holesPlayed: number;
  totalHoles: number;
}) {
  return (
    <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          Scorecard
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Hole{" "}
            <span className="font-bold text-white">
              {Math.min(holesPlayed + 1, totalHoles)}
            </span>
            <span className="text-gray-600">/{totalHoles}</span>
          </span>
          <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm font-bold text-sky-300">
            {totalStrokes === 0 ? "E" : `+${totalStrokes}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HeightGolfPage() {
  const game = useMemo(() => getHeightGolfGame(), []);

  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [feet, setFeet] = useState(6);
  const [inches, setInches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState<HoleResult[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const currentHole = game.holes[currentHoleIndex] ?? null;
  const isLastHole = currentHoleIndex === game.holes.length - 1;
  const totalStrokes = results.reduce((sum, r) => sum + r.strokes, 0);

  const currentResult =
    locked && currentHole
      ? results.find((r) => r.holeId === currentHole.id)
      : null;

  function handleLock() {
    if (locked || !currentHole) return;

    const guessedInches = feet * 12 + inches;
    const strokes = Math.abs(guessedInches - currentHole.heightInches);

    setResults((prev) => [
      ...prev,
      {
        holeId: currentHole.id,
        playerName: currentHole.playerName,
        actualInches: currentHole.heightInches,
        guessedInches,
        strokes,
      },
    ]);
    setLocked(true);
  }

  function handleNextHole() {
    if (!locked) return;
    if (isLastHole) {
      setGameOver(true);
      return;
    }
    setCurrentHoleIndex((prev) => prev + 1);
    setFeet(6);
    setInches(0);
    setLocked(false);
  }

  function resetGame() {
    setCurrentHoleIndex(0);
    setFeet(6);
    setInches(0);
    setLocked(false);
    setResults([]);
    setGameOver(false);
  }

  function getScoreLabel(strokes: number) {
    if (strokes === 0) return "Hole in One!";
    if (strokes === 1) return "Birdie!";
    if (strokes === 2) return "Par";
    if (strokes <= 4) return "Bogey";
    return "Rough hole";
  }

  function getScoreColor(strokes: number) {
    if (strokes === 0) return "text-amber-300";
    if (strokes === 1) return "text-emerald-400";
    if (strokes === 2) return "text-sky-300";
    return "text-red-400";
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
        <ScoreBar
          totalStrokes={totalStrokes}
          holesPlayed={results.length}
          totalHoles={game.holes.length}
        />

        {!gameOver && currentHole ? (
          <>
            {/* ── Player Card ─────────────────────────────────── */}
            <div
              className={`rounded-2xl border p-6 transition ${
                locked && currentResult
                  ? currentResult.strokes <= 1
                    ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                    : currentResult.strokes <= 3
                      ? "border-sky-400/40 bg-sky-400/[0.04]"
                      : "border-red-500/30 bg-red-500/[0.04]"
                  : "border-[#1e2a45] bg-[#111827]"
              }`}
            >
              {/* Player info */}
              <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#1e2a45] bg-[#0f1729]">
                  <Image
                    src={currentHole.photo}
                    alt={currentHole.playerName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                    Hole {currentHoleIndex + 1}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">
                    {currentHole.playerName}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {currentHole.team}
                  </p>
                </div>
              </div>

              {/* ── Height Picker ─────────────────────────────── */}
              {!locked && (
                <div className="space-y-4">
                  <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                    Your guess
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {/* Feet selector */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFeet((f) => Math.max(5, f - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e2a45] bg-[#0f1729] text-lg font-bold text-gray-400 transition hover:border-sky-400/40 hover:text-sky-300"
                      >
                        −
                      </button>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-2xl font-black text-white">
                        {feet}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeet((f) => Math.min(7, f + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e2a45] bg-[#0f1729] text-lg font-bold text-gray-400 transition hover:border-sky-400/40 hover:text-sky-300"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-2xl font-black text-gray-500">'</span>

                    {/* Inches selector */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInches((i) => Math.max(0, i - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e2a45] bg-[#0f1729] text-lg font-bold text-gray-400 transition hover:border-sky-400/40 hover:text-sky-300"
                      >
                        −
                      </button>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#1e2a45] bg-[#0f1729] text-2xl font-black text-white">
                        {inches}
                      </div>
                      <button
                        type="button"
                        onClick={() => setInches((i) => Math.min(11, i + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e2a45] bg-[#0f1729] text-lg font-bold text-gray-400 transition hover:border-sky-400/40 hover:text-sky-300"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-2xl font-black text-gray-500">"</span>
                  </div>

                  <p className="text-center text-lg font-bold text-white">
                    {inchesToDisplay(feet * 12 + inches)}
                  </p>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleLock}
                      className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                    >
                      Lock In Guess
                    </button>
                  </div>
                </div>
              )}

              {/* ── Result ────────────────────────────────────── */}
              {locked && currentResult && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#1e2a45] bg-[#0f1729] p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Actual Height
                    </p>
                    <p className="mt-1 text-3xl font-black text-white">
                      {currentHole.heightDisplay}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Your Guess
                      </p>
                      <p className="text-lg font-bold text-gray-300">
                        {inchesToDisplay(currentResult.guessedInches)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#1e2a45]" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Off By
                      </p>
                      <p
                        className={`text-lg font-bold ${getScoreColor(currentResult.strokes)}`}
                      >
                        {currentResult.strokes === 0
                          ? "Exact!"
                          : `${currentResult.strokes} inch${currentResult.strokes === 1 ? "" : "es"}`}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#1e2a45]" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Score
                      </p>
                      <p
                        className={`text-lg font-bold ${getScoreColor(currentResult.strokes)}`}
                      >
                        {getScoreLabel(currentResult.strokes)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleNextHole}
                      className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                    >
                      {isLastHole ? "See Scorecard" : "Next Hole"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Hole Progress Dots ──────────────────────────── */}
            <div className="flex justify-center gap-1.5">
              {game.holes.map((hole, i) => {
                const isCurrent = i === currentHoleIndex;
                const result = results.find((r) => r.holeId === hole.id);

                let dotClass = "bg-white/[0.06]";
                if (result) {
                  if (result.strokes <= 1) dotClass = "bg-emerald-400";
                  else if (result.strokes <= 3) dotClass = "bg-sky-400";
                  else dotClass = "bg-red-400/60";
                } else if (isCurrent) {
                  dotClass = "bg-sky-400";
                }

                return (
                  <div
                    key={hole.id}
                    className={`h-2 w-2 rounded-full transition-colors ${dotClass}`}
                  />
                );
              })}
            </div>
          </>
        ) : gameOver ? (
          /* ── Scorecard ──────────────────────────────────────── */
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-10 text-center">
            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {totalStrokes === 0
                ? "Perfect Round!"
                : totalStrokes <= game.holes.length
                  ? "Great Round!"
                  : totalStrokes <= game.holes.length * 3
                    ? "Solid Round"
                    : "Tough Round"}
            </h2>

            <div className="mt-6">
              <p className="text-5xl font-black text-sky-300">
                +{totalStrokes}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Total Strokes ({totalStrokes} inches off)
              </p>
            </div>

            {/* ── Hole by Hole Breakdown ──────────────────────── */}
            <div className="mx-auto mt-8 max-w-sm space-y-1.5">
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                <span>Player</span>
                <div className="flex gap-8">
                  <span>Guess</span>
                  <span>Actual</span>
                  <span className="w-8 text-right">Off</span>
                </div>
              </div>
              {results.map((result) => (
                <div
                  key={result.holeId}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                    result.strokes <= 1
                      ? "bg-emerald-500/10 text-emerald-400"
                      : result.strokes <= 3
                        ? "bg-sky-400/10 text-sky-300"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <span className="truncate">{result.playerName}</span>
                  <div className="flex gap-6 text-right">
                    <span className="w-10">
                      {inchesToDisplay(result.guessedInches)}
                    </span>
                    <span className="w-10">
                      {inchesToDisplay(result.actualInches)}
                    </span>
                    <span className="w-8 text-right">
                      {result.strokes === 0 ? "✓" : `+${result.strokes}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
            >
              Play Again
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

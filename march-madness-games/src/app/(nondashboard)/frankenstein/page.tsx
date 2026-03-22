"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getFrankensteinGame } from "@/lib/frankenstein";

type Segment = "top" | "middle" | "bottom";

const SEGMENT_LABELS: Record<Segment, string> = {
  top: "Forehead",
  middle: "Eyes & Nose",
  bottom: "Mouth & Chin",
};

const SEGMENTS: Segment[] = ["top", "middle", "bottom"];

function normalizeGuess(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, "");
}

export default function FrankensteinPage() {
  const game = useMemo(() => getFrankensteinGame(), []);
  const round = game.rounds[0];

  const [guesses, setGuesses] = useState<Record<Segment, string>>({
    top: "",
    middle: "",
    bottom: "",
  });
  const [segmentResults, setSegmentResults] = useState<
    Record<Segment, boolean | null>
  >({
    top: null,
    middle: null,
    bottom: null,
  });
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  function getPlayerForSegment(segment: Segment) {
    if (segment === "top") return round.topPlayer;
    if (segment === "middle") return round.middlePlayer;
    return round.bottomPlayer;
  }

  function handleGuessChange(segment: Segment, value: string) {
    if (locked) return;
    setGuesses((prev) => ({ ...prev, [segment]: value }));
  }

  function handleLockAll() {
    if (locked) return;

    const newResults: Record<Segment, boolean> = {
      top: false,
      middle: false,
      bottom: false,
    };

    let correct = 0;

    for (const segment of SEGMENTS) {
      const player = getPlayerForSegment(segment);
      const normalized = normalizeGuess(guesses[segment]);
      const normalizedAnswer = normalizeGuess(player.name);

      const lastNameParts = player.name.split(" ");
      const lastName = normalizeGuess(lastNameParts[lastNameParts.length - 1]);

      const isCorrect =
        normalized === normalizedAnswer || normalized === lastName;
      newResults[segment] = isCorrect;
      if (isCorrect) correct++;
    }

    setSegmentResults(newResults);
    setLocked(true);
    setScore(correct);
  }

  function resetGame() {
    setGuesses({ top: "", middle: "", bottom: "" });
    setSegmentResults({ top: null, middle: null, bottom: null });
    setLocked(false);
    setScore(0);
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
        {!locked ? (
          /* ── Game Card ──────────────────────────────────────── */
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-6">
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Who makes up this face?
            </p>

            {/* Stacked face images — no overlays */}
            <div className="mx-auto mb-6 w-64 overflow-hidden rounded-2xl border border-[#1e2a45]">
              {SEGMENTS.map((segment) => {
                const player = getPlayerForSegment(segment);
                return (
                  <div key={segment} className="relative h-28 w-full">
                    <Image
                      src={player.image}
                      alt={`${segment} segment`}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* ── Guess Inputs ────────────────────────────────── */}
            <div className="space-y-3">
              {SEGMENTS.map((segment) => (
                <div key={segment} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {SEGMENT_LABELS[segment]}
                  </span>
                  <input
                    value={guesses[segment]}
                    onChange={(e) => handleGuessChange(segment, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLockAll();
                    }}
                    placeholder={`Guess the ${SEGMENT_LABELS[segment].toLowerCase()} player…`}
                    className="w-full rounded-xl border border-[#1e2a45] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20"
                  />
                </div>
              ))}
            </div>

            {/* ── Lock Button ─────────────────────────────────── */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={handleLockAll}
                className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
              >
                Lock In Guesses
              </button>
            </div>
          </div>
        ) : (
          /* ── Results ────────────────────────────────────────── */
          <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-8 text-center">
            <h2
              className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 bg-clip-text text-4xl font-extrabold text-transparent"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {score === 3
                ? "Perfect!"
                : score >= 2
                  ? "Great Eye!"
                  : score === 1
                    ? "Not Bad"
                    : "Game Over"}
            </h2>

            <div className="mt-4">
              <p className="text-5xl font-black text-sky-300">
                {score}
                <span className="text-2xl text-gray-500">/3</span>
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Correct
              </p>
            </div>

            {/* Face with result rings */}
            <div className="mx-auto my-6 w-64 overflow-hidden rounded-2xl border border-[#1e2a45]">
              {SEGMENTS.map((segment) => {
                const player = getPlayerForSegment(segment);
                const isCorrect = segmentResults[segment];
                return (
                  <div
                    key={segment}
                    className={`relative h-28 w-full ${
                      isCorrect
                        ? "ring-2 ring-inset ring-emerald-400/50"
                        : "ring-2 ring-inset ring-red-400/50"
                    }`}
                  >
                    <Image
                      src={player.image}
                      alt={`${segment} segment`}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Breakdown */}
            <div className="mx-auto max-w-sm space-y-1.5">
              {SEGMENTS.map((segment) => {
                const player = getPlayerForSegment(segment);
                const isCorrect = segmentResults[segment];
                return (
                  <div
                    key={segment}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <span>
                      {SEGMENT_LABELS[segment]}: {player.name}
                    </span>
                    <span>{isCorrect ? "✓" : "✗"}</span>
                  </div>
                );
              })}
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

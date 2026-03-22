"use client";

import { useMemo, useState } from "react";
import { getRiddleGame, type RiddleField } from "@/lib/riddle";

const FIELDS: { key: RiddleField; label: string; placeholder: string }[] = [
  { key: "team1", label: "Team 1", placeholder: "First team…" },
  { key: "team2", label: "Team 2", placeholder: "Second team…" },
  { key: "event", label: "Event Name", placeholder: "Name of the event…" },
  { key: "year", label: "Year", placeholder: "Year it happened…" },
];

const RIDDLE_ICONS: Record<RiddleField, string> = {
  team1: "🏀",
  team2: "🏀",
  event: "🏆",
  year: "📅",
};

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
}

interface RoundResult {
  results: Record<RiddleField, boolean>;
  score: number;
}

export default function RiddlePage() {
  const game = useMemo(() => getRiddleGame(), []);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [guesses, setGuesses] = useState<Record<RiddleField, string>>({
    team1: "",
    team2: "",
    event: "",
    year: "",
  });
  const [locked, setLocked] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const currentRound = game.rounds[currentRoundIndex] ?? null;
  const isLastRound = currentRoundIndex === game.rounds.length - 1;
  const totalCorrect = roundResults.reduce((sum, r) => sum + r.score, 0);
  const totalPossible = roundResults.length * 4;

  function handleGuessChange(field: RiddleField, value: string) {
    if (locked) return;
    setGuesses((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (locked || !currentRound) return;

    const results: Record<RiddleField, boolean> = {
      team1: false,
      team2: false,
      event: false,
      year: false,
    };

    let score = 0;

    for (const field of FIELDS) {
      const normalized = normalizeAnswer(guesses[field.key]);
      const answer = normalizeAnswer(currentRound.answers[field.key]);

      // For teams, also check if the guess matches either team (flexible ordering)
      let isCorrect = normalized === answer;

      // Allow team answers in either box
      if (!isCorrect && (field.key === "team1" || field.key === "team2")) {
        const otherTeamKey = field.key === "team1" ? "team2" : "team1";
        const otherAnswer = normalizeAnswer(currentRound.answers[otherTeamKey]);
        const otherGuess = normalizeAnswer(guesses[otherTeamKey]);

        // If this guess matches the other team's answer AND the other guess matches this answer
        if (normalized === otherAnswer && otherGuess === answer) {
          isCorrect = true;
        }
        // Or if this guess matches the other answer and the other box hasn't taken it
        if (normalized === otherAnswer && otherGuess !== otherAnswer) {
          isCorrect = true;
        }
      }

      results[field.key] = isCorrect;
      if (isCorrect) score++;
    }

    const result = { results, score };
    setRoundResult(result);
    setRoundResults((prev) => [...prev, result]);
    setLocked(true);
  }

  function handleNextRound() {
    if (!locked) return;
    if (isLastRound) {
      setGameOver(true);
      return;
    }
    setCurrentRoundIndex((prev) => prev + 1);
    setGuesses({ team1: "", team2: "", event: "", year: "" });
    setLocked(false);
    setRoundResult(null);
  }

  function resetGame() {
    setCurrentRoundIndex(0);
    setGuesses({ team1: "", team2: "", event: "", year: "" });
    setLocked(false);
    setRoundResult(null);
    setRoundResults([]);
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

      <section className="mx-auto max-w-2xl space-y-5">
        {/* ── Score Bar ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
              Scorecard
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Round{" "}
                <span className="font-bold text-white">
                  {Math.min(currentRoundIndex + 1, game.rounds.length)}
                </span>
                <span className="text-gray-600">/{game.rounds.length}</span>
              </span>
              {totalPossible > 0 && (
                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm font-bold text-sky-300">
                  {totalCorrect}/{totalPossible}
                </span>
              )}
            </div>
          </div>
        </div>

        {!gameOver && currentRound ? (
          <>
            {/* ── Riddle Card ─────────────────────────────────── */}
            <div className="rounded-2xl border border-[#1e2a45] bg-[#111827] p-6">
              <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Read the riddles, guess the moment
              </p>

              {/* Riddles */}
              <div className="mb-6 space-y-3">
                {FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start gap-3 rounded-xl border border-[#1e2a45] bg-[#0f1729] px-4 py-3"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sm">
                      {RIDDLE_ICONS[field.key]}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {field.label} Riddle
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-300">
                        {currentRound.riddles[field.key]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guess Inputs */}
              <div className="space-y-3">
                {FIELDS.map((field) => {
                  const isCorrect = roundResult?.results[field.key];
                  const answer = currentRound.answers[field.key];

                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {field.label}
                        </span>
                        {locked && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCorrect ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        )}
                      </div>

                      {!locked ? (
                        <input
                          value={guesses[field.key]}
                          onChange={(e) =>
                            handleGuessChange(field.key, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                          }}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-[#1e2a45] bg-white/[0.04] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20"
                        />
                      ) : (
                        <div
                          className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                            isCorrect
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-red-500/30 bg-red-500/10 text-red-300"
                          }`}
                        >
                          <span>{answer}</span>
                          {!isCorrect && guesses[field.key].trim() && (
                            <span className="text-xs text-gray-500">
                              You said: {guesses[field.key]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Score for this round */}
              {locked && roundResult && (
                <div className="mt-4 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      roundResult.score === 4
                        ? "text-emerald-400"
                        : roundResult.score >= 2
                          ? "text-sky-300"
                          : "text-red-400"
                    }`}
                  >
                    {roundResult.score === 4
                      ? "Perfect — all 4 correct!"
                      : `${roundResult.score}/4 correct`}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex justify-center">
                {!locked ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    Lock In Answers
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-400/20 transition hover:shadow-sky-400/30"
                  >
                    {isLastRound ? "See Results" : "Next Round"}
                  </button>
                )}
              </div>
            </div>

            {/* ── Round Progress Dots ─────────────────────────── */}
            <div className="flex justify-center gap-1.5">
              {game.rounds.map((round, i) => {
                const isCurrent = i === currentRoundIndex;
                const result = roundResults[i];

                let dotClass = "bg-white/[0.06]";
                if (result) {
                  if (result.score === 4) dotClass = "bg-emerald-400";
                  else if (result.score >= 2) dotClass = "bg-sky-400";
                  else dotClass = "bg-red-400/60";
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
              {totalCorrect === game.rounds.length * 4
                ? "Perfect!"
                : totalCorrect >= game.rounds.length * 3
                  ? "March Madness Expert!"
                  : totalCorrect >= game.rounds.length * 2
                    ? "Nice Work"
                    : "Game Over"}
            </h2>

            <div className="mt-6">
              <p className="text-5xl font-black text-sky-300">
                {totalCorrect}
                <span className="text-2xl text-gray-500">
                  /{game.rounds.length * 4}
                </span>
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Total Correct
              </p>
            </div>

            {/* Round Breakdown */}
            <div className="mx-auto mt-8 max-w-sm space-y-3">
              {roundResults.map((result, i) => {
                const round = game.rounds[i];
                return (
                  <div
                    key={round.id}
                    className="rounded-xl border border-[#1e2a45] bg-[#0f1729] p-3"
                  >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Round {i + 1} — {result.score}/4
                    </p>
                    <div className="space-y-1">
                      {FIELDS.map((field) => (
                        <div
                          key={field.key}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            result.results[field.key]
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <span>
                            {field.label}: {round.answers[field.key]}
                          </span>
                          <span>{result.results[field.key] ? "✓" : "✗"}</span>
                        </div>
                      ))}
                    </div>
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
        ) : null}
      </section>
    </div>
  );
}
